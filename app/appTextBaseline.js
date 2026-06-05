function applyTextBaseline() {
  document.documentElement.lang = currentLanguage();
  document.title = t("app.title", "Claude-OpenStockFlow 進銷存系統");
  const headingText = t("app.heading", "進銷存系統");
  const heading = document.querySelector(".app-header h1");
  const versionBadge = document.querySelector("#app-version");
  if (heading && versionBadge) { heading.firstChild.textContent = `${headingText} `; }
  const navigationLabels = {
    overview: t("navigation.overview", "總覽"), masterdata: t("navigation.masterdata", "1 基本資料"),
    products: t("navigation.products", "2 商品管理"), purchases: t("navigation.purchases", "3 採購進貨"),
    sales: t("navigation.sales", "4 銷售出貨"), adjustments: t("navigation.adjustments", "5 盤點調整"),
    reports: t("navigation.reports", "6 庫存報表"), transfers: t("navigation.transfers", "E1 調撥"),
    finance: t("navigation.finance", "E2 財務"), learning: t("navigation.learning", "同步教學")
  };
  Object.entries(navigationLabels).forEach(([tabName, label]) => {
    const tab = document.querySelector(`[data-tab="${tabName}"]`);
    if (tab) { tab.textContent = label; tab.title = label; }
  });
  setTextAndTitle(refreshButton, null, t("tooltips.refresh", "重新載入畫面，保留目前已儲存資料。"));
  setTextAndTitle(learningButton, null, t("tooltips.learning", "開啟同步、備份、單據關聯與人肉驗證教學。"));
  setTextAndTitle(exportButton, null, t("tooltips.exportInventoryCsv", "依目前庫存報表篩選條件匯出 CSV。"));
  setTextAndTitle(resetButton, null, t("tooltips.resetSampleData", "重設為範例資料；目前瀏覽器內的資料會被取代。"));
  setTextAndTitle(backupExportButton, null, t("tooltips.exportBackup", "匯出完整 JSON 備份，可用於之後還原。"));
  setTextAndTitle(restoreButton, null, t("tooltips.restoreBackup", "用已選取的備份檔取代目前資料。"));
  refreshButton.classList.add("button-secondary");
  learningButton.classList.add("button-secondary");
  exportButton.classList.add("button-secondary");
  backupExportButton.classList.add("button-secondary");
  resetButton.classList.add("button-danger");
  restoreButton.classList.add("button-danger");
  applyStaticTextBaseline();
  applyFieldBaseline();
  applyPlaceholderBaseline();
}

function setTextAndTitle(element, text, title) {
  if (!element) { return; }
  if (text !== null && text !== undefined) { element.textContent = text; }
  element.title = title || "";
}

function confirmAction(key, values) {
  const message = interpolate(t(`confirmations.${key}`, ""), values || {});
  return !message || window.confirm(message);
}

function interpolate(template, values) {
  return String(template || "").replace(/\{(\w+)\}/g, (match, key) => Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match);
}

