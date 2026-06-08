// app/appFind.js — 幫我找：12 條跨模組快速查詢

const FIND_CATEGORIES = {
  inventory: "📦 庫存",
  finance:   "💰 財務",
  sales:     "📊 銷售",
  documents: "📋 單據"
};

const FIND_QUERIES = [
  // ── 庫存 ──────────────────────────────────────────────────────────────────
  {
    id: "low-stock", cat: "inventory", label: "低庫存商品",
    hint: "低庫存 庫存不足 安全庫存 警示",
    run(s) {
      return s.inventoryReport({ lowStockOnly: true }).map((r) => ({
        title: r.product.name,
        meta: `SKU ${r.product.sku} ／ 倉庫 ${r.warehouse.name} ／ 庫存 ${r.onHand} ${r.product.unit} ／ 安全庫存 ${r.product.safetyStock}`,
        tag: "danger", tagLabel: "低庫存"
      }));
    }
  },
  {
    id: "zero-stock", cat: "inventory", label: "零庫存商品",
    hint: "零庫存 缺貨 無庫存 空",
    run(s) {
      return s.inventoryReport()
        .filter((r) => r.onHand <= 0 && r.product.active)
        .map((r) => ({
          title: r.product.name,
          meta: `SKU ${r.product.sku} ／ 倉庫 ${r.warehouse.name} ／ 庫存 0`,
          tag: "danger", tagLabel: "缺貨"
        }));
    }
  },
  {
    id: "loan-out", cat: "inventory", label: "借出中庫存",
    hint: "借出 借貨 未還 loan 在外",
    run(s) {
      const loanWhs = s.listWarehouses({ activeOnly: false }).filter((w) => w.type === "loan");
      return loanWhs.flatMap((wh) =>
        s.inventoryReport({ warehouseId: wh.id })
          .filter((r) => r.onHand > 0)
          .map((r) => ({
            title: r.product.name,
            meta: `倉庫 ${wh.name} ／ 數量 ${r.onHand} ${r.product.unit}`,
            tag: "warn", tagLabel: "借出中"
          }))
      );
    }
  },
  // ── 財務 ──────────────────────────────────────────────────────────────────
  {
    id: "overdue-ar", cat: "finance", label: "逾期應收",
    hint: "逾期 應收 沒收錢 未收款 overdue",
    run(s, today) {
      return s.listReceivables({ status: "open" })
        .filter((r) => r.dueDate && r.dueDate < today)
        .map((r) => ({
          title: r.customer || r.sourceDocumentNo,
          meta: `單號 ${r.sourceDocumentNo} ／ 到期 ${r.dueDate} ／ 逾期 ${Math.floor((new Date(today) - new Date(r.dueDate)) / 86400000)} 天`,
          tag: "danger", tagLabel: "逾期",
          amount: r.amount - r.paidAmount
        }));
    }
  },
  {
    id: "open-ar", cat: "finance", label: "應收未結",
    hint: "應收 未結 未收 待收",
    run(s) {
      return s.listReceivables({ status: "open" }).map((r) => ({
        title: r.customer || r.sourceDocumentNo,
        meta: `單號 ${r.sourceDocumentNo} ／ 到期 ${r.dueDate}`,
        tag: "", tagLabel: "",
        amount: r.amount - r.paidAmount
      }));
    }
  },
  {
    id: "overdue-ap", cat: "finance", label: "逾期應付",
    hint: "逾期 應付 未付款 欠款",
    run(s, today) {
      return s.listPayables({ status: "open" })
        .filter((r) => r.dueDate && r.dueDate < today)
        .map((r) => ({
          title: r.supplier || r.sourceDocumentNo,
          meta: `單號 ${r.sourceDocumentNo} ／ 到期 ${r.dueDate} ／ 逾期 ${Math.floor((new Date(today) - new Date(r.dueDate)) / 86400000)} 天`,
          tag: "danger", tagLabel: "逾期",
          amount: -(r.amount - r.paidAmount)
        }));
    }
  },
  {
    id: "open-ap", cat: "finance", label: "應付未結",
    hint: "應付 未結 未付 待付",
    run(s) {
      return s.listPayables({ status: "open" }).map((r) => ({
        title: r.supplier || r.sourceDocumentNo,
        meta: `單號 ${r.sourceDocumentNo} ／ 到期 ${r.dueDate}`,
        tag: "", tagLabel: "",
        amount: -(r.amount - r.paidAmount)
      }));
    }
  },
  // ── 銷售 ──────────────────────────────────────────────────────────────────
  {
    id: "no-sales", cat: "sales", label: "本月零銷售商品",
    hint: "賣不出去 滯銷 零銷售 滯料 動不了",
    run(s, today) {
      const month = today.slice(0, 7);
      const soldIds = new Set(
        s.listSales({ month, includeVoided: false })
          .filter((d) => ["confirmed", "amended"].includes(d.status || "confirmed"))
          .flatMap((d) => (d.lines || []).map((l) => l.productId))
      );
      return s.listProducts()
        .filter((p) => p.active && !soldIds.has(p.id))
        .map((p) => ({
          title: p.name,
          meta: `SKU ${p.sku} ／ 本月 ${month} 無確認銷售`,
          tag: "warn", tagLabel: "零銷售"
        }));
    }
  },
  {
    id: "held-commission", cat: "sales", label: "業績獎金保留中",
    hint: "業績 獎金 保留 held 未入帳",
    run(s) {
      const results = [];
      s.listSales({ includeVoided: false }).forEach((doc) => {
        (doc.lines || []).filter((l) => l.commissionStatus === "held").forEach((l) => {
          const p = s.findProduct(l.productId);
          results.push({
            title: doc.customerName || doc.documentNo,
            meta: `單號 ${doc.documentNo} ／ 日期 ${doc.date} ／ ${p ? p.name : `商品 #${l.productId}`} × ${l.quantity}`,
            tag: "warn", tagLabel: "保留中"
          });
        });
      });
      return results;
    }
  },
  {
    id: "high-return-rate", cat: "sales", label: "高退貨率商品（本月≥30%）",
    hint: "退貨 高退 退回 退貨率 問題商品",
    run(s, today) {
      const month = today.slice(0, 7);
      const sold = {};
      s.listSales({ month, includeVoided: false })
        .filter((d) => ["confirmed", "amended"].includes(d.status || "confirmed"))
        .flatMap((d) => d.lines || [])
        .forEach((l) => { sold[l.productId] = (sold[l.productId] || 0) + l.quantity; });
      const returned = {};
      s.listReturns({ documentType: "salesReturn" })
        .filter((r) => r.date.slice(0, 7) === month)
        .forEach((r) => { returned[r.productId] = (returned[r.productId] || 0) + r.quantity; });
      return Object.keys(returned)
        .filter((pid) => sold[pid] && returned[pid] / sold[pid] >= 0.3)
        .map((pid) => {
          const rate = Math.round(returned[pid] / sold[pid] * 100);
          const p = s.findProduct(Number(pid));
          return {
            title: p ? p.name : `商品 #${pid}`,
            meta: `本月銷售 ${sold[pid]} ／ 退貨 ${returned[pid]} ／ 退貨率 ${rate}%`,
            tag: rate >= 50 ? "danger" : "warn", tagLabel: `${rate}% 退貨`
          };
        });
    }
  },
  // ── 單據 ──────────────────────────────────────────────────────────────────
  {
    id: "draft-docs", cat: "documents", label: "草稿未提交",
    hint: "草稿 未提交 draft 未完成",
    run(s) {
      const purchases = s.listPurchases({ includeVoided: false }).filter((d) => d.status === "draft");
      const sales = s.listSales({ includeVoided: false }).filter((d) => d.status === "draft");
      return [
        ...purchases.map((d) => ({ title: `進貨 ${d.documentNo}`, meta: `日期 ${d.date} ／ 供應商 ${d.supplierName || "未填"}`, tag: "neutral", tagLabel: "草稿" })),
        ...sales.map((d) => ({ title: `銷售 ${d.documentNo}`, meta: `日期 ${d.date} ／ 客戶 ${d.customerName || "未填"}`, tag: "neutral", tagLabel: "草稿" }))
      ];
    }
  },
  {
    id: "pending-approval", cat: "documents", label: "送審待核准",
    hint: "送審 待核 審核中 submitted approved 未確認",
    run(s) {
      const statuses = ["submitted", "approved"];
      const purchases = s.listPurchases({ includeVoided: false }).filter((d) => statuses.includes(d.status));
      const sales = s.listSales({ includeVoided: false }).filter((d) => statuses.includes(d.status));
      const labels = { submitted: "送審中", approved: "待確認" };
      return [
        ...purchases.map((d) => ({ title: `進貨 ${d.documentNo}`, meta: `日期 ${d.date} ／ 供應商 ${d.supplierName || "未填"}`, tag: "warn", tagLabel: labels[d.status] || d.status })),
        ...sales.map((d) => ({ title: `銷售 ${d.documentNo}`, meta: `日期 ${d.date} ／ 客戶 ${d.customerName || "未填"}`, tag: "warn", tagLabel: labels[d.status] || d.status }))
      ];
    }
  }
];

