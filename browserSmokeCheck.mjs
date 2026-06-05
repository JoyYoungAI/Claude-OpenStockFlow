import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const cwd = process.cwd();
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const userDataDir = path.join(cwd, ".tmp-edge-smoke");
const useExistingEdge = process.env.SMOKE_EDGE_EXISTING === "1";
const port = Number(process.env.SMOKE_EDGE_PORT || 0) || (9700 + Math.floor(Math.random() * 200));
const targetUrl = `file:///${path.join(cwd, "index.html").replace(/\\/g, "/")}`;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitJson(url, attempts = 80) {
  let lastError;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
      lastError = new Error(`${response.status} ${response.statusText}`);
    } catch (error) {
      lastError = error;
    }
    await delay(250);
  }
  throw lastError || new Error(`Timed out waiting for ${url}`);
}

async function findPageTarget() {
  const targets = await waitJson(`http://127.0.0.1:${port}/json/list`);
  const page = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
  if (!page) throw new Error("Could not find an Edge page target");
  return page;
}

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();
  const events = [];
  ws.addEventListener("message", (message) => {
    const payload = JSON.parse(message.data);
    if (payload.id && pending.has(payload.id)) {
      const callbacks = pending.get(payload.id);
      pending.delete(payload.id);
      if (payload.error) callbacks.reject(new Error(JSON.stringify(payload.error)));
      else callbacks.resolve(payload.result || {});
      return;
    }
    if (payload.method) events.push(payload);
  });
  ws.addEventListener("close", () => {
    pending.forEach(({ reject }) => reject(new Error("WebSocket closed before command completed")));
    pending.clear();
  });
  return new Promise((resolve, reject) => {
    ws.addEventListener("error", () => reject(new Error("WebSocket connection failed")), { once: true });
    ws.addEventListener("open", () => resolve({
      events,
      send(method, params = {}) {
        const id = nextId;
        nextId += 1;
        ws.send(JSON.stringify({ id, method, params }));
        return new Promise((resolveCommand, rejectCommand) => {
          pending.set(id, { resolve: resolveCommand, reject: rejectCommand });
          setTimeout(() => {
            if (!pending.has(id)) return;
            pending.delete(id);
            rejectCommand(new Error(`Timed out waiting for CDP command: ${method}`));
          }, 5000);
        });
      },
      close() {
        ws.close();
      }
    }), { once: true });
  });
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result ? result.result.value : undefined;
}

function collectBadEvents(events) {
  return events.filter((event) => {
    if (event.method === "Runtime.exceptionThrown") return true;
    if (event.method === "Log.entryAdded") return ["error", "warning"].includes(event.params.entry.level);
    if (event.method === "Runtime.consoleAPICalled") return ["error", "warning"].includes(event.params.type);
    return false;
  }).map((event) => ({ method: event.method, params: event.params }));
}

let child;

try {
  if (!useExistingEdge) {
    await fs.rm(userDataDir, { recursive: true, force: true });
    await fs.mkdir(userDataDir, { recursive: true });
    child = spawn(edgePath, [
      "--headless=new",
      "--disable-gpu",
      "--disable-extensions",
      "--allow-file-access-from-files",
      "--remote-allow-origins=*",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${userDataDir}`,
      "about:blank"
    ], { stdio: "ignore" });
  }

  await waitJson(`http://127.0.0.1:${port}/json/version`);
  const target = await findPageTarget();
  const client = await connect(target.webSocketDebuggerUrl);
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Log.enable");
  await client.send("Page.navigate", { url: targetUrl });

  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    const ready = await evaluate(client, "document.readyState");
    const appReady = await evaluate(client, "Boolean(document.querySelector('#app-version') && document.querySelector('#app-version').textContent)");
    if (ready === "complete" && appReady) break;
    await delay(250);
  }
  await delay(1000);

  const smoke = await evaluate(client, `(() => {
    const scripts = Array.from(document.scripts).map((script) => script.getAttribute("src")).filter(Boolean);
    return {
      title: document.title,
      url: location.href,
      readyState: document.readyState,
      scriptCount: scripts.length,
      lastScript: scripts[scripts.length - 1] || null,
      appVersionText: document.querySelector("#app-version") ? document.querySelector("#app-version").textContent : null,
      statusText: document.querySelector("#status-line") ? document.querySelector("#status-line").textContent : null,
      activeTabCount: document.querySelectorAll(".tab.is-active").length,
      overviewActive: Boolean(document.querySelector("[data-view='overview'].is-active")),
      metricProducts: document.querySelector("#metric-products") ? document.querySelector("#metric-products").textContent : null,
      globals: {
        createInventoryStore: typeof window.createInventoryStore,
        OpenStockFlowModels: typeof window.OpenStockFlowModels,
        OpenStockFlowStorage: typeof window.OpenStockFlowStorage,
        formatMoney: typeof window.formatMoney,
        applyTextBaseline: typeof window.applyTextBaseline,
        documentStatusBadge: typeof window.documentStatusBadge,
        renderPurchases: typeof window.renderPurchases
      },
      loaderSources: scripts.filter((src) => src.includes(".js?v="))
    };
  })()`);
  const badEvents = collectBadEvents(client.events);
  client.close();

  const result = { ok: badEvents.length === 0, smoke, badEventCount: badEvents.length, badEvents };
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
} finally {
  if (child && !child.killed) child.kill();
  await delay(500);
  if (!useExistingEdge) {
    const resolved = path.resolve(userDataDir);
    if (!resolved.startsWith(path.resolve(cwd))) {
      throw new Error(`Refusing to delete outside workspace: ${resolved}`);
    }
    await fs.rm(resolved, { recursive: true, force: true });
  }
}
