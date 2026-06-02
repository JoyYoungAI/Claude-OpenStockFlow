// Reports, audit logs, learning, stock, overview

function bindReportHandlers() {
  reportMonth.addEventListener("change", renderReports);
  movementQuery.addEventListener("input", renderReports);
  auditQuery.addEventListener("input", renderAuditLogs);
  auditMonth.addEventListener("change", renderAuditLogs);
  auditActionFilter.addEventListener("change", renderAuditLogs);
  auditHighRiskOnly.addEventListener("change", renderAuditLogs);

  auditExportButton.addEventListener("click", () => {
    if (!requireAction("exportAuditLogs")) { return; }
    const logs = store.listAuditLogs(currentAuditOptions());
    recordAudit("export", { entityType: "auditLog", summary: "匯出稽核 CSV", after: currentAuditOptions(), riskLevel: "high" });
    saveState();
    downloadCsv("stockflow-audit-log.csv", toCsv(formatAuditCsvRows(logs)));
    setStatus("已匯出稽核 CSV。");
    renderAuditLogs();
  });

  reportPrintButton.addEventListener("click", () => {
    recordAudit("print", {
      entityType: "report", summary: "列印營運報表",
      after: { month: reportMonth.value, movementQuery: movementQuery.value }, riskLevel: "high"
    });
    saveState();
    window.print();
  });

  stockQuery.addEventListener("input", renderStock);
  categoryFilter.addEventListener("change", renderStock);
  warehouseFilter.addEventListener("change", renderStock);
  stockSort.addEventListener("change", renderStock);
  lowStockOnly.addEventListener("change", renderStock);

  learningQuery.addEventListener("input", renderLearning);
  learningTopicList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-learning-topic]");
    if (!button) { return; }
    activeLearningTopicId = button.dataset.learningTopic;
    renderLearning();
  });
  learningPrev.addEventListener("click", () => moveLearningTopic(-1));
  learningNext.addEventListener("click", () => moveLearningTopic(1));
}

function renderLearning() {
  const query = normalizeLearningQuery(learningQuery.value);
  const visibleTopics = learningTopics.filter((topic) => {
    if (!query) { return true; }
    const searchable = [topic.title, topic.summary, topic.sections.map((section) => [section.heading, section.body, (section.items || []).join(" ")].join(" ")).join(" ")].join(" ");
    return normalizeLearningQuery(searchable).includes(query);
  });
  if (!visibleTopics.some((topic) => topic.id === activeLearningTopicId)) {
    activeLearningTopicId = (visibleTopics[0] || learningTopics[0]).id;
  }
  const activeTopic = learningTopics.find((topic) => topic.id === activeLearningTopicId) || learningTopics[0];
  learningTopicList.innerHTML = visibleTopics.length
    ? visibleTopics.map((topic) => `<button class="learning-topic-button ${topic.id === activeTopic.id ? "is-active" : ""}" type="button" data-learning-topic="${escapeAttr(topic.id)}">${escapeHtml(topic.title)}</button>`).join("")
    : `<div class="empty">${t("emptyStates.noLearningTopics", "沒有符合條件的教學章節。")}</div>`;
  learningContent.innerHTML = `
    <article class="learning-hero">
      <span class="badge neutral">${t("learning.moduleLabel", "即時同步教學")}</span>
      <h2>${escapeHtml(activeTopic.title)}</h2>
      <p>${escapeHtml(activeTopic.summary)}</p>
    </article>
    ${activeTopic.sections.map(renderLearningSection).join("")}
  `;
  const topicIndex = learningTopics.findIndex((topic) => topic.id === activeTopic.id);
  learningPrev.disabled = topicIndex <= 0;
  learningNext.disabled = topicIndex >= learningTopics.length - 1;
  learningPrev.title = learningPrev.disabled ? t("learning.noPrevious", "已是第一章。") : learningTopics[topicIndex - 1].title;
  learningNext.title = learningNext.disabled ? t("learning.noNext", "已是最後一章。") : learningTopics[topicIndex + 1].title;
  learningChecklistContainer.innerHTML = `<ul>${learningChecklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderLearningSection(section) {
  const className = section.type === "danger" ? "learning-section learning-warning learning-danger"
    : section.type === "warning" ? "learning-section learning-warning" : "learning-section";
  const body = section.body ? `<p>${escapeHtml(section.body)}</p>` : "";
  const items = section.items && section.items.length ? `<ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "";
  return `<section class="${className}"><h3>${escapeHtml(section.heading)}</h3>${body}${items}</section>`;
}

