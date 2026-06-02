const appVersion = "1.17.2";
const assetVersion = "1.17.2";
const today = new Date().toISOString().slice(0, 10);
const sampleDocumentMonth = today.slice(0, 7).replace("-", "");
const accessRoleStorageKey = "stockflow-current-role-v1";
const currentEmployeeStorageKey = "stockflow-current-employee-v1";
const seedState = {
  departments: [
    { id: 1, code: "ADM", name: "管理部", type: "admin", managerEmployeeId: 1, active: true, note: "系統管理與最終核准" },
    { id: 2, code: "SALES", name: "銷售部", type: "sales", managerEmployeeId: 3, active: true, note: "銷售與客戶服務" },
    { id: 3, code: "PUR", name: "採購部", type: "purchasing", managerEmployeeId: 5, active: true, note: "採購與供應商管理" },
    { id: 4, code: "WH", name: "倉管部", type: "warehouse", managerEmployeeId: 7, active: true, note: "入出庫、盤點與調撥" },
    { id: 5, code: "FIN", name: "財務部", type: "finance", managerEmployeeId: 8, active: true, note: "應收應付與收付款" },
    { id: 6, code: "AUD", name: "稽核室", type: "audit", managerEmployeeId: 9, active: true, note: "查核與稽核追蹤" }
  ],
  employees: [
    { id: 1, employeeNo: "E-OWNER", name: "本機管理者", departmentId: 1, role: "owner", active: true, canLogin: true, note: "預設管理者" },
    { id: 2, employeeNo: "S-001", name: "小明", departmentId: 2, role: "sales", managerEmployeeId: 3, active: true, canLogin: true, note: "銷售人員" },
    { id: 3, employeeNo: "S-MGR", name: "大頭", departmentId: 2, role: "sales", active: true, canLogin: true, note: "銷售主管" },
    { id: 4, employeeNo: "P-001", name: "採購同事", departmentId: 3, role: "purchasing", managerEmployeeId: 5, active: true, canLogin: true, note: "採購人員" },
    { id: 5, employeeNo: "P-MGR", name: "採購主管", departmentId: 3, role: "purchasing", active: true, canLogin: true, note: "採購主管" },
    { id: 6, employeeNo: "W-001", name: "倉管同事", departmentId: 4, role: "warehouse", managerEmployeeId: 7, active: true, canLogin: true, note: "倉管人員" },
    { id: 7, employeeNo: "W-MGR", name: "倉管主管", departmentId: 4, role: "warehouse", active: true, canLogin: true, note: "倉管主管" },
    { id: 8, employeeNo: "F-001", name: "財務同事", departmentId: 5, role: "finance", active: true, canLogin: true, note: "財務人員" },
    { id: 9, employeeNo: "A-001", name: "稽核同事", departmentId: 6, role: "auditor", active: true, canLogin: true, note: "稽核查詢" }
  ],
  permissionScopes: [
    { id: 1, employeeId: 3, scopeType: "department", departmentIds: [2], employeeIds: [], actions: ["submitSale", "createSale", "rejectSale", "reassignSaleOwner", "requestVoid", "createSalesReturn"], active: true },
    { id: 2, employeeId: 5, scopeType: "department", departmentIds: [3], employeeIds: [], actions: ["submitPurchase", "createPurchase", "rejectPurchase", "reassignPurchaseOwner", "requestVoid", "createPurchaseReturn"], active: true },
    { id: 3, employeeId: 7, scopeType: "department", departmentIds: [4], employeeIds: [], actions: ["confirmPurchase", "confirmSale", "stockAdjust", "transferStock"], active: true }
  ],
  productCategories: [
    { id: 1, code: "FOOD", name: "食品", sortOrder: 10, note: "日常販售商品", active: true },
    { id: 2, code: "SUPPLY", name: "用品", sortOrder: 20, note: "門市營運用品", active: true }
  ],
  warehouses: [
    { id: 1, code: "MAIN", name: "主倉", type: "warehouse", note: "預設倉庫", active: true },
    { id: 2, code: "STORE", name: "門市", type: "store", note: "前台銷售點", active: true },
    { id: 3, code: "LOAN", name: "借出中", type: "loan", note: "借貨測試暫存，不視為可售庫存", active: true },
    { id: 4, code: "INSPECT", name: "待驗區", type: "inspection", note: "客戶歸還後，倉庫確認前暫存", active: true }
  ],
  products: [
    { id: 1, sku: "P-COF-001", name: "精品咖啡豆", category: "食品", unit: "包", cost: 260, price: 450, safetyStock: 5, active: true },
    { id: 2, sku: "P-MUG-002", name: "陶瓷馬克杯", category: "用品", unit: "個", cost: 120, price: 280, safetyStock: 8, active: true },
    { id: 3, sku: "P-TEA-003", name: "冷泡茶包", category: "食品", unit: "盒", cost: 95, price: 180, safetyStock: 10, active: true }
  ],
  partners: [
    { id: 1, role: "supplier", name: "咖啡供應商", contact: "林小姐", phone: "02-2345-1000", note: "咖啡豆主要來源", active: true },
    { id: 2, role: "supplier", name: "陶瓷工坊", contact: "陳先生", phone: "02-2345-2000", note: "杯具供應商", active: true },
    { id: 3, role: "customer", name: "門市客戶", contact: "", phone: "", note: "一般零售客戶", active: true },
    { id: 4, role: "customer", name: "批發客戶", contact: "王小姐", phone: "09-0000-0000", note: "固定採購客戶", active: true }
  ],
  purchases: [
    { id: 1, productId: 1, warehouseId: 1, quantity: 18, unitCost: 260, supplier: "咖啡供應商", date: today, note: "補貨進貨，產生應付帳款", documentNo: `PO-${sampleDocumentMonth}-001`, ownerEmployeeId: 4, ownerDepartmentId: 3, createdByEmployeeId: 4 },
    { id: 2, productId: 2, warehouseId: 1, quantity: 12, unitCost: 120, supplier: "陶瓷工坊", date: today, note: "門市陳列用品，含借出示範庫存", documentNo: `PO-${sampleDocumentMonth}-002`, ownerEmployeeId: 4, ownerDepartmentId: 3, createdByEmployeeId: 4 },
    { id: 3, productId: 3, warehouseId: 1, quantity: 20, unitCost: 95, supplier: "茶品供應商", date: today, note: "新品補貨", documentNo: `PO-${sampleDocumentMonth}-003`, ownerEmployeeId: 4, ownerDepartmentId: 3, createdByEmployeeId: 4 }
  ],
  sales: [
    { id: 1, productId: 1, warehouseId: 1, quantity: 13, unitPrice: 450, customer: "門市客戶", date: today, note: "一般零售出貨", documentNo: `SO-${sampleDocumentMonth}-001`, ownerEmployeeId: 2, ownerDepartmentId: 2, createdByEmployeeId: 2 },
    { id: 2, productId: 2, warehouseId: 1, quantity: 3, unitPrice: 280, customer: "門市客戶", date: today, note: "一般零售出貨", documentNo: `SO-${sampleDocumentMonth}-002`, ownerEmployeeId: 2, ownerDepartmentId: 2, createdByEmployeeId: 2 },
    { id: 3, productId: 3, warehouseId: 1, quantity: 5, unitPrice: 180, customer: "批發客戶", date: today, note: "批發出貨，應收未收回前獎金保留", documentNo: `SO-${sampleDocumentMonth}-003`, ownerEmployeeId: 2, ownerDepartmentId: 2, createdByEmployeeId: 2 },
    { id: 4, productId: 2, warehouseId: 3, quantity: 1, unitPrice: 280, customer: "批發客戶", date: today, note: `由 LOAN-${sampleDocumentMonth}-001 借出轉出貨；業務：陳業務；獎金狀態 held，待收款後釋放`, documentNo: `SO-${sampleDocumentMonth}-004`, ownerEmployeeId: 2, ownerDepartmentId: 2, createdByEmployeeId: 2 }
  ],
  adjustments: [
    { id: 1, productId: 2, warehouseId: 1, quantity: -1, reason: "盤點差異", date: today, note: "展示損耗", documentNo: `ADJ-${sampleDocumentMonth}-001` }
  ],
  transfers: [
    { id: 1, productId: 2, fromWarehouseId: 1, toWarehouseId: 3, quantity: 2, date: today, note: "借出單：批發客戶借貨測試，尚未產生應收", documentNo: `LOAN-${sampleDocumentMonth}-001` },
    { id: 2, productId: 2, fromWarehouseId: 3, toWarehouseId: 4, quantity: 1, date: today, note: `借出歸還：關聯 LOAN-${sampleDocumentMonth}-001，倉庫確認前停在待驗區`, documentNo: `LRTN-${sampleDocumentMonth}-001` }
  ],
  receivables: [
    { id: 1, sourceType: "sale", sourceDocumentNo: `SO-${sampleDocumentMonth}-003`, customer: "批發客戶", amount: 900, paidAmount: 0, dueDate: today, status: "open", note: "批發出貨應收，未收回前業績獎金保留" },
    { id: 2, sourceType: "sale", sourceDocumentNo: `SO-${sampleDocumentMonth}-004`, customer: "批發客戶", amount: 280, paidAmount: 0, dueDate: today, status: "open", note: `由 LOAN-${sampleDocumentMonth}-001 轉出貨；業務：陳業務；commissionStatus=held` }
  ],
  payables: [
    { id: 1, sourceType: "purchase", sourceDocumentNo: `PO-${sampleDocumentMonth}-001`, supplier: "咖啡供應商", amount: 4680, paidAmount: 2000, dueDate: today, status: "partial", note: "進貨產生應付，已部分付款" },
    { id: 2, sourceType: "purchase", sourceDocumentNo: `PO-${sampleDocumentMonth}-002`, supplier: "陶瓷工坊", amount: 1440, paidAmount: 0, dueDate: today, status: "open", note: "借出示範商品來源進貨" }
  ],
  payments: [
    { id: 1, direction: "out", targetType: "payable", targetId: 1, amount: 2000, method: "銀行轉帳", date: today, note: `支付 PO-${sampleDocumentMonth}-001 部分貨款` }
  ],
  preferences: {
    locale: "zh-Hant-TW", interfaceLanguage: "zh-Hant", quantityDecimals: 0, moneyDecimals: 0,
    thousandsSeparator: ",", decimalSeparator: ".", currencyCode: "TWD", currencySymbol: "$",
    currencyPosition: "prefix", reportTitle: "OpenStockFlow 營運報表", reportHeaderText: "OpenStockFlow",
    reportFooterText: "", showPrintDate: true, dateFormat: "YYYY-MM-DD"
  }
};