function applyStaticTextBaseline() {
  const textMap = [
    [".metrics .metric:nth-child(1) span", "common.active", "啟用商品"],
    [".metrics .metric:nth-child(2) span", "tables.stockValue", "庫存價值"],
    [".metrics .metric:nth-child(3) span", "reports.salesRevenue", "銷售收入"],
    [".metrics .metric:nth-child(4) span", "common.lowStock", "低庫存"],
    ['[data-view="overview"] .panel:nth-child(1) h2', "headings.lowStockReminder", "低庫存提醒"],
    ['[data-view="overview"] .panel:nth-child(2) h2', "headings.recentActivity", "最近活動"],
    ['[data-view="overview"] .panel:nth-child(2) .panel-head span', "subtitles.purchaseSale", "進貨 / 銷售"],
    ['[data-view="overview"] .single-panel h2', "headings.grossProfitRanking", "毛利排行"],
    ['[data-view="overview"] .single-panel .panel-head span', "subtitles.grossProfitSort", "依累計銷售毛利排序"],
    ['[data-view="products"] .panel:not(.form-panel) h2', "headings.productList", "商品列表"],
    ['#category-form h2', "headings.addCategory", "新增商品分類"],
    ['#category-form button[type="submit"]', "actions.addCategory", "新增分類"],
    ['#warehouse-form h2', "headings.addWarehouse", "新增倉庫"],
    ['#warehouse-form button[type="submit"]', "actions.addWarehouse", "新增倉庫"],
    ['#partner-form + .panel h2', "headings.partnerList", "往來對象列表"],
    ['#purchase-form h2', "headings.addPurchaseOrder", "新增進貨單"],
    ['#purchase-form button[type="submit"]', "actions.savePurchaseOrder", "儲存進貨單"],
    ['#purchase-form + .panel h2', "headings.purchaseRecords", "進貨紀錄"],
    ['#sale-form h2', "headings.addSaleOrder", "新增銷售單"],
    ['#sale-form button[type="submit"]', "actions.saveSaleOrder", "儲存銷售單"],
    ['#sale-form + .panel h2', "headings.saleRecords", "銷售紀錄"],
    ['#adjustment-form h2', "headings.addAdjustment", "新增盤點調整"],
    ['#adjustment-form button[type="submit"]', "actions.saveAdjustment", "儲存盤點調整"],
    ['#adjustment-form + .panel h2', "headings.adjustmentRecords", "盤點調整紀錄"],
    ['#transfer-form h2', "headings.addTransferOrder", "新增調撥單"],
    ['#transfer-form button[type="submit"]', "actions.saveTransferOrder", "儲存調撥單"],
    ['#transfer-form + .panel h2', "headings.transferRecords", "調撥紀錄"],
    ['#payment-form h2', "headings.addPayment", "登錄收付款"],
    ['#payment-form button[type="submit"]', "actions.savePayment", "儲存收付款"],
    ['#payment-form + .panel h2', "headings.receivablePayable", "應收 / 應付"],
    ['#preferences-form h2', "headings.preferences", "語系、格式與報表設定"],
    ['#preferences-form button[type="submit"]', "actions.savePreferences", "儲存設定"],
    ['#preferences-form + .panel h2', "headings.paymentRecords", "收付款紀錄"],
    ['#report-header-text', "subtitles.reportHeaderText", "彙整進貨、銷售、庫存、調撥與財務資料。"],
    ['.report-month span', "fields.reportMonth", "報表月份"],
    ['#finance-report-label', "common.allPeriod", "全部期間"],
    ['#learning-prev', "actions.previousChapter", "上一章"],
    ['#learning-next', "actions.nextChapter", "下一章"]
  ];
  textMap.forEach(([selector, path, fallback]) => setText(selector, t(path, fallback)));
  setPanelHeading("#warehouse-summary-cards", t("headings.warehouseStockSummary", "倉庫庫存摘要"), t("subtitles.warehouseStockSummary", "依倉庫彙總庫存狀態"));
  setPanelHeading("#warehouse-transfer-cards", t("headings.warehouseTransferSummary", "倉庫調撥摘要"), t("subtitles.warehouseTransferSummary", "各倉庫調入、調出與淨流量"));
  setPanelHeading("#warehouse-distribution-list", t("headings.productWarehouseDistribution", "商品跨倉分布"), t("subtitles.productWarehouseDistribution", "各商品在不同倉庫的庫存"));
  setPanelHeading("#report-sales-list", t("headings.salesDetail", "銷售明細"), null);
  setPanelHeading("#report-purchase-list", t("headings.purchaseDetail", "進貨明細"), null);
  setPanelHeading("#report-profit-ranking", t("headings.grossProfitRankingReport", "毛利排行報表"), t("subtitles.grossProfitSort", "依累計銷售毛利排序"));
  setPanelHeading("#movement-table", t("headings.stockMovementDetail", "庫存異動明細"), null);
  setPanelHeading("#stock-table", t("headings.stockReport", "庫存報表"), null);
  setReportCardsText();
  setTableHeaders();
  setSelectOptionsText();
}

function setPanelHeading(contentSelector, heading, subtitle) {
  const content = document.querySelector(contentSelector);
  const panel = content ? content.closest(".panel") : null;
  const head = panel ? panel.querySelector(".panel-head") : null;
  if (!head) { return; }
  const title = head.querySelector("h2");
  if (title) { title.textContent = heading; }
  const meta = head.querySelector("span");
  if (meta && subtitle !== null) { meta.textContent = subtitle; }
}