function moveLearningTopic(direction) {
  const currentIndex = learningTopics.findIndex((topic) => topic.id === activeLearningTopicId);
  const nextIndex = Math.min(Math.max(currentIndex + direction, 0), learningTopics.length - 1);
  activeLearningTopicId = learningTopics[nextIndex].id;
  renderLearning();
}

function normalizeLearningQuery(value) { return String(value || "").trim().toLowerCase(); }

function renderOverview() {
  const lowStockRows = store.inventoryReport({ lowStockOnly: true });
  const lowStockByProduct = Object.values(
    lowStockRows.reduce((acc, item) => {
      if (!acc[item.productId]) {
        acc[item.productId] = { product: item.product, onHand: 0 };
      }
      acc[item.productId].onHand += item.onHand;
      return acc;
    }, {})
  );
  document.querySelector("#overview-low-count").textContent = `${formatCount(lowStockByProduct.length)} ${t("common.itemUnit", "項")}`;
  document.querySelector("#low-stock-list").innerHTML = lowStockByProduct.length
    ? lowStockByProduct.map((item) => `
      <article class="compact-card">
        <strong>${escapeHtml(item.product.name)}</strong>
        <span class="compact-meta">${escapeHtml(item.product.sku)} / ${t("common.stock", "庫存")} ${formatQuantity(item.onHand)} ${escapeHtml(item.product.unit)} / ${t("fields.safetyStock", "安全庫存")} ${formatQuantity(item.product.safetyStock)}</span>
      </article>
    `).join("")
    : `<div class="empty">${t("emptyStates.noLowStock", "目前沒有低庫存商品。")}</div>`;

  const activities = store.listPurchases().slice(0, 3).map((item) => Object.assign({ kind: t("common.purchase", "進貨") }, item))
    .concat(store.listSales().slice(0, 3).map((item) => Object.assign({ kind: t("common.sale", "銷售") }, item)))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id).slice(0, 6);
  document.querySelector("#recent-activity").innerHTML = activities.length
    ? activities.map((item) => {
      const product = productName(item.productId);
      const amount = item.kind === "進貨" ? item.quantity * item.unitCost : item.quantity * item.unitPrice;
      const fieldName = item.kind === "進貨" ? "viewCost" : "viewSalesRevenue";
      return `<article class="compact-card"><strong>${item.kind} / ${escapeHtml(product)}</strong><span class="compact-meta">${formatDate(item.date)} / ${formatQuantity(item.quantity)} / ${formatRestrictedMoney(amount, fieldName)}</span></article>`;
    }).join("")
    : `<div class="empty">${t("emptyStates.noRecentActivity", "尚無進貨或銷售紀錄。")}</div>`;

  const ranking = store.grossProfitRanking(5);
  document.querySelector("#profit-ranking").innerHTML = ranking.length
    ? ranking.map((item, index) => `
      <article class="ranking-card">
        <strong>${index + 1}. ${escapeHtml(item.product.name)}</strong>
        <span class="compact-meta">${t("common.revenue", "收入")} ${formatRestrictedMoney(item.revenue, "viewSalesRevenue")}</span>
        <span class="compact-meta">${t("common.grossProfit", "毛利")} ${formatRestrictedMoney(item.grossProfit, "viewGrossProfit")}</span>
        <span class="compact-meta">${t("common.stock", "庫存")} ${formatQuantity(item.onHand)} ${escapeHtml(item.product.unit)}</span>
      </article>
    `).join("")
    : `<div class="empty">${t("emptyStates.noGrossProfitRanking", "尚無銷售資料可排行。")}</div>`;
}

function renderReports() {
  OpenStockFlowRenderers.renderReports({
    document, store, month: reportMonth.value, movementQuery: movementQuery.value,
    formatMoney, formatNumber, formatQuantity, formatCount, formatDate, formatPercent,
    escapeHtml, t, productName, warehouseName, movementBadge, canViewField, restrictedText
  });
}