const learningTopics = [
  {
    id: "sync-basic", title: "進銷存同步基礎", summary: "了解資料如何即時同步與衝突處理。",
    sections: [
      { heading: "什麼是同步？", body: "本系統所有資料存在 localStorage，多分頁開啟時需手動重新整理以同步最新資料。", type: "info" },
      { heading: "操作建議", items: ["同一時間只在一個分頁進行寫入操作。", "若出現「資料已在其他視窗更新」警告，請先重新整理再繼續。"], type: "warning" }
    ]
  },
  {
    id: "backup-restore", title: "備份與還原", summary: "了解如何匯出與匯入完整備份。",
    sections: [
      { heading: "匯出備份", body: "點選「匯出完整備份」，系統會下載包含所有資料的 JSON 檔案。", type: "info" },
      { heading: "還原備份", body: "在基本資料頁面選擇備份 JSON 檔，確認後點「還原資料」，目前資料會被取代。", type: "danger" },
      { heading: "注意", items: ["備份檔包含所有進銷存、財務與稽核紀錄。", "還原後無法撤銷，請確認備份檔來源正確。"], type: "warning" }
    ]
  },
  {
    id: "loan-flow", title: "借出與歸還流程", summary: "了解借貨如何追蹤，以及歸還後的倉庫流程。",
    sections: [
      { heading: "借出操作", body: "使用調撥單從主倉移至「借出中」倉庫，並在備註記錄借貨對象與目的。", type: "info" },
      { heading: "歸還操作", body: "歸還時從「借出中」調撥至「待驗區」，待倉管確認後再移回主倉。", type: "info" },
      { heading: "範例流程", items: [`LOAN-${sampleDocumentMonth}-001：從主倉借出 1 個馬克杯`, `LRTN-${sampleDocumentMonth}-001：借出歸還，移至待驗區`], type: "info" }
    ]
  },
  {
    id: "receivable-flow", title: "應收帳款流程", summary: "了解銷售如何產生應收，以及收款後的沖帳。",
    sections: [
      { heading: "建立應收", body: "銷售出貨時勾選「建立應收帳款」，系統自動產生對應的應收紀錄。", type: "info" },
      { heading: "收款沖帳", body: "在財務模組選擇「收款」方向，選擇對應應收項目，輸入金額後儲存。", type: "info" },
      { heading: "範例", body: `SO-${sampleDocumentMonth}-004 的應收註記含 commissionStatus=held，代表借出轉出貨後，獎金仍待收款或政策確認。`, type: "warning" }
    ]
  },
  {
    id: "checklist-guide", title: "人肉驗證清單說明", summary: "了解如何使用右側清單進行手動驗證。",
    sections: [
      { heading: "用途", body: "右側清單提供常見驗證項目，協助你在測試或上線前確認系統行為符合預期。", type: "info" },
      { heading: "建議步驟", items: ["依照清單逐項操作並觀察結果。", "如有異常，記錄單號與操作步驟，便於回報或排查。"], type: "info" }
    ]
  }
];

const learningChecklist = [
  `PO-${sampleDocumentMonth}-001：進貨 18 包咖啡豆，應付 $4,680，已付 $2,000`,
  `SO-${sampleDocumentMonth}-001：銷售 13 包咖啡豆，庫存應剩 5 包`,
  `LOAN-${sampleDocumentMonth}-001：借出 2 個馬克杯至借出中倉`,
  `SO-${sampleDocumentMonth}-004：馬克杯借出轉銷售，應收 $280`,
  `ADJ-${sampleDocumentMonth}-001：馬克杯盤點差異 -1`,
  "主倉馬克杯庫存 = 12 - 3 - 2 - 1 = 6 個",
  "低庫存提醒：咖啡豆安全庫存 5，實際庫存 5（邊界）"
];

const storage = OpenStockFlowStorage.createInventoryStorage({ seedState, appVersion, assetVersion });
const initialLoad = storage.loadState();
let store = createInventoryStore(initialLoad.state);
const accessControl = OpenStockFlowAccess.createInventoryAccess({
  getStore: () => store,
  getCurrentUser: () => currentUser
});
let activeTab = "overview";
let activeLearningTopicId = learningTopics[0].id;
let editingProductId = null;
let editingPartnerId = null;
let pendingRestoreState = null;
let dataStale = false;
let currentUser = loadCurrentUser();