function setReportCardsText() {
  const reportCardMap = [
    ["#finance-receivable-balance", "reports.receivableBalance", "應收餘額"],
    ["#finance-payable-balance", "reports.payableBalance", "應付餘額"],
    ["#finance-cash-in", "reports.cashIn", "本期收款"],
    ["#finance-cash-out", "reports.cashOut", "本期付款"],
    ["#report-receivable-balance", "reports.receivableOpen", "應收未結"],
    ["#report-payable-balance", "reports.payableOpen", "應付未結"],
    ["#report-cash-in", "reports.cashFlowIn", "現金流入"],
    ["#report-cash-out", "reports.cashFlowOut", "現金流出"],
    ["#report-sales-revenue", "reports.salesRevenue", "銷售收入"],
    ["#report-purchase-cost", "reports.purchaseCost", "進貨成本"],
    ["#report-gross-profit", "common.grossProfit", "毛利"],
    ["#report-low-stock", "reports.lowStockItems", "低庫存項目"]
  ];
  reportCardMap.forEach(([valueSelector, path, fallback]) => {
    const card = document.querySelector(valueSelector);
    const label = card && card.parentElement ? card.parentElement.querySelector("span") : null;
    if (label) { label.textContent = t(path, fallback); }
  });
}

function setTableHeaders() {
  const tableHeaderMap = [
    ["#product-table", ["sku", "product", "category", "cost", "price", "status", "actions"]],
    ["#category-table", ["code", "name", "sortOrder", "note", "status", "actions"]],
    ["#warehouse-table", ["code", "name", "type", "note", "status", "actions"]],
    ["#partner-table", ["type", "name", "contact", "phone", "status", "actions"]],
    ["#movement-table", ["date", "movementType", "documentProduct", "movementQuantity", "amount", "party", "note"]],
    ["#stock-table", ["sku", "product", "warehouse", "category", "stock", "adjusted", "safetyStock", "stockValue", "revenue", "grossProfit", "status"]]
  ];
  tableHeaderMap.forEach(([bodySelector, keys]) => {
    const table = document.querySelector(bodySelector) && document.querySelector(bodySelector).closest("table");
    if (!table) { return; }
    table.querySelectorAll("thead th").forEach((cell, index) => { const key = keys[index]; if (key) { cell.textContent = t(`tables.${key}`, cell.textContent); } });
  });
}

function setSelectOptionsText() {
  setOptionText("#partner-role-filter", "", t("common.all", "全部") + t("fields.type", "類型"));
  setOptionText("#partner-role-filter", "supplier", t("common.supplier", "供應商"));
  setOptionText("#partner-role-filter", "customer", t("common.customer", "客戶"));
  setOptionText('#payment-direction option[value="in"]', null, t("common.paymentIn", "收款"));
  setOptionText('#payment-direction option[value="out"]', null, t("common.paymentOut", "付款"));
}