function renderAuditLogs() {
  const logs = store.listAuditLogs ? store.listAuditLogs(currentAuditOptions()) : [];
  document.querySelector("#audit-count").textContent = `${formatCount(logs.length)} ${t("common.countUnit", "筆")}`;
  document.querySelector("#audit-table").innerHTML = logs.length
    ? logs.slice(0, 120).map((event) => `
      <tr>
        <td>${formatDate(event.occurredAt.slice(0, 10))}</td>
        <td><div class="row-title"><strong>${escapeHtml(event.actorName || t("common.localUser", "本機使用者"))}</strong><span>${escapeHtml(roleLabel(event.roleAtOperation))}</span></div></td>
        <td>${auditActionBadge(event.action)}</td>
        <td><div class="row-title"><strong>${escapeHtml(event.documentNo || event.entityId || "-")}</strong><span>${escapeHtml(event.entityType || "-")}</span></div></td>
        <td>${escapeHtml(event.summary || t("common.noNote", "無備註"))}</td>
        <td>${auditResultBadge(event.result)}</td>
        <td>${auditRiskBadge(event.riskLevel)}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="7" class="empty">尚無符合條件的稽核紀錄。</td></tr>`;
}

function currentAuditOptions() { return auditControl.currentAuditOptions(); }
function recordSensitiveRead(entityType, summary, after) { return auditControl.recordSensitiveRead(entityType, summary, after); }

function recordAudit(action, payload, persistNow) {
  if (!store || !store.recordAuditEvent) { return null; }
  const event = store.recordAuditEvent(Object.assign({}, payload, {
    action,
    actorId: currentUser.id,
    actorName: currentUser.name,
    actorEmployeeId: currentUser.employeeId || 0,
    actorDepartmentId: currentUser.departmentId || 0,
    roleAtOperation: currentUser.role
  }));
  if (event && persistNow && !dataStale) { saveState(); }
  return event;
}

function formatAuditCsvRows(logs) { return auditControl.formatAuditCsvRows(logs); }
function auditActionBadge(action) { return auditControl.auditActionBadge(action); }
function auditResultBadge(result) { return auditControl.auditResultBadge(result); }
function auditRiskBadge(riskLevel) { return auditControl.auditRiskBadge(riskLevel); }
function auditActionLabel(action) { return auditControl.auditActionLabel(action); }
function auditResultLabel(result) { return auditControl.auditResultLabel(result); }
function auditRiskLabel(riskLevel) { return auditControl.auditRiskLabel(riskLevel); }

function renderStock() {
  const rows = store.inventoryReport(currentStockOptions());
  const body = document.querySelector("#stock-table");
  body.innerHTML = rows.length
    ? rows.map((item) => `
      <tr>
        <td>${escapeHtml(item.product.sku)}</td>
        <td><div class="row-title"><strong>${escapeHtml(item.product.name)}</strong><span>${escapeHtml(item.product.unit)} / ${escapeHtml(item.warehouse ? item.warehouse.name : t("common.unassignedWarehouse", "未指定倉庫"))}</span></div></td>
        <td>${escapeHtml(item.warehouse ? item.warehouse.code : "-")}</td>
        <td>${escapeHtml(item.product.category)}</td>
        <td>${formatQuantity(item.onHand)}</td>
        <td>${formatQuantity(item.adjusted)}</td>
        <td>${formatQuantity(item.product.safetyStock)}</td>
        <td>${formatRestrictedMoney(item.stockValue, "viewStockValue")}</td>
        <td>${formatRestrictedMoney(item.revenue, "viewSalesRevenue")}</td>
        <td>${formatRestrictedMoney(item.grossProfit, "viewGrossProfit")}</td>
        <td>${item.lowStock ? `<span class="badge danger">${t("common.lowStock", "低庫存")}</span>` : `<span class="badge">${t("common.normal", "正常")}</span>`}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="11" class="empty">${t("emptyStates.noStockRows", "沒有符合條件的庫存資料。")}</td></tr>`;
}

function currentStockOptions() {
  return {
    query: stockQuery.value,
    category: categoryFilter.value,
    warehouseId: warehouseFilter.value,
    lowStockOnly: lowStockOnly.checked,
    sort: stockSort.value
  };
}