const tabs = document.querySelectorAll("[data-tab]");
const views = document.querySelectorAll(".view");
const statusLine = document.querySelector("#status-line");
const productForm = document.querySelector("#product-form");
const productFormTitle = document.querySelector("#product-form-title");
const productSubmitButton = document.querySelector("#product-submit-button");
const cancelProductEdit = document.querySelector("#cancel-product-edit");
const partnerForm = document.querySelector("#partner-form");
const partnerFormTitle = document.querySelector("#partner-form-title");
const partnerSubmitButton = document.querySelector("#partner-submit-button");
const cancelPartnerEdit = document.querySelector("#cancel-partner-edit");
const categoryForm = document.querySelector("#category-form");
const warehouseForm = document.querySelector("#warehouse-form");
const departmentForm = document.querySelector("#department-form");
const employeeForm = document.querySelector("#employee-form");
const purchaseForm = document.querySelector("#purchase-form");
const saleForm = document.querySelector("#sale-form");
const adjustmentForm = document.querySelector("#adjustment-form");
const transferForm = document.querySelector("#transfer-form");
const paymentForm = document.querySelector("#payment-form");
const preferencesForm = document.querySelector("#preferences-form");
const paymentDirection = document.querySelector("#payment-direction");
const paymentTarget = document.querySelector("#payment-target");
const productQuery = document.querySelector("#product-query");
const productCategoryFilter = document.querySelector("#product-category-filter");
const categoryQuery = document.querySelector("#category-query");
const warehouseQuery = document.querySelector("#warehouse-query");
const departmentQuery = document.querySelector("#department-query");
const employeeQuery = document.querySelector("#employee-query");
const partnerQuery = document.querySelector("#partner-query");
const partnerRoleFilter = document.querySelector("#partner-role-filter");
const purchaseQuery = document.querySelector("#purchase-query");
const purchaseMonth = document.querySelector("#purchase-month");
const purchaseIncludeVoided = document.querySelector("#purchase-include-voided");
const saleQuery = document.querySelector("#sale-query");
const saleMonth = document.querySelector("#sale-month");
const saleIncludeVoided = document.querySelector("#sale-include-voided");
const adjustmentQuery = document.querySelector("#adjustment-query");
const adjustmentMonth = document.querySelector("#adjustment-month");
const transferQuery = document.querySelector("#transfer-query");
const transferMonth = document.querySelector("#transfer-month");
const financeQuery = document.querySelector("#finance-query");
const financeMonth = document.querySelector("#finance-month");
const reportMonth = document.querySelector("#report-month");
const reportPrintButton = document.querySelector("#report-print-button");
const movementQuery = document.querySelector("#movement-query");
const auditQuery = document.querySelector("#audit-query");
const auditMonth = document.querySelector("#audit-month");
const auditActionFilter = document.querySelector("#audit-action-filter");
const auditHighRiskOnly = document.querySelector("#audit-high-risk-only");
const auditExportButton = document.querySelector("#audit-export-button");
const stockQuery = document.querySelector("#stock-query");
const categoryFilter = document.querySelector("#category-filter");
const warehouseFilter = document.querySelector("#warehouse-filter");
const stockSort = document.querySelector("#stock-sort");
const lowStockOnly = document.querySelector("#low-stock-only");
const learningButton = document.querySelector("#learning-button");
const learningQuery = document.querySelector("#learning-query");
const learningTopicList = document.querySelector("#learning-topic-list");
const learningContent = document.querySelector("#learning-content");
const learningPrev = document.querySelector("#learning-prev");
const learningNext = document.querySelector("#learning-next");
const learningChecklistContainer = document.querySelector("#learning-checklist");
const employeeSelect = document.querySelector("#employee-select");
const roleSelect = document.querySelector("#role-select");
const refreshButton = document.querySelector("#refresh-button");
const exportButton = document.querySelector("#export-button");
const resetButton = document.querySelector("#reset-button");
const backupExportButton = document.querySelector("#backup-export-button");
const backupFileInput = document.querySelector("#backup-file-input");
const restoreButton = document.querySelector("#restore-button");
const backupPreview = document.querySelector("#backup-preview");
const auditControl = OpenStockFlowAudit.createInventoryAudit({
  getStore: () => store,
  getCurrentUser: () => currentUser,
  document,
  escapeHtml,
  t,
  formatDate,
  roleLabel
});
const backupControl = OpenStockFlowBackup.createInventoryBackup({
  document,
  storage,
  backupPreview,
  restoreButton,
  onRestoreReady: (state) => { pendingRestoreState = state; renderActionAvailability(); },
  t,
  escapeHtml
});
const masterDataUi = OpenStockFlowMasterDataUi.createInventoryMasterDataUi({
  document,
  getStore: () => store,
  fields: { categoryQuery, warehouseQuery, departmentQuery, employeeQuery, partnerQuery, partnerRoleFilter },
  formatCount, escapeHtml, escapeAttr, t, statusBadge, warehouseTypeLabel, departmentTypeLabel, roleLabel
});

setDefaultDates();
document.querySelector("#app-version").textContent = `v${appVersion}`;
applyTextBaseline();
bindEvents();
bindNumericInputs();
bindValidationText();
bindStorageFreshnessGuard();
render();
if (initialLoad.notice) { setStatus(initialLoad.notice); }

function bindEvents() {
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      if (!canViewModule(tab.dataset.tab)) {
        recordAudit("access", { entityType: "module", entityId: tab.dataset.tab, summary: modulePermissionReason(tab.dataset.tab), result: "denied", riskLevel: "medium" }, true);
        setStatus(modulePermissionReason(tab.dataset.tab), true, "warning");
        return;
      }
      recordAudit("read", { entityType: "module", entityId: tab.dataset.tab, summary: `查看模組：${moduleLabel(tab.dataset.tab)}`, riskLevel: tab.dataset.tab === "finance" || tab.dataset.tab === "reports" ? "medium" : "low" }, true);
      activeTab = tab.dataset.tab;
      render();
    });
  });

  roleSelect.addEventListener("change", () => {
    currentUser = Object.assign({}, currentUser, { role: normalizeRole(roleSelect.value) });
    saveCurrentUser();
    recordAudit("access", { entityType: "role", entityId: currentUser.role, summary: `切換本機角色：${currentRoleLabel()}`, riskLevel: "medium" }, true);
    ensureActiveTabAllowed();
    setStatus(interpolate(t("access.roleChanged", "已切換本機角色：{role}。"), { role: currentRoleLabel() }));
    render();
  });

  employeeSelect.addEventListener("change", () => {
    currentUser = currentUserFromEmployee(Number(employeeSelect.value));
    saveCurrentUser();
    ensureActiveTabAllowed();
    setStatus(`已切換本機人員：${currentUser.name} / ${currentRoleLabel()}。`);
    render();
  });

  bindMasterHandlers();
  bindPurchaseHandlers();
  bindSaleHandlers();
  bindAdjustmentHandlers();
  bindFinanceHandlers();
  bindReportHandlers();

  refreshButton.addEventListener("click", () => { window.location.reload(); });

  exportButton.addEventListener("click", () => {
    if (!requireAction("exportInventoryCsv")) { return; }
    recordAudit("export", { entityType: "inventoryReport", summary: "匯出庫存 CSV", after: currentStockOptions(), riskLevel: "medium" });
    saveState();
    downloadCsv("inventory-report.csv", toCsv(formatInventoryCsvRows(store.exportInventoryRows(currentStockOptions()))));
    setStatus("已匯出庫存 CSV。");
  });

  backupExportButton.addEventListener("click", () => {
    if (!requireAction("exportBackup")) { return; }
    recordAudit("export", { entityType: "backup", summary: "匯出完整備份 JSON", riskLevel: "high" });
    saveState();
    downloadJson(backupControl.backupFilename(today), storage.createStorageEnvelope(store.snapshot()));
    setStatus("已匯出完整備份 JSON。");
  });

  backupFileInput.addEventListener("change", () => {
    pendingRestoreState = null;
    restoreButton.disabled = true;
    const file = backupFileInput.files && backupFileInput.files[0];
    if (!file) { backupPreview.textContent = "尚未選擇備份檔。"; backupPreview.classList.add("empty"); renderActionAvailability(); return; }
    readBackupFile(file);
  });

  restoreButton.addEventListener("click", () => {
    if (!pendingRestoreState) { return; }
    if (!requireAction("restoreBackup")) { return; }
    if (!confirmAction("restoreBackup")) { return; }
    store = createInventoryStore(pendingRestoreState);
    recordAudit("restore", { entityType: "backup", summary: "完成整包還原", reason: "使用者確認還原備份", riskLevel: "high" });
    pendingRestoreState = null;
    restoreButton.disabled = true;
    backupFileInput.value = "";
    saveState();
    setStatus("已完成整包還原，資料已重新載入。");
    render();
  });

  resetButton.addEventListener("click", () => {
    if (!requireAction("resetSampleData")) { return; }
    if (!confirmAction("resetSampleData")) { return; }
    const previousAuditLogs = store.listAuditLogs ? store.listAuditLogs({}) : [];
    store = createInventoryStore(Object.assign({}, seedState, { auditLogs: previousAuditLogs }));
    recordAudit("restore", { entityType: "sampleData", summary: "重設為範例資料", reason: "使用者確認重設範例資料", riskLevel: "high" });
    saveState();
    setStatus("已重置為範例資料。");
    render();
  });
}