function applyFieldBaseline() {
  const fields = [
    ["#product-form", "sku", "fields.sku", "SKU"], ["#product-form", "name", "fields.productName", "商品名稱"],
    ["#product-form", "category", "fields.category", "分類"], ["#product-form", "unit", "fields.unit", "單位"],
    ["#product-form", "cost", "fields.cost", "成本"], ["#product-form", "price", "fields.price", "售價"],
    ["#product-form", "safetyStock", "fields.safetyStock", "安全庫存"],
    ["#category-form", "code", "fields.categoryCode", "分類代碼"], ["#category-form", "name", "fields.categoryName", "分類名稱"],
    ["#category-form", "sortOrder", "fields.sortOrder", "排序"],
    ["#warehouse-form", "code", "fields.warehouseCode", "倉庫代碼"], ["#warehouse-form", "name", "fields.warehouseName", "倉庫名稱"],
    ["#warehouse-form", "type", "fields.type", "類型"],
    ["#partner-form", "role", "fields.type", "類型"], ["#partner-form", "name", "fields.name", "名稱"],
    ["#partner-form", "contact", "fields.contact", "聯絡人"], ["#partner-form", "phone", "fields.phone", "電話"],
    ["#purchase-form", "warehouseId", "fields.purchaseWarehouse", "進貨倉庫"],
    ["#purchase-form", "productId", "fields.firstProduct", "第 1 筆商品"],
    ["#purchase-form", "quantity", "fields.quantity", "數量"], ["#purchase-form", "unitCost", "fields.unitCost", "進貨單價"],
    ["#purchase-form", "productId2", "fields.secondProductOptional", "第 2 筆商品（選填）"],
    ["#purchase-form", "quantity2", "fields.secondQuantity", "第 2 筆數量"],
    ["#purchase-form", "unitCost2", "fields.secondUnitPrice", "第 2 筆單價"],
    ["#purchase-form", "supplierId", "common.supplier", "供應商"],
    ["#purchase-form", "createPayable", "fields.createPayable", "建立應付帳款"],
    ["#purchase-form", "dueDate", "fields.payableDueDate", "付款到期日"],
    ["#sale-form", "warehouseId", "fields.shippingWarehouse", "出貨倉庫"],
    ["#sale-form", "productId", "fields.firstProduct", "第 1 筆商品"],
    ["#sale-form", "quantity", "fields.quantity", "數量"], ["#sale-form", "unitPrice", "fields.unitPrice", "銷售單價"],
    ["#sale-form", "productId2", "fields.secondProductOptional", "第 2 筆商品（選填）"],
    ["#sale-form", "quantity2", "fields.secondQuantity", "第 2 筆數量"],
    ["#sale-form", "unitPrice2", "fields.secondUnitPrice", "第 2 筆單價"],
    ["#sale-form", "customerId", "common.customer", "客戶"],
    ["#sale-form", "createReceivable", "fields.createReceivable", "建立應收帳款"],
    ["#sale-form", "dueDate", "fields.receivableDueDate", "收款到期日"],
    ["#adjustment-form", "warehouseId", "fields.countWarehouse", "盤點倉庫"],
    ["#adjustment-form", "productId", "fields.product", "盤點商品"],
    ["#adjustment-form", "countedQuantity", "fields.countedQuantity", "實際盤點數量"],
    ["#adjustment-form", "reason", "fields.reason", "原因"],
    ["#transfer-form", "fromWarehouseId", "fields.sourceWarehouse", "來源倉庫"],
    ["#transfer-form", "toWarehouseId", "fields.targetWarehouse", "目的倉庫"],
    ["#transfer-form", "productId", "fields.firstProduct", "第 1 筆商品"],
    ["#transfer-form", "quantity", "fields.firstQuantity", "第 1 筆數量"],
    ["#transfer-form", "productId2", "fields.secondProductOptional", "第 2 筆商品（選填）"],
    ["#transfer-form", "quantity2", "fields.secondQuantity", "第 2 筆數量"],
    ["#payment-form", "direction", "fields.direction", "方向"],
    ["#payment-form", "targetId", "fields.paymentTarget", "沖帳對象"],
    ["#payment-form", "amount", "fields.amount", "金額"],
    ["#payment-form", "method", "fields.method", "方式"]
  ];
  fields.forEach(([formSelector, name, path, fallback]) => setFieldLabel(formSelector, name, t(path, fallback)));
  document.querySelectorAll('input[name="date"], input[name="note"]').forEach((input) => {
    const path = input.name === "date" ? "fields.date" : "fields.note";
    setInputLabel(input, t(path, input.name === "date" ? "日期" : "備註"));
  });
}

function applyPlaceholderBaseline() {
  const placeholders = [
    ["#product-query", "placeholders.productSearch", "搜尋 SKU / 名稱"],
    ["#category-query", "placeholders.codeNameSearch", "搜尋代碼 / 名稱"],
    ["#warehouse-query", "placeholders.warehouseSearch", "搜尋代碼 / 名稱 / 類型"],
    ["#partner-query", "placeholders.partnerSearch", "搜尋名稱 / 聯絡人"],
    ["#purchase-query", "placeholders.purchaseSearch", "搜尋商品 / 供應商"],
    ["#sale-query", "placeholders.saleSearch", "搜尋商品 / 客戶"],
    ["#adjustment-query", "placeholders.adjustmentSearch", "搜尋商品 / 單號 / 原因"],
    ["#transfer-query", "placeholders.transferSearch", "搜尋商品 / 倉庫 / 單號"],
    ["#finance-query", "placeholders.financeSearch", "搜尋客戶 / 供應商 / 單號"],
    ["#learning-query", "placeholders.learningSearch", "搜尋同步 / 備份 / 借出 / 應收"],
    ["#movement-query", "placeholders.movementSearch", "搜尋商品 / 對象 / 備註"],
    ['#payment-form [name="method"]', "placeholders.paymentMethod", "現金 / 匯款 / 支票"]
  ];
  placeholders.forEach(([selector, path, fallback]) => {
    const input = document.querySelector(selector);
    if (input) { input.placeholder = t(path, fallback); }
  });
}

function setText(selector, text) { const element = document.querySelector(selector); if (element) { element.textContent = text; } }
function setOptionText(selector, value, text) {
  const option = value === null ? document.querySelector(selector) : document.querySelector(`${selector} option[value="${value}"]`);
  if (option) { option.textContent = text; }
}
function setFieldLabel(formSelector, name, text) { const field = document.querySelector(`${formSelector} [name="${name}"]`); if (field) { setInputLabel(field, text); } }
function setInputLabel(input, text) { const label = input.closest("label"); const span = label ? label.querySelector("span") : null; if (span) { span.textContent = text; } input.title = text; }