let activeFindQueryId = null;

function bindFindHandlers() {
  document.querySelector("#find-query").addEventListener("input", renderFindChips);
  document.querySelector("#find-chips").addEventListener("click", (event) => {
    const btn = event.target.closest("[data-find-id]");
    if (!btn) { return; }
    activeFindQueryId = btn.dataset.findId;
    renderFindChips();
    renderFindResults();
  });
}

function renderFind() {
  renderFindChips();
  renderFindResults();
}

function renderFindChips() {
  const q = ((document.querySelector("#find-query") || {}).value || "").trim().toLowerCase();
  const visible = q
    ? FIND_QUERIES.filter((qd) => qd.label.toLowerCase().includes(q) || qd.hint.toLowerCase().includes(q))
    : FIND_QUERIES;
  const byCategory = {};
  visible.forEach((qd) => { if (!byCategory[qd.cat]) byCategory[qd.cat] = []; byCategory[qd.cat].push(qd); });
  document.querySelector("#find-chips").innerHTML = Object.keys(FIND_CATEGORIES)
    .filter((cat) => byCategory[cat])
    .map((cat) => `
      <div class="find-row">
        <span class="find-cat-label">${escapeHtml(FIND_CATEGORIES[cat])}</span>
        ${byCategory[cat].map((qd) => `<button class="find-chip${activeFindQueryId === qd.id ? " is-active" : ""}" type="button" data-find-id="${escapeAttr(qd.id)}">${escapeHtml(qd.label)}</button>`).join("")}
      </div>
    `).join("") || `<div class="empty">找不到符合的條件，換個關鍵字試試。</div>`;
}