function bindNumericInputs() {
  document.querySelectorAll('input[type="number"]').forEach((input) => {
    input.addEventListener("input", () => {
      const integerOnly = input.step === "1" || input.dataset.numeric === "integer";
      const cleaned = input.value.replace(/[^\d.-]/g, "").replace(/(?!^)-/g, "");
      const normalized = integerOnly ? cleaned.replace(/\..*$/, "") : cleaned.replace(/(\..*)\./g, "$1");
      if (input.value !== normalized) { input.value = normalized; }
    });
  });
}

function bindValidationText() {
  document.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("invalid", () => { field.setCustomValidity(validationMessageFor(field)); });
    field.addEventListener("input", () => { field.setCustomValidity(""); });
    field.addEventListener("change", () => { field.setCustomValidity(""); });
  });
}

function bindStorageFreshnessGuard() {
  window.addEventListener("storage", (event) => {
    if (event.key !== storage.storageKey || event.newValue === event.oldValue) { return; }
    dataStale = true;
    setStatus(t("operationGuards.staleData", "資料已在其他視窗更新。為避免庫存或金額不一致，請先重新整理畫面後再操作。"), true, "warning");
    renderActionAvailability();
  });
}

function canWrite() {
  if (!dataStale) { return true; }
  setStatus(t("operationGuards.staleData", "資料已在其他視窗更新。為避免庫存或金額不一致，請先重新整理畫面後再操作。"), true, "warning");
  return false;
}

function requireAction(action, context) {
  if (!canWrite()) { return false; }
  if (canPerform(action, context)) { return true; }
  recordAudit("access", { entityType: "permission", entityId: action, summary: permissionReason(action), result: "denied", riskLevel: "medium" }, true);
  setStatus(permissionReason(action), true, "warning");
  return false;
}

function handleDocumentWorkflow(type, id, workflowAction) {
  const permissionAction = approvalPermissionAction(type, workflowAction);
  const targetDocument = targetDocumentById(type, id);
  if (!requireAction(permissionAction, { targetDocument })) { return; }
  let reason = "";
  if (workflowAction === "reject" || workflowAction === "requestVoid") {
    reason = prompt(workflowAction === "reject" ? t("prompts.rejectReason", "請輸入退回原因") : t("prompts.voidRequestReason", "請輸入作廢申請原因"));
    if (!String(reason || "").trim()) { setStatus(t("messages.approvalReasonRequired", "請先填寫原因。"), true); return; }
  }
  const result = type === "purchase" ? store.transitionPurchase(id, workflowAction, { user: currentUser.name, reason }) : store.transitionSale(id, workflowAction, { user: currentUser.name, reason });
  if (!result) { setStatus(t("messages.approvalActionFailed", "單據狀態無法更新。"), true); return; }
  if (result.error === "INSUFFICIENT_STOCK") { setStatus(OpenStockFlowMessages.message("insufficientStock"), true); return; }
  if (result.error) { setStatus(t("messages.approvalActionFailed", "單據狀態無法更新。"), true); return; }
  saveState();
  recordAudit("update", {
    entityType: type, entityId: id,
    documentNo: result[0] && result[0].documentNo,
    relatedDocumentNos: result[0] && result[0].documentNo ? [result[0].documentNo] : [],
    summary: `單據狀態更新：${approvalActionLabel(workflowAction)}`,
    reason, after: { action: workflowAction, status: result[0] && result[0].status },
    riskLevel: workflowAction === "confirm" || workflowAction === "requestVoid" ? "high" : "medium"
  });
  saveState();
  setStatus(interpolate(t("messages.approvalActionSaved", "單據狀態已更新：{action}"), { action: approvalActionLabel(workflowAction) }));
  render();
}

function handleVoidReversal(type, id) {
  const targetDocument = targetDocumentById(type, id);
  if (!requireAction("voidDocument", { targetDocument })) { return; }
  const result = store.createVoidReversal(type, id, { user: currentUser.name });
  if (!result) { setStatus("找不到可建立沖銷事件的作廢單據。", true); return; }
  saveState();
  recordAudit("create", {
    entityType: "voidReversal", entityId: result.id, documentNo: result.documentNo,
    sourceDocumentNo: result.sourceDocumentNo, relatedDocumentNos: [result.sourceDocumentNo, result.documentNo],
    summary: `建立沖銷事件：${result.documentNo}`, riskLevel: "high"
  });
  saveState();
  setStatus(`已建立沖銷事件：${result.documentNo}`);
  render();
}

function handleReturn(type, id) {
  const permissionAction = returnPermissionAction(type);
  const targetDocument = targetDocumentById(type, id);
  if (!requireAction(permissionAction, { targetDocument })) { return; }
  const quantity = prompt(t("prompts.returnQuantity", "請輸入退貨數量"));
  if (!Number.isFinite(Number(quantity)) || Number(quantity) <= 0) { setStatus(t("messages.returnQuantityRequired", "請輸入有效的退貨數量。"), true); return; }
  const reason = prompt(t("prompts.returnReason", "請輸入退貨原因"));
  if (!String(reason || "").trim()) { setStatus(t("messages.returnReasonRequired", "請先填寫退貨原因。"), true); return; }
  const input = { sourceLineId: id, quantity, reason, date: today, user: currentUser.name };
  const result = type === "purchase" ? store.addPurchaseReturn(input) : store.addSalesReturn(input);
  if (!result) { setStatus(t("messages.returnSaveFailed", "退貨單無法建立。"), true); return; }
  if (result.error === "RETURN_QUANTITY_EXCEEDS_SOURCE") { setStatus(t("messages.returnQuantityExceeded", "退貨數量不可超過原單剩餘可退數量。"), true); return; }
  if (result.error === "INSUFFICIENT_STOCK") { setStatus(OpenStockFlowMessages.message("insufficientStock"), true); return; }
  saveState();
  recordAudit("create", {
    entityType: type === "purchase" ? "purchaseReturn" : "salesReturn",
    entityId: result.id, documentNo: result.documentNo,
    sourceDocumentNo: result.sourceDocumentNo, relatedDocumentNos: [result.sourceDocumentNo, result.documentNo],
    summary: `建立退貨單 ${result.documentNo}`, reason,
    after: { quantity: result.quantity, unitPrice: result.unitPrice }, riskLevel: "high"
  });
  saveState();
  setStatus(interpolate(t("messages.returnSaved", "已建立退貨單 {documentNo}。"), { documentNo: result.documentNo }));
  render();
}

function handleDocumentOwnerReassign(type, id) {
  const targetDocument = targetDocumentById(type, id);
  const permissionAction = ownerReassignPermissionAction(type);
  if (!currentUser.employeeId || !currentUser.departmentId) { setStatus(t("messages.employeeRequiredForOwnership", "請先選擇本機人員，再調整單據負責人。"), true, "warning"); return; }
  if (!requireAction(permissionAction, { targetDocument })) { return; }
  const result = type === "purchase"
    ? store.updatePurchaseOwner(id, { ownerEmployeeId: currentUser.employeeId, ownerDepartmentId: currentUser.departmentId, lastEditedByEmployeeId: currentUser.employeeId })
    : store.updateSaleOwner(id, { ownerEmployeeId: currentUser.employeeId, ownerDepartmentId: currentUser.departmentId, lastEditedByEmployeeId: currentUser.employeeId });
  if (!result) { setStatus(t("messages.ownerReassignFailed", "單據負責人無法更新。"), true); return; }
  if (result.error === "DOCUMENT_CLOSED") { setStatus(t("messages.ownerReassignClosed", "這張單據已正式成立或已結束，不能直接改負責人。"), true, "warning"); return; }
  saveState();
  recordAudit("update", {
    entityType: type, entityId: id,
    documentNo: result[0] && result[0].documentNo,
    relatedDocumentNos: result[0] && result[0].documentNo ? [result[0].documentNo] : [],
    summary: `調整單據負責人：${currentUser.name}`,
    after: { ownerEmployeeId: currentUser.employeeId, ownerDepartmentId: currentUser.departmentId }, riskLevel: "medium"
  });
  saveState();
  setStatus(t("messages.ownerReassigned", "已更新單據負責人。"));
  render();
}

function approvalPermissionAction(type, workflowAction) {
  if (workflowAction === "submit") { return type === "purchase" ? "submitPurchase" : "submitSale"; }
  if (workflowAction === "approve") { return "approveDocument"; }
  if (workflowAction === "reject") { return type === "purchase" ? "rejectPurchase" : "rejectSale"; }
  if (workflowAction === "confirm") { return type === "purchase" ? "confirmPurchase" : "confirmSale"; }
  return "requestVoid";
}

function returnPermissionAction(type) { return type === "purchase" ? "createPurchaseReturn" : "createSalesReturn"; }
function ownerReassignPermissionAction(type) { return type === "purchase" ? "reassignPurchaseOwner" : "reassignSaleOwner"; }
function canPerform(action, context) { return accessControl.canPerform(action, context); }

function targetDocumentById(type, id) {
  const rows = type === "purchase" ? store.listPurchases({ includeVoided: true }) : store.listSales({ includeVoided: true });
  return rows.find((item) => item.id === Number(id)) || null;
}

function targetDocumentContext(item) { return { targetDocument: item || null }; }
function isWithinPermissionScope(action, context) { return accessControl.isWithinPermissionScope(action, context); }
function hasSupervisorScope(action, context, target) { return accessControl.hasSupervisorScope(action, context, target); }
function canViewModule(moduleName, context) { return accessControl.canViewModule(moduleName, context); }
function canViewField(fieldName, context) { return accessControl.canViewField(fieldName, context); }
function permissionReason(action) { return accessControl.permissionReason(action); }
function modulePermissionReason(moduleName) { return accessControl.modulePermissionReason(moduleName); }
function actionLabel(action) { return accessControl.actionLabel(action); }
function moduleLabel(moduleName) { const tab = document.querySelector(`[data-tab="${moduleName}"]`); return tab ? tab.textContent.trim() : moduleName; }
function normalizeRole(role) { return OpenStockFlowAccess.normalizeRole(role); }
function currentRoleLabel() { return accessControl.currentRoleLabel(); }

function loadCurrentUser() {
  try {
    const employeeId = Number(localStorage.getItem(currentEmployeeStorageKey));
    return currentUserFromEmployee(employeeId) || { id: "local-user", employeeId: 0, departmentId: 0, name: "本機使用者", role: normalizeRole(localStorage.getItem(accessRoleStorageKey)) };
  } catch (error) {
    return { id: "local-user", employeeId: 0, departmentId: 0, name: "本機使用者", role: "owner" };
  }
}

function saveCurrentUser() {
  try {
    localStorage.setItem(accessRoleStorageKey, currentUser.role);
    localStorage.setItem(currentEmployeeStorageKey, String(currentUser.employeeId || ""));
  } catch (error) {
    setStatus(t("messages.roleSaveFailed", "本機角色無法儲存，重新整理後可能會回到管理者。"), true, "warning");
  }
}

function currentUserFromEmployee(employeeId) {
  const employees = store && store.listEmployees ? store.listEmployees({ activeOnly: true }) : [];
  const employee = employees.find((item) => item.id === Number(employeeId)) || employees[0];
  if (!employee) { return null; }
  return { id: `employee-${employee.id}`, employeeId: employee.id, departmentId: employee.departmentId, name: employee.name, role: normalizeRole(employee.role) };
}

function validationMessageFor(field) {
  const validity = field.validity;
  const label = fieldLabel(field);
  if (validity.valueMissing) {
    const key = field.tagName === "SELECT" ? "validation.selectMissing" : "validation.valueMissing";
    return interpolate(t(key, field.tagName === "SELECT" ? "請選擇「{label}」。" : "請填寫「{label}」。"), { label });
  }
  if (validity.rangeUnderflow) { return interpolate(t("validation.rangeUnderflow", "「{label}」不可小於 {min}。"), { label, min: field.min }); }
  if (validity.rangeOverflow) { return interpolate(t("validation.rangeOverflow", "「{label}」不可大於 {max}。"), { label, max: field.max }); }
  if (validity.stepMismatch) { return interpolate(t("validation.stepMismatch", "「{label}」的格式不符合欄位設定。"), { label }); }
  if (validity.badInput) { return interpolate(t("validation.badInput", "請輸入有效的「{label}」。"), { label }); }
  if (validity.patternMismatch) { return interpolate(t("validation.patternMismatch", "「{label}」格式不正確。"), { label }); }
  return "";
}

function fieldLabel(field) {
  const label = field.closest("label");
  const span = label ? label.querySelector("span") : null;
  return span ? span.textContent.trim() : (field.name || field.id || "");
}

function render() {
  ensureActiveTabAllowed();
  applyTextBaseline();
  renderAccessControl();
  renderTabs();
  renderMetrics();
  renderProductOptions();
  renderWarehouseOptions();
  renderTransferProductOptions();
  renderDepartmentOptions();
  renderPartnerOptions();
  renderOverview();
  renderProductCategoryOptions();
  renderProductFilters();
  renderProducts();
  renderProductCategories();
  renderWarehouses();
  renderDepartments();
  renderEmployees();
  renderPartners();
  renderPurchases();
  renderPurchaseReturns();
  renderSales();
  renderSalesReturns();
  renderAdjustments();
  renderTransfers();
  renderFinance();
  renderPreferences();
  renderReports();
  renderAuditLogs();
  renderLearning();
  renderStockFilters();
  renderStock();
  renderActionAvailability();
}

function ensureActiveTabAllowed() {
  if (canViewModule(activeTab)) { return; }
  const firstAllowed = Array.from(tabs).find((tab) => canViewModule(tab.dataset.tab));
  activeTab = firstAllowed ? firstAllowed.dataset.tab : "overview";
}

function renderTabs() {
  tabs.forEach((tab) => {
    const allowed = canViewModule(tab.dataset.tab);
    tab.classList.toggle("is-active", tab.dataset.tab === activeTab);
    tab.classList.toggle("is-disabled", !allowed);
    tab.disabled = !allowed;
    tab.title = allowed ? "" : modulePermissionReason(tab.dataset.tab);
  });
  views.forEach((view) => { view.classList.toggle("is-active", view.dataset.view === activeTab); });
}

function renderMetrics() {
  const dashboard = store.dashboard();
  document.querySelector("#metric-products").textContent = formatCount(dashboard.activeProducts);
  document.querySelector("#metric-stock-value").textContent = canViewField("viewStockValue") ? formatMoney(dashboard.stockValue) : restrictedText();
  document.querySelector("#metric-revenue").textContent = canViewField("viewSalesRevenue") ? formatMoney(dashboard.revenue) : restrictedText();
  document.querySelector("#metric-low-stock").textContent = formatCount(dashboard.lowStockCount);
}