function renderFindResults() {
  const countEl = document.querySelector("#find-result-count");
  const resultEl = document.querySelector("#find-results");
  if (!activeFindQueryId) {
    if (countEl) { countEl.textContent = ""; }
    if (resultEl) { resultEl.innerHTML = `<div class="empty">點選上方條件，立即查找。</div>`; }
    return;
  }
  const qd = FIND_QUERIES.find((q) => q.id === activeFindQueryId);
  if (!qd) { return; }
  const results = qd.run(store, today);
  if (countEl) { countEl.textContent = `${formatCount(results.length)} ${t("common.countUnit", "筆")}`; }
  if (!resultEl) { return; }
  resultEl.innerHTML = results.length
    ? results.map((r) => `
        <article class="record-card">
          <div>
            <strong>${escapeHtml(r.title)}${r.tag ? ` <span class="badge ${r.tag}">${escapeHtml(r.tagLabel)}</span>` : ""}</strong>
            <div class="record-meta">${escapeHtml(r.meta)}</div>
          </div>
          ${r.amount != null ? `<div class="record-side"><span class="amount ${r.amount >= 0 ? "income" : "expense"}">${formatRestrictedMoney(Math.abs(r.amount), r.amount >= 0 ? "viewSalesRevenue" : "viewCost")}</span></div>` : ""}
        </article>
      `).join("")
    : `<div class="empty">沒有符合結果，一切正常！</div>`;
}