function renderAccessControl() {
  if (!roleSelect || !employeeSelect) { return; }
  const employees = store.listEmployees({ activeOnly: true });
  if (!employees.some((employee) => employee.id === currentUser.employeeId) && employees.length) {
    currentUser = currentUserFromEmployee(employees[0].id);
    saveCurrentUser();
  }
  const employeeLabel = employeeSelect.closest("label") && employeeSelect.closest("label").querySelector("span");
  if (employeeLabel) { employeeLabel.textContent = "本機人員"; }
  employeeSelect.innerHTML = employees.length
    ? employees.map((employee) => {
      const department = store.listDepartments().find((item) => item.id === employee.departmentId);
      return `<option value="${employee.id}">${escapeHtml(employee.name)} / ${escapeHtml(department ? department.name : "未指定部門")} / ${escapeHtml(roleLabel(employee.role))}</option>`;
    }).join("")
    : `<option value="">本機使用者</option>`;
  employeeSelect.value = employees.some((employee) => employee.id === currentUser.employeeId) ? String(currentUser.employeeId) : "";
  const roleLabelElement = roleSelect.closest("label") && roleSelect.closest("label").querySelector("span");
  if (roleLabelElement) { roleLabelElement.textContent = t("access.localRole", "本機角色"); }
  Array.from(roleSelect.options).forEach((option) => { option.textContent = roleLabel(option.value); });
  roleSelect.value = currentUser.role;
  roleSelect.disabled = Boolean(currentUser.employeeId);
  roleSelect.title = interpolate(t("access.currentRole", "目前本機角色：{role}"), { role: currentRoleLabel() });
}

function renderActionAvailability() {
  const hasProducts = store.listProducts({ activeOnly: true }).length > 0;
  const hasWarehouses = store.listWarehouses({ activeOnly: true }).length > 0;
  const hasReceivables = store.listReceivables({ status: "" }).some(isOpenFinanceTarget);
  const hasPayables = store.listPayables({ status: "" }).some(isOpenFinanceTarget);
  const staleReason = dataStale ? t("operationGuards.staleData", "資料已在其他視窗更新。為避免庫存或金額不一致，請先重新整理畫面後再操作。") : "";
  const productWarehouseReason = !hasProducts && !hasWarehouses ? t("operationGuards.noProductOrWarehouse", "請先建立並啟用商品與倉庫。") : !hasProducts ? t("operationGuards.noProduct", "請先建立並啟用商品。") : !hasWarehouses ? t("operationGuards.noWarehouse", "請先建立並啟用倉庫。") : "";
  setActionDisabled(productForm.querySelector('button[type="submit"]'), "manageProducts", staleReason);
  setActionDisabled(categoryForm.querySelector('button[type="submit"]'), "manageMasterData", staleReason);
  setActionDisabled(warehouseForm.querySelector('button[type="submit"]'), "manageMasterData", staleReason);
  setActionDisabled(departmentForm.querySelector('button[type="submit"]'), "manageMasterData", staleReason);
  setActionDisabled(employeeForm.querySelector('button[type="submit"]'), "manageMasterData", staleReason);
  setActionDisabled(partnerForm.querySelector('button[type="submit"]'), "managePartners", staleReason);
  setActionDisabled(preferencesForm.querySelector('button[type="submit"]'), "savePreferences", staleReason);
  setActionDisabled(resetButton, "resetSampleData", staleReason, t("tooltips.resetSampleData", "重設為範例資料；目前瀏覽器內的資料會被取代。"));
  setActionDisabled(purchaseForm.querySelector('button[type="submit"]'), "createPurchase", staleReason || productWarehouseReason);
  setActionDisabled(saleForm.querySelector('button[type="submit"]'), "createSale", staleReason || productWarehouseReason);
  setActionDisabled(adjustmentForm.querySelector('button[type="submit"]'), "stockAdjust", staleReason || productWarehouseReason);
  setActionDisabled(transferForm.querySelector('button[type="submit"]'), "transferStock", staleReason || productWarehouseReason);
  const paymentReason = staleReason || (hasReceivables || hasPayables ? "" : t("operationGuards.noPaymentTarget", "目前沒有可沖帳的應收或應付項目。"));
  setActionDisabled(paymentForm.querySelector('button[type="submit"]'), "managePayments", paymentReason);
  const restoreReason = staleReason || (pendingRestoreState ? "" : t("tooltips.restoreBackupDisabled", "請先選擇並通過檢查的備份檔。"));
  setActionDisabled(exportButton, "exportInventoryCsv", staleReason, t("tooltips.exportInventoryCsv", "依目前庫存報表篩選條件匯出 CSV。"));
  setActionDisabled(auditExportButton, "exportAuditLogs", staleReason, "匯出目前篩選的稽核紀錄。");
  setActionDisabled(backupExportButton, "exportBackup", staleReason, t("tooltips.exportBackup", "匯出完整 JSON 備份，可用於之後還原。"));
  setActionDisabled(restoreButton, "restoreBackup", restoreReason, t("tooltips.restoreBackup", "用已選取的備份檔取代目前資料。"));
}

function setActionDisabled(button, action, blockingReason, fallbackTitle) {
  const roleReason = canPerform(action) ? "" : permissionReason(action);
  const reason = blockingReason || roleReason;
  setDisabledReason(button, Boolean(reason), reason || fallbackTitle || actionLabel(action));
}

function setDisabledReason(button, disabled, reason) {
  if (!button) { return; }
  button.disabled = Boolean(disabled);
  button.classList.toggle("is-disabled", Boolean(disabled));
  if (reason) { button.title = reason; button.setAttribute("aria-disabled", String(Boolean(disabled))); }
  else { button.removeAttribute("aria-disabled"); }
}

function currentLanguage() { const preferences = store && store.getPreferences ? store.getPreferences() : {}; return preferences.interfaceLanguage || "zh-Hant"; }
function t(path, fallback) { return window.OpenStockFlowI18n ? window.OpenStockFlowI18n.text(currentLanguage(), path, fallback) : (fallback !== undefined ? fallback : path); }

function applyTextBaseline() {
  document.documentElement.lang = currentLanguage();
  document.title = t("app.title", "OpenStockFlow 進銷存系統");
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
    ["#purchase-form", "supplier", "common.supplier", "供應商"],
    ["#purchase-form", "createPayable", "fields.createPayable", "建立應付帳款"],
    ["#purchase-form", "dueDate", "fields.payableDueDate", "付款到期日"],
    ["#sale-form", "warehouseId", "fields.shippingWarehouse", "出貨倉庫"],
    ["#sale-form", "productId", "fields.firstProduct", "第 1 筆商品"],
    ["#sale-form", "quantity", "fields.quantity", "數量"], ["#sale-form", "unitPrice", "fields.unitPrice", "銷售單價"],
    ["#sale-form", "productId2", "fields.secondProductOptional", "第 2 筆商品（選填）"],
    ["#sale-form", "quantity2", "fields.secondQuantity", "第 2 筆數量"],
    ["#sale-form", "unitPrice2", "fields.secondUnitPrice", "第 2 筆單價"],
    ["#sale-form", "customer", "common.customer", "客戶"],
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

function statusBadge(active) {
  return active ? `<span class="badge">${t("common.active", "啟用")}</span>` : `<span class="badge warn">${t("common.inactive", "停用")}</span>`;
}

function documentStatusBadge(item) {
  if (item && item.status === "voidRequested") { return `<span class="badge warn">${t("documentStatus.voidRequested", "作廢申請")}</span>`; }
  if (item && item.status === "reversed") { return `<span class="badge neutral">${t("documentStatus.reversed", "已沖銷")}</span>`; }
  if (isVoidedDocument(item)) { return `<span class="badge danger">${t("documentStatus.voided", "已作廢")}</span>`; }
  if (item && item.status === "amended") { return `<span class="badge warn">${t("documentStatus.amended", "已修改")}</span>`; }
  if (item && item.status === "rejected") { return `<span class="badge warn">${t("documentStatus.rejected", "已退回")}</span>`; }
  if (item && item.status === "approved") { return `<span class="badge">${t("documentStatus.approved", "已核准")}</span>`; }
  if (item && item.status === "submitted") { return `<span class="badge neutral">${t("documentStatus.submitted", "送審中")}</span>`; }
  if (item && item.status === "draft") { return `<span class="badge neutral">${t("documentStatus.draft", "草稿")}</span>`; }
  return `<span class="badge">${t("documentStatus.confirmed", "已確認")}</span>`;
}

function voidMeta(item) {
  if (!isVoidedDocument(item)) { return ""; }
  const reason = item.voidReason || t("common.notFilled", "未填");
  const voidedAt = item.voidedAt ? formatDate(item.voidedAt.slice(0, 10)) : t("common.notFilled", "未填");
  const voidedBy = item.voidedBy || t("common.localUser", "本機使用者");
  return ` / ${t("documentStatus.voidReason", "作廢原因")}：${escapeHtml(reason)} / ${escapeHtml(voidedBy)} / ${escapeHtml(voidedAt)}`;
}

function voidDetailPanel(item, type) {
  if (!isVoidedDocument(item)) { return ""; }
  const reversal = store.findVoidReversal ? store.findVoidReversal(type, item.id) : null;
  const notCreated = t("common.notCreated", "尚未建立");
  const sourceDocumentNo = item.sourceDocumentNo || item.documentNo || t("common.noDocumentNo", "無單號");
  const reversalDocumentNo = item.reversalDocumentNo || (reversal && reversal.documentNo) || notCreated;
  const relatedDocumentNos = [sourceDocumentNo].concat(item.relatedDocumentNos || []).concat(reversalDocumentNo === notCreated ? [] : [reversalDocumentNo]).filter(Boolean);
  const effectText = type === "purchase" ? "進貨庫存與應付帳款已從有效資料排除，沖銷事件建立後可追溯原單。" : "銷售出貨、應收帳款與毛利已從有效資料排除，沖銷事件建立後可追溯原單。";
  return `
    <div class="void-detail" data-void-ui-source-reversal-link>
      <span data-void-ui-reason-visible>原單 ${escapeHtml(sourceDocumentNo)} / 沖銷 ${escapeHtml(reversalDocumentNo)}</span>
      <span>原因 ${escapeHtml(item.voidReason || t("common.notFilled", "未填"))} / ${escapeHtml(item.voidedBy || t("common.localUser", "本機使用者"))} / ${escapeHtml(item.voidedAt ? formatDate(item.voidedAt.slice(0, 10)) : t("common.notFilled", "未填"))}</span>
      <span>關聯 ${escapeHtml(Array.from(new Set(relatedDocumentNos)).join(" / ") || t("common.notFilled", "未填"))}</span>
      <span>${escapeHtml(effectText)}</span>
    </div>
  `;
}

function isVoidedDocument(item) { return item && (item.status === "voided" || item.status === "reversed"); }

function returnMeta(item, documentType) {
  const quantity = returnedQuantity(item, documentType);
  if (!quantity) { return ""; }
  return ` / ${t("documentStatus.returnedQuantity", "已退")}：${formatQuantity(quantity)}`;
}

function returnedQuantity(item, documentType) {
  return store.listReturns({ documentType }).filter((returnRow) => returnRow.sourceLineId === item.id).reduce((sum, returnRow) => sum + returnRow.quantity, 0);
}

function documentResponsibilityText(item) {
  const unassigned = t("common.unassignedOwner", "未指派");
  const ownerName = employeeName(item && item.ownerEmployeeId) || unassigned;
  const department = departmentName(item && item.ownerDepartmentId) || unassigned;
  return `${t("common.responsibility", "負責")}：${ownerName} / ${department}`;
}

function employeeName(employeeId) { const employee = store.listEmployees().find((item) => item.id === Number(employeeId)); return employee ? employee.name : ""; }
function departmentName(departmentId) { const department = store.listDepartments().find((item) => item.id === Number(departmentId)); return department ? department.name : ""; }

function returnDocumentButton(item, type) {
  if (!item || !["confirmed", "amended", "voidRequested"].includes(item.status || "confirmed") || isVoidedDocument(item)) { return ""; }
  const documentType = type === "purchase" ? "purchaseReturn" : "salesReturn";
  const remaining = item.quantity - returnedQuantity(item, documentType);
  const label = t("actions.createReturn", "退貨");
  if (remaining <= 0) { return `<button class="text-button" type="button" disabled title="${escapeAttr(t("tooltips.returnCompleted", "此單據已無可退數量。"))}">${label}</button>`; }
  const permissionAction = returnPermissionAction(type);
  if (!canPerform(permissionAction, targetDocumentContext(item))) { return `<button class="text-button" type="button" disabled title="${escapeAttr(permissionReason(permissionAction))}">${label}</button>`; }
  const dataAttribute = type === "purchase" ? "data-return-purchase-id" : "data-return-sale-id";
  const tooltip = type === "purchase" ? t("tooltips.purchaseReturn", "建立進貨退貨，會扣回庫存並調整應付。") : t("tooltips.salesReturn", "建立銷售退貨，會回補庫存並調整應收。");
  return `<button class="text-button" type="button" title="${escapeAttr(tooltip)}" ${dataAttribute}="${item.id}">${label}</button>`;
}

function documentWorkflowButtons(item, type) {
  if (!item || isVoidedDocument(item)) { return ""; }
  const buttonsByStatus = { draft: [["submit"]], rejected: [["submit"]], submitted: [["approve", "approveDocument"], ["reject"]], approved: [["confirm"], ["reject"]], confirmed: [["requestVoid", "requestVoid"]], amended: [["requestVoid", "requestVoid"]], voidRequested: [["cancelVoid", "requestVoid"]] };
  const buttons = buttonsByStatus[item.status] || [];
  const idAttribute = type === "purchase" ? "data-purchase-id" : "data-sale-id";
  return buttons.map(([workflowAction, explicitPermissionAction]) => {
    const permissionAction = explicitPermissionAction || approvalPermissionAction(type, workflowAction);
    const label = approvalActionLabel(workflowAction);
    const disabled = canPerform(permissionAction, targetDocumentContext(item)) ? "" : " disabled";
    const title = disabled ? permissionReason(permissionAction) : approvalActionTitle(workflowAction);
    return `<button class="text-button" type="button" data-approval-action="${workflowAction}" ${idAttribute}="${item.id}" title="${escapeAttr(title)}"${disabled}>${escapeHtml(label)}</button>`;
  }).join("");
}

function reassignDocumentOwnerButton(item, type) {
  if (!item || isVoidedDocument(item) || !["draft", "submitted", "approved"].includes(item.status || "confirmed")) { return ""; }
  const label = t("actions.takeDocumentOwnership", "改由我負責");
  if (!currentUser.employeeId || !currentUser.departmentId) { return `<button class="text-button" type="button" disabled title="${escapeAttr(t("tooltips.employeeRequiredForOwnership", "請先選擇本機人員。"))}">${label}</button>`; }
  if (Number(item.ownerEmployeeId) === Number(currentUser.employeeId)) { return `<button class="text-button" type="button" disabled title="${escapeAttr(t("tooltips.alreadyDocumentOwner", "這張單據目前已由你負責。"))}">${label}</button>`; }
  const permissionAction = ownerReassignPermissionAction(type);
  if (!canPerform(permissionAction, targetDocumentContext(item))) { return `<button class="text-button" type="button" disabled title="${escapeAttr(permissionReason(permissionAction))}">${label}</button>`; }
  const dataAttribute = type === "purchase" ? "data-reassign-purchase-owner-id" : "data-reassign-sale-owner-id";
  return `<button class="text-button" type="button" ${dataAttribute}="${item.id}" title="${escapeAttr(t("tooltips.takeDocumentOwnership", "將這張未確認單據改由目前人員負責。"))}">${label}</button>`;
}

function approvalActionLabel(workflowAction) {
  const labels = { submit: t("actions.submitApproval", "送審"), approve: t("actions.approveDocument", "核准"), reject: t("actions.rejectDocument", "退回"), confirm: t("actions.confirmDocument", "確認"), requestVoid: t("actions.requestVoid", "申請作廢"), cancelVoid: t("actions.cancelVoid", "取消作廢申請") };
  return labels[workflowAction] || workflowAction;
}

function approvalActionTitle(workflowAction) {
  const titles = { submit: t("tooltips.submitApproval", "送出審核，等待核准。"), approve: t("tooltips.approveDocument", "核准後仍需確認才會影響庫存與帳款。"), reject: t("tooltips.rejectDocument", "退回並保留原因與紀錄。"), confirm: t("tooltips.confirmDocument", "確認後才會正式影響庫存、財務與報表。"), requestVoid: t("tooltips.requestVoid", "提出作廢申請，等待管理者處理。"), cancelVoid: t("tooltips.cancelVoid", "撤回作廢申請，單據恢復為已確認狀態。") };
  return titles[workflowAction] || "";
}

function voidDocumentButton(item, type) {
  const label = t("actions.void", "作廢");
  if (isVoidedDocument(item)) { return `<button class="text-button action-danger" type="button" disabled title="${escapeAttr(t("tooltips.alreadyVoided", "此單據已作廢，原始紀錄保留供查詢。"))}">${label}</button>`; }
  if (!canPerform("voidDocument", targetDocumentContext(item))) { return `<button class="text-button action-danger" type="button" disabled title="${escapeAttr(permissionReason("voidDocument"))}">${label}</button>`; }
  const dataAttribute = type === "purchase" ? "data-remove-purchase-id" : "data-remove-sale-id";
  const tooltip = type === "purchase" ? t("tooltips.voidPurchase", "作廢這筆進貨紀錄，庫存會重新計算。") : t("tooltips.voidSale", "作廢這筆銷售紀錄，庫存會回補。");
  return `<button class="text-button action-danger" type="button" title="${escapeAttr(tooltip)}" ${dataAttribute}="${item.id}">${label}</button>`;
}

function voidReversalButton(item, type) {
  if (!isVoidedDocument(item)) { return ""; }
  const label = "建立沖銷";
  if (item.reversalDocumentNo) { return `<button class="text-button" type="button" disabled title="${escapeAttr(`已建立沖銷事件：${item.reversalDocumentNo}`)}">${label}</button>`; }
  if (!canPerform("voidDocument", targetDocumentContext(item))) { return `<button class="text-button" type="button" disabled title="${escapeAttr(permissionReason("voidDocument"))}">${label}</button>`; }
  const dataAttribute = type === "purchase" ? "data-create-purchase-reversal-id" : "data-create-sale-reversal-id";
  return `<button class="text-button" type="button" data-void-ui-create-reversal-action ${dataAttribute}="${item.id}" title="建立反向事件並連結原單">${label}</button>`;
}

function collectOrderItems(data, priceField) {
  const secondPriceField = `${priceField}2`;
  const items = [{ productId: data.productId, quantity: data.quantity, [priceField]: data[priceField] }];
  if (data.productId2 && data.quantity2 && data[secondPriceField]) { items.push({ productId: data.productId2, quantity: data.quantity2, [priceField]: data[secondPriceField] }); }
  return items;
}

function collectTransferItems(data) {
  const items = [{ productId: data.productId, quantity: data.quantity }];
  if (data.productId2 && data.quantity2) { items.push({ productId: data.productId2, quantity: data.quantity2 }); }
  return items;
}

function productName(productId) { const product = store.listProducts().find((item) => item.id === Number(productId)); return product ? product.name : "未知商品"; }
function warehouseName(warehouseId) { const warehouse = store.listWarehouses().find((item) => item.id === Number(warehouseId)); return warehouse ? `${warehouse.code} ${warehouse.name}` : "未指定倉庫"; }

function movementBadge(type) {
  if (type === "purchase") { return '<span class="badge">進貨</span>'; }
  if (type === "adjustment") { return '<span class="badge neutral">調整</span>'; }
  if (type === "transfer") { return '<span class="badge neutral">調撥</span>'; }
  if (type === "salesReturn") { return '<span class="badge neutral">銷退</span>'; }
  if (type === "purchaseReturn") { return '<span class="badge warn">進退</span>'; }
  return '<span class="badge warn">銷售</span>';
}

function warehouseTypeLabel(type) {
  if (type === "store") { return "門市"; }
  if (type === "display") { return "展示"; }
  if (type === "inspection") { return "待驗"; }
  if (type === "loan") { return "借出"; }
  if (type === "return") { return "退貨區"; }
  return "倉庫";
}

function roleLabel(role) { return accessControl.roleLabel(role); }
function departmentTypeLabel(type) { const labels = { sales: "銷售", purchasing: "採購", warehouse: "倉儲", finance: "財務", admin: "管理", audit: "稽核" }; return labels[type] || type || "-"; }
function restrictedText() { return "未開放"; }
function formatRestrictedMoney(value, fieldName) { return canViewField(fieldName) ? formatMoney(value) : restrictedText(); }

function saveState() { storage.saveState(store.snapshot()); }
function readBackupFile(file) { backupControl.readBackupFile(file); }
function renderBackupSummary(summary) { return backupControl.renderBackupSummary(summary); }
function setDefaultDates() { document.querySelectorAll('input[type="date"]').forEach((input) => { if (!input.value) { input.value = today; } }); }
function setStatus(message, isError, tone) {
  statusLine.textContent = message;
  statusLine.classList.toggle("is-warning", tone === "warning");
  statusLine.classList.toggle("is-error", Boolean(isError) && tone !== "warning");
  statusLine.classList.toggle("is-success", Boolean(message && !isError && tone !== "warning"));
}

function formatMoney(value) {
  const preferences = store.getPreferences ? store.getPreferences() : { moneyDecimals: 0, thousandsSeparator: ",", decimalSeparator: ".", currencySymbol: "$", currencyPosition: "prefix" };
  const amount = formatNumber(value, preferences.moneyDecimals, preferences);
  const symbol = preferences.currencySymbol || preferences.currencyCode || "$";
  return preferences.currencyPosition === "suffix" ? `${amount}${symbol}` : `${symbol}${amount}`;
}

function formatQuantity(value) { const preferences = store.getPreferences ? store.getPreferences() : {}; return formatNumber(value, preferences.quantityDecimals, preferences); }
function formatCount(value) { return String(Math.round(Number(value) || 0)); }

function formatNumber(value, decimals, options) {
  const n = Number(value) || 0;
  const d = Number.isFinite(Number(decimals)) ? Number(decimals) : 0;
  const opts = options || {};
  const thousandsSep = opts.thousandsSeparator !== undefined ? opts.thousandsSeparator : ",";
  const decimalSep = opts.decimalSeparator !== undefined ? opts.decimalSeparator : ".";
  const fixed = n.toFixed(d);
  const [intPart, decPart] = fixed.split(".");
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
  return decPart !== undefined ? `${intFormatted}${decimalSep}${decPart}` : intFormatted;
}

function formatPercent(value) { return `${formatNumber(value * 100, 1)}%`; }

function formatDate(value) {
  const preferences = store && store.getPreferences ? store.getPreferences() : {};
  const format = preferences.dateFormat || "YYYY-MM-DD";
  if (!value) { return ""; }
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) { return String(value); }
  const [, yyyy, mm, dd] = match;
  return format.replace("YYYY", yyyy).replace("MM", mm).replace("DD", dd);
}

function parseDate(value) {
  if (value instanceof Date) { return value; }
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) { return null; }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function toCsv(rows) {
  const header = ["sku", "name", "warehouse", "category", "unit", "onHand", "adjusted", "cost", "price", "safetyStock", "stockValue", "revenue", "grossProfit", "lowStock"];
  return [header.join(",")].concat(rows.map((row) => header.map((key) => csvCell(row[key])).join(","))).join("\n");
}

function formatInventoryCsvRows(rows) {
  return rows.map((row) => Object.assign({}, row, {
    onHand: formatQuantity(row.onHand), adjusted: formatQuantity(row.adjusted),
    cost: formatMoney(row.cost), price: formatMoney(row.price),
    safetyStock: formatQuantity(row.safetyStock), stockValue: formatMoney(row.stockValue),
    revenue: formatMoney(row.revenue), grossProfit: formatMoney(row.grossProfit)
  }));
}

function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename; link.click();
  URL.revokeObjectURL(url);
}

function downloadJson(filename, data) { backupControl.downloadJson(filename, data); }
function csvCell(value) { return `"${String(value).replaceAll('"', '""')}"`; }
function escapeHtml(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"); }
function escapeAttr(value) { return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("'", "&#39;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"); }
