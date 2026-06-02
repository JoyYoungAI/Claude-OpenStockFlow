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
    locale: "zh-Hant-TW",
    interfaceLanguage: "zh-Hant",
    quantityDecimals: 0,
    moneyDecimals: 0,
    thousandsSeparator: ",",
    decimalSeparator: ".",
    currencyCode: "TWD",
    currencySymbol: "$",
    currencyPosition: "prefix",
    reportTitle: "StockFlow 營運報表",
    reportHeaderText: "StockFlow",
    reportFooterText: "",
    showPrintDate: true,
    dateFormat: "YYYY-MM-DD"
  }
};

const learningTopics = [
  {
    id: "quick-start",
    title: "0. 快速開始",
    summary: "先認識目前版本：資料存在瀏覽器，操作前先知道如何備份與重設範例資料。",
    sections: [
      { type: "text", heading: "先看三件事", items: ["目前是瀏覽器本機版本，資料存在這台電腦的瀏覽器。", "同事人肉驗證前，建議先匯出完整備份。", "要驗證單據關聯時，請先按「重設範例資料」。"] },
      { type: "example", heading: "第一個練習", items: ["按右上角「重設範例資料」。", "進入 E1 調撥，搜尋 LOAN。", "進入 E2 財務，搜尋 SO。"] }
    ]
  },
  {
    id: "sync-status",
    title: "1. 什麼是同步狀態",
    summary: "同步狀態告訴你畫面資料是否仍可信，尤其在多個視窗同時開啟時很重要。",
    sections: [
      { type: "text", heading: "目前的同步語意", items: ["已儲存資料會寫入本機瀏覽器。", "同一瀏覽器的其他視窗若更新資料，舊視窗會顯示警示。", "看到警示後，新增或修改資料會暫停，避免用舊資料建立單據。"] },
      { type: "warning", heading: "新人判斷", body: "如果不確定畫面是不是最新，先重新整理，再檢查剛才的單據是否已存在。" }
    ]
  },
  {
    id: "multi-window-risk",
    title: "2. 多視窗風險",
    summary: "同一套進銷存開在多個分頁、視窗或無痕視窗，最容易造成庫存與金額誤判。",
    sections: [
      { type: "text", heading: "常見情境", items: ["業務開兩個視窗同時打出貨單。", "倉庫同仁在另一個視窗做盤點調整。", "財務在舊畫面登錄收款。"] },
      { type: "danger", heading: "為什麼危險", body: "你以為還有庫存，其實其他視窗已經出貨；你以為應收未收，其實財務剛剛已沖帳。" }
    ]
  },
  {
    id: "stale-data-warning",
    title: "3. 舊資料警示",
    summary: "舊資料警示出現時，不是系統壞掉，而是系統正在阻止你用過期資料寫入。",
    sections: [
      { type: "steps", heading: "看到警示時", items: ["停止新增或修改單據。", "重新整理畫面。", "用單據編號搜尋剛才的作業是否已成立。", "確認後再繼續操作。"] },
      { type: "quiz", heading: "情境題", body: "畫面跳出其他視窗已更新資料，這時可以直接按儲存出貨單嗎？答案：不可以，先重新整理。" }
    ]
  },
  {
    id: "backup-restore",
    title: "4. 備份與還原",
    summary: "備份與還原是高風險操作，因為還原會取代目前瀏覽器內的資料。",
    sections: [
      { type: "steps", heading: "建議順序", items: ["還原前先匯出目前完整備份。", "選擇備份檔後先看預覽摘要。", "確認商品、倉庫、進貨、銷售、財務筆數合理。", "確認後才按還原資料。"] },
      { type: "warning", heading: "不要只看檔名", body: "備份檔名可能被改過，請以系統預覽的資料摘要為準。" }
    ]
  },
  {
    id: "document-linkage",
    title: "5. 單據編號關聯",
    summary: "單據編號是交易關聯主鍵，能追到庫存、應收應付、借出歸還與業績狀態。",
    sections: [
      { type: "text", heading: "範例單據", items: ["PO 代表採購進貨，可能產生應付。", "SO 代表銷售出貨，可能產生應收與業績。", "LOAN 代表借出測試，不直接產生應收。", "LRTN 代表借出歸還，需倉庫確認後才回可售庫存。"] },
      { type: "example", heading: "查詢練習", items: ["搜尋 SO，確認出貨單與應收。", "搜尋 PO，確認進貨單與應付。", "搜尋 LOAN，確認借出流向。"] }
    ]
  },
  {
    id: "loan-return",
    title: "6. 借出與歸還",
    summary: "借出不是一般銷售，歸還也不是直接入庫，中間需要倉庫驗收。",
    sections: [
      { type: "steps", heading: "正確流程", items: ["LOAN：主倉轉到借出中。", "客戶滿意：由 LOAN 轉 SO 出貨。", "客戶不滿意：建立 LRTN，借出中轉待驗區。", "倉庫確認商品狀態後，才可回可售庫存。"] },
      { type: "quiz", heading: "情境題", body: "客戶歸還商品後，可以直接賣給下一位客戶嗎？答案：不行，需先驗收入庫。" }
    ]
  },
  {
    id: "finance-commission",
    title: "7. 財務與獎金風險",
    summary: "出貨會影響應收，業績獎金是否可發放要看公司政策與收款狀態。",
    sections: [
      { type: "text", heading: "先保留，不寫死", items: ["出貨後可先列業績，但獎金狀態可能是 held。", "收款完成後，獎金才可能轉為 eligible。", "退貨、作廢或壞帳時，業績與獎金必須能反轉或保留。"] },
      { type: "example", heading: "範例資料", body: "SO-YYYYMM-004 的應收註記含 commissionStatus=held，代表借出轉出貨後，獎金仍待收款或政策確認。" }
    ]
  }
];

const learningChecklist = [
  "重設範例資料後，E1 調撥可查到 LOAN 與 LRTN。",
  "LOAN 代表借出中，不應產生應收帳款。",
  "LRTN 代表借出歸還，商品應停在 INSPECT 待驗區。",
  "E2 財務可查到 SO-YYYYMM-004 的應收。",
  "SO-YYYYMM-004 註記可看到 commissionStatus=held。",
  "PO 進貨單可在 E2 財務查到應付。",
  "庫存報表篩選 INSPECT 待驗區，應看到待驗商品。",
  "看到舊資料警示時，寫入操作應暫停並先重新整理。"
];

const storage = StockFlowStorage.createInventoryStorage({ seedState, appVersion, assetVersion });
const initialLoad = storage.loadState();
let store = createInventoryStore(initialLoad.state);
const accessControl = StockFlowAccess.createInventoryAccess({
  getCurrentUser: () => currentUser,
  listPermissionScopes: (employeeId) => store && store.listPermissionScopes
    ? store.listPermissionScopes({ employeeId, activeOnly: true })
    : [],
  t,
  interpolate,
  moduleLabel
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
const auditControl = StockFlowAudit.createInventoryAudit({
  getFilterValues: () => ({
    query: auditQuery.value,
    month: auditMonth.value,
    action: auditActionFilter.value,
    highRiskOnly: auditHighRiskOnly.checked
  }),
  roleLabel,
  escapeHtml,
  recordAudit
});
const backupControl = StockFlowBackup.createInventoryBackup({
  escapeHtml,
  validateBackupEnvelope: (backup) => storage.validateBackupEnvelope(backup),
  onValidBackup: (result) => {
    pendingRestoreState = result.state;
    restoreButton.disabled = false;
    backupPreview.innerHTML = renderBackupSummary(result.summary);
    backupPreview.classList.remove("empty");
    setStatus("備份檔檢查通過，可以準備還原。");
    renderActionAvailability();
  },
  onInvalidBackup: (result) => {
    backupPreview.innerHTML = `<strong>備份檔無法還原</strong><span>${escapeHtml(result.message)}</span>`;
    backupPreview.classList.remove("empty");
    setStatus("備份檔檢查未通過。", true);
    renderActionAvailability();
  },
  onReadError: () => {
    backupPreview.innerHTML = "<strong>備份檔無法讀取</strong><span>請確認檔案是 JSON 格式。</span>";
    backupPreview.classList.remove("empty");
    setStatus("備份檔讀取失敗。", true);
    renderActionAvailability();
  }
});
const masterDataUi = StockFlowMasterDataUi.createInventoryMasterDataUi({
  document,
  getStore: () => store,
  fields: {
    categoryQuery,
    warehouseQuery,
    departmentQuery,
    employeeQuery,
    partnerQuery,
    partnerRoleFilter
  },
  formatCount,
  escapeHtml,
  escapeAttr,
  t,
  statusBadge,
  warehouseTypeLabel,
  departmentTypeLabel,
  roleLabel
});

setDefaultDates();
document.querySelector("#app-version").textContent = `v${appVersion}`;
applyTextBaseline();
bindEvents();
bindNumericInputs();
bindValidationText();
bindStorageFreshnessGuard();
render();
if (initialLoad.notice) {
  setStatus(initialLoad.notice);
}

function bindEvents() {
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      if (!canViewModule(tab.dataset.tab)) {
        recordAudit("access", {
          entityType: "module",
          entityId: tab.dataset.tab,
          summary: modulePermissionReason(tab.dataset.tab),
          result: "denied",
          riskLevel: "medium"
        }, true);
        setStatus(modulePermissionReason(tab.dataset.tab), true, "warning");
        return;
      }

      recordAudit("read", {
        entityType: "module",
        entityId: tab.dataset.tab,
        summary: `查看模組：${moduleLabel(tab.dataset.tab)}`,
        riskLevel: tab.dataset.tab === "finance" || tab.dataset.tab === "reports" ? "medium" : "low"
      }, true);
      activeTab = tab.dataset.tab;
      render();
    });
  });

  roleSelect.addEventListener("change", () => {
    currentUser = Object.assign({}, currentUser, { role: normalizeRole(roleSelect.value) });
    saveCurrentUser();
    recordAudit("access", {
      entityType: "role",
      entityId: currentUser.role,
      summary: `切換本機角色：${currentRoleLabel()}`,
      riskLevel: "medium"
    }, true);
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

  productForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAction("manageProducts")) {
      return;
    }
    const data = Object.fromEntries(new FormData(productForm));
    const wasEditing = Boolean(editingProductId);
    const product = wasEditing
      ? store.updateProduct(editingProductId, data)
      : store.addProduct(data);

    if (!product) {
      setStatus(StockFlowMessages.message("productSaveFailed"), true);
      return;
    }

    if (product.error === "DUPLICATE_SKU") {
      setStatus(StockFlowMessages.message("duplicateSku"), true);
      return;
    }

    recordAudit(wasEditing ? "update" : "create", {
      entityType: "product",
      entityId: product.id,
      summary: `${wasEditing ? "更新" : "新增"}商品：${product.name}`,
      before: wasEditing ? { productId: editingProductId } : {},
      after: { sku: product.sku, name: product.name, category: product.category, cost: product.cost, price: product.price },
      riskLevel: wasEditing ? "high" : "medium"
    });
    resetProductForm();
    saveState();
    setStatus(`${wasEditing ? "已更新" : "已新增"}商品：${product.name}`);
    render();
  });

  cancelProductEdit.addEventListener("click", () => {
    resetProductForm();
    setStatus("已取消商品編輯。");
    renderProducts();
  });

  partnerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAction("managePartners")) {
      return;
    }
    const data = Object.fromEntries(new FormData(partnerForm));
    const wasEditing = Boolean(editingPartnerId);
    const partner = wasEditing
      ? store.updatePartner(editingPartnerId, data)
      : store.addPartner(data);

    if (!partner) {
      setStatus(StockFlowMessages.message("partnerSaveFailed"), true);
      return;
    }

    if (partner.error === "DUPLICATE_PARTNER") {
      setStatus(StockFlowMessages.message("duplicatePartner"), true);
      return;
    }

    recordAudit(wasEditing ? "update" : "create", {
      entityType: "partner",
      entityId: partner.id,
      summary: `${wasEditing ? "更新" : "新增"}往來對象：${partner.name}`,
      after: { role: partner.role, name: partner.name, contact: partner.contact },
      riskLevel: "medium"
    });
    resetPartnerForm();
    saveState();
    setStatus(`${wasEditing ? "已更新" : "已新增"}往來對象：${partner.name}`);
    render();
  });

  cancelPartnerEdit.addEventListener("click", () => {
    resetPartnerForm();
    setStatus("已取消往來對象編輯。");
    renderPartners();
  });

  categoryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAction("manageMasterData")) {
      return;
    }
    const category = store.addProductCategory(Object.fromEntries(new FormData(categoryForm)));

    if (!category) {
      setStatus(StockFlowMessages.message("categorySaveFailed"), true);
      return;
    }

    recordAudit("create", {
      entityType: "productCategory",
      entityId: category.id,
      summary: `新增分類：${category.name}`,
      after: { code: category.code, name: category.name },
      riskLevel: "low"
    });
    categoryForm.reset();
    categoryForm.elements.sortOrder.value = "10";
    saveState();
    setStatus(`已新增分類：${category.name}`);
    render();
  });

  warehouseForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAction("manageMasterData")) {
      return;
    }
    const warehouse = store.addWarehouse(Object.fromEntries(new FormData(warehouseForm)));

    if (!warehouse) {
      setStatus(StockFlowMessages.message("warehouseSaveFailed"), true);
      return;
    }

    recordAudit("create", {
      entityType: "warehouse",
      entityId: warehouse.id,
      summary: `新增倉庫：${warehouse.name}`,
      after: { code: warehouse.code, name: warehouse.name, type: warehouse.type },
      riskLevel: "medium"
    });
    warehouseForm.reset();
    saveState();
    setStatus(`已新增倉庫：${warehouse.name}`);
    render();
  });

  departmentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAction("manageMasterData")) {
      return;
    }

    const department = store.addDepartment(Object.fromEntries(new FormData(departmentForm)));
    if (!department) {
      setStatus("部門資料未儲存，請確認代碼沒有重複。", true);
      return;
    }

    recordAudit("create", {
      entityType: "department",
      entityId: department.id,
      summary: `新增部門：${department.name}`,
      after: { code: department.code, name: department.name, type: department.type },
      riskLevel: "medium"
    });
    departmentForm.reset();
    saveState();
    setStatus(`已新增部門：${department.name}`);
    render();
  });

  employeeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAction("manageMasterData")) {
      return;
    }

    const employee = store.addEmployee(Object.fromEntries(new FormData(employeeForm)));
    if (!employee) {
      setStatus("員工資料未儲存，請確認員工編號沒有重複，且已選擇啟用中的部門。", true);
      return;
    }

    recordAudit("create", {
      entityType: "employee",
      entityId: employee.id,
      summary: `新增員工：${employee.name}`,
      after: { employeeNo: employee.employeeNo, name: employee.name, departmentId: employee.departmentId, role: employee.role },
      riskLevel: "medium"
    });
    employeeForm.reset();
    saveState();
    setStatus(`已新增員工：${employee.name}`);
    render();
  });

  purchaseForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAction("createPurchase")) {
      return;
    }
    const data = Object.fromEntries(new FormData(purchaseForm));
    const purchase = store.addPurchaseOrder({
      supplier: data.supplier,
      warehouseId: data.warehouseId,
      date: data.date,
      dueDate: data.dueDate,
      createPayable: Boolean(data.createPayable),
      status: data.saveAsDraft ? "draft" : "confirmed",
      createdBy: currentUser.name,
      ownerEmployeeId: currentUser.employeeId || 0,
      ownerDepartmentId: currentUser.departmentId || 0,
      createdByEmployeeId: currentUser.employeeId || 0,
      note: data.note,
      items: collectOrderItems(data, "unitCost")
    });

    if (!purchase) {
      setStatus(StockFlowMessages.transactionError(purchase, "purchaseOrderFailed"), true);
      return;
    }

    recordAudit("create", {
      entityType: "purchase",
      documentNo: purchase.documentNo,
      relatedDocumentNos: [purchase.documentNo],
      summary: `建立進貨單 ${purchase.documentNo}`,
      after: { lines: purchase.lines.length, total: purchase.total },
      riskLevel: data.saveAsDraft ? "medium" : "high"
    });
    purchaseForm.reset();
    setDefaultDates();
    saveState();
    setStatus(`已建立進貨單 ${purchase.documentNo}，共 ${purchase.lines.length} 筆明細。`);
    render();
  });

  saleForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAction("createSale")) {
      return;
    }
    const data = Object.fromEntries(new FormData(saleForm));
    const sale = store.addSaleOrder({
      customer: data.customer,
      warehouseId: data.warehouseId,
      date: data.date,
      dueDate: data.dueDate,
      createReceivable: Boolean(data.createReceivable),
      status: data.saveAsDraft ? "draft" : "confirmed",
      createdBy: currentUser.name,
      ownerEmployeeId: currentUser.employeeId || 0,
      ownerDepartmentId: currentUser.departmentId || 0,
      createdByEmployeeId: currentUser.employeeId || 0,
      note: data.note,
      items: collectOrderItems(data, "unitPrice")
    });

    if (!sale) {
      setStatus(StockFlowMessages.message("saleOrderFailed"), true);
      return;
    }

    if (sale.error === "INSUFFICIENT_STOCK") {
      setStatus(StockFlowMessages.transactionError(sale, "saleOrderFailed"), true);
      return;
    }

    recordAudit("create", {
      entityType: "sale",
      documentNo: sale.documentNo,
      relatedDocumentNos: [sale.documentNo],
      summary: `建立銷售單 ${sale.documentNo}`,
      after: { lines: sale.lines.length, total: sale.total },
      riskLevel: data.saveAsDraft ? "medium" : "high"
    });
    saleForm.reset();
    setDefaultDates();
    saveState();
    setStatus(`已建立銷售單 ${sale.documentNo}，共 ${sale.lines.length} 筆明細。`);
    render();
  });

  adjustmentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAction("stockAdjust")) {
      return;
    }
    const data = Object.fromEntries(new FormData(adjustmentForm));
    const adjustment = store.addStockCount(data);

    if (!adjustment) {
      setStatus(StockFlowMessages.message("adjustmentFailed"), true);
      return;
    }

    if (adjustment.error === "NO_DIFFERENCE") {
      setStatus(StockFlowMessages.transactionError(adjustment, "adjustmentFailed"));
      return;
    }

    recordAudit("create", {
      entityType: "adjustment",
      entityId: adjustment.id,
      documentNo: adjustment.documentNo,
      summary: `建立盤點調整 ${adjustment.documentNo}`,
      after: { quantity: adjustment.quantity, reason: adjustment.reason },
      riskLevel: "high"
    });
    adjustmentForm.reset();
    setDefaultDates();
    saveState();
    setStatus(`已建立盤點調整 ${adjustment.documentNo}，異動 ${adjustment.quantity > 0 ? "+" : ""}${formatQuantity(adjustment.quantity)}。`);
    render();
  });

  transferForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAction("transferStock")) {
      return;
    }
    const data = Object.fromEntries(new FormData(transferForm));
    const transfer = store.addTransferOrder({
      fromWarehouseId: data.fromWarehouseId,
      toWarehouseId: data.toWarehouseId,
      date: data.date,
      note: data.note,
      items: collectTransferItems(data)
    });

    if (!transfer) {
      setStatus(StockFlowMessages.message("transferOrderFailed"), true);
      return;
    }

    if (transfer.error === "INSUFFICIENT_STOCK") {
      setStatus(StockFlowMessages.transactionError(transfer, "transferOrderFailed"), true);
      return;
    }

    recordAudit("create", {
      entityType: "transfer",
      documentNo: transfer.documentNo,
      relatedDocumentNos: [transfer.documentNo],
      summary: `建立調撥單 ${transfer.documentNo}`,
      after: { lines: transfer.lines.length, totalQuantity: transfer.totalQuantity },
      riskLevel: "high"
    });
    transferForm.reset();
    setDefaultDates();
    saveState();
    setStatus(`已建立調撥單 ${transfer.documentNo}，共 ${transfer.lines.length} 筆明細。`);
    render();
  });

  paymentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAction("managePayments")) {
      return;
    }
    const data = Object.fromEntries(new FormData(paymentForm));
    const payment = store.addPayment({
      direction: data.direction,
      targetType: data.direction === "out" ? "payable" : "receivable",
      targetId: data.targetId,
      amount: data.amount,
      method: data.method,
      date: data.date,
      note: data.note
    });

    if (!payment) {
      setStatus(StockFlowMessages.message("paymentSaveFailed"), true);
      return;
    }

    if (payment.error === "PAYMENT_EXCEEDS_BALANCE") {
      setStatus(StockFlowMessages.message("paymentExceedsBalance"), true);
      return;
    }

    if (payment.error === "INVALID_PAYMENT_DIRECTION") {
      setStatus(StockFlowMessages.message("invalidPaymentDirection"), true);
      return;
    }

    recordAudit("create", {
      entityType: "payment",
      entityId: payment.id,
      summary: `登錄${payment.direction === "in" ? "收款" : "付款"}`,
      after: { direction: payment.direction, targetType: payment.targetType, targetId: payment.targetId, amount: payment.amount },
      riskLevel: "high"
    });
    paymentForm.reset();
    setDefaultDates();
    saveState();
    setStatus("已儲存收付款。");
    render();
  });

  preferencesForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAction("savePreferences")) {
      return;
    }
    const data = Object.fromEntries(new FormData(preferencesForm));
    data.showPrintDate = preferencesForm.elements.showPrintDate.checked;
    store.updatePreferences(data);
    recordAudit("update", {
      entityType: "preferences",
      summary: "更新格式與報表設定",
      after: { locale: data.locale, currencyCode: data.currencyCode, reportTitle: data.reportTitle },
      riskLevel: "medium"
    });
    saveState();
    setStatus("已儲存格式與報表設定。");
    render();
  });

  document.querySelector("#product-table").addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-product-id]");
    if (editButton) {
      if (!requireAction("manageProducts")) {
        return;
      }
      startProductEdit(Number(editButton.dataset.editProductId));
      return;
    }

    const button = event.target.closest("[data-deactivate-id]");

    if (!button) {
      return;
    }

    if (!requireAction("manageProducts")) {
      return;
    }

    const product = store.listProducts().find((item) => item.id === Number(button.dataset.deactivateId));

    if (!product || !confirmAction("deactivateProduct", { name: product.name })) {
      return;
    }

    const deactivatedProduct = store.deactivateProduct(product.id);

    if (deactivatedProduct) {
      recordAudit("update", {
        entityType: "product",
        entityId: deactivatedProduct.id,
        summary: `停用商品：${deactivatedProduct.name}`,
        before: { active: true },
        after: { active: false },
        reason: "停用商品",
        riskLevel: "high"
      });
      saveState();
      setStatus(`已停用商品：${deactivatedProduct.name}`);
      render();
    }
  });

  document.querySelector("#partner-table").addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-partner-id]");
    if (editButton) {
      if (!requireAction("managePartners")) {
        return;
      }
      startPartnerEdit(Number(editButton.dataset.editPartnerId));
      return;
    }

    const button = event.target.closest("[data-deactivate-partner-id]");

    if (!button) {
      return;
    }

    if (!requireAction("managePartners")) {
      return;
    }

    const partner = store.listPartners().find((item) => item.id === Number(button.dataset.deactivatePartnerId));

    if (!partner || !confirmAction("deactivatePartner", { name: partner.name })) {
      return;
    }

    const deactivatedPartner = store.deactivatePartner(partner.id);

    if (deactivatedPartner) {
      recordAudit("update", {
        entityType: "partner",
        entityId: deactivatedPartner.id,
        summary: `停用往來對象：${deactivatedPartner.name}`,
        before: { active: true },
        after: { active: false },
        reason: "停用往來對象",
        riskLevel: "medium"
      });
      saveState();
      setStatus(`已停用往來對象：${deactivatedPartner.name}`);
      render();
    }
  });

  document.querySelector("#category-table").addEventListener("click", (event) => {
    const button = event.target.closest("[data-deactivate-category-id]");

    if (!button) {
      return;
    }

    if (!requireAction("manageMasterData")) {
      return;
    }

    const category = store.listProductCategories().find((item) => item.id === Number(button.dataset.deactivateCategoryId));

    if (!category || !confirmAction("deactivateCategory", { name: category.name })) {
      return;
    }

    const deactivatedCategory = store.deactivateProductCategory(category.id);

    if (deactivatedCategory) {
      recordAudit("update", {
        entityType: "productCategory",
        entityId: deactivatedCategory.id,
        summary: `停用分類：${deactivatedCategory.name}`,
        before: { active: true },
        after: { active: false },
        reason: "停用分類",
        riskLevel: "medium"
      });
      saveState();
      setStatus(`已停用分類：${deactivatedCategory.name}`);
      render();
    }
  });

  document.querySelector("#warehouse-table").addEventListener("click", (event) => {
    const button = event.target.closest("[data-deactivate-warehouse-id]");

    if (!button) {
      return;
    }

    if (!requireAction("manageMasterData")) {
      return;
    }

    const warehouse = store.listWarehouses().find((item) => item.id === Number(button.dataset.deactivateWarehouseId));

    if (!warehouse || !confirmAction("deactivateWarehouse", { name: warehouse.name })) {
      return;
    }

    const deactivatedWarehouse = store.deactivateWarehouse(warehouse.id);

    if (deactivatedWarehouse) {
      recordAudit("update", {
        entityType: "warehouse",
        entityId: deactivatedWarehouse.id,
        summary: `停用倉庫：${deactivatedWarehouse.name}`,
        before: { active: true },
        after: { active: false },
        reason: "停用倉庫",
        riskLevel: "high"
      });
      saveState();
      setStatus(`已停用倉庫：${deactivatedWarehouse.name}`);
      render();
    }
  });

  document.querySelector("#department-table").addEventListener("click", (event) => {
    const button = event.target.closest("[data-deactivate-department-id]");
    if (!button) {
      return;
    }

    if (!requireAction("manageMasterData")) {
      return;
    }

    const department = store.listDepartments().find((item) => item.id === Number(button.dataset.deactivateDepartmentId));
    if (!department || !confirmAction("deactivateDepartment", { name: department.name })) {
      return;
    }

    const deactivatedDepartment = store.deactivateDepartment(department.id);
    if (deactivatedDepartment) {
      recordAudit("update", {
        entityType: "department",
        entityId: deactivatedDepartment.id,
        summary: `停用部門：${deactivatedDepartment.name}`,
        before: { active: true },
        after: { active: false },
        reason: "停用部門",
        riskLevel: "high"
      });
      saveState();
      setStatus(`已停用部門：${deactivatedDepartment.name}`);
      render();
    }
  });

  document.querySelector("#employee-table").addEventListener("click", (event) => {
    const button = event.target.closest("[data-deactivate-employee-id]");
    if (!button) {
      return;
    }

    if (!requireAction("manageMasterData")) {
      return;
    }

    const employee = store.listEmployees().find((item) => item.id === Number(button.dataset.deactivateEmployeeId));
    if (!employee || !confirmAction("deactivateEmployee", { name: employee.name })) {
      return;
    }

    const deactivatedEmployee = store.deactivateEmployee(employee.id);
    if (deactivatedEmployee) {
      if (currentUser.employeeId === deactivatedEmployee.id) {
        currentUser = loadCurrentUser();
      }
      recordAudit("update", {
        entityType: "employee",
        entityId: deactivatedEmployee.id,
        summary: `停用員工：${deactivatedEmployee.name}`,
        before: { active: true, canLogin: true },
        after: { active: false, canLogin: false },
        reason: "停用員工",
        riskLevel: "high"
      });
      saveState();
      setStatus(`已停用員工：${deactivatedEmployee.name}`);
      render();
    }
  });

  document.querySelector("#purchase-list").addEventListener("click", (event) => {
    const returnButton = event.target.closest("[data-return-purchase-id]");
    if (returnButton) {
      handleReturn("purchase", Number(returnButton.dataset.returnPurchaseId));
      return;
    }

    const reassignButton = event.target.closest("[data-reassign-purchase-owner-id]");
    if (reassignButton) {
      handleDocumentOwnerReassign("purchase", Number(reassignButton.dataset.reassignPurchaseOwnerId));
      return;
    }

    const workflowButton = event.target.closest("[data-approval-action][data-purchase-id]");
    if (workflowButton) {
      handleDocumentWorkflow("purchase", Number(workflowButton.dataset.purchaseId), workflowButton.dataset.approvalAction);
      return;
    }

    const reversalButton = event.target.closest("[data-create-purchase-reversal-id]");
    if (reversalButton) {
      handleVoidReversal("purchase", Number(reversalButton.dataset.createPurchaseReversalId));
      return;
    }

    const button = event.target.closest("[data-remove-purchase-id]");

    if (!button) {
      return;
    }

    const targetDocument = targetDocumentById("purchase", Number(button.dataset.removePurchaseId));
    if (!requireAction("voidDocument", { targetDocument })) {
      return;
    }

    if (!confirmAction("voidPurchase")) {
      return;
    }

    const reason = prompt(t("prompts.voidReason", "請填寫作廢原因，系統會保留原始單據紀錄。"));
    if (!String(reason || "").trim()) {
      setStatus(t("messages.voidReasonRequired", "作廢需要填寫原因，已取消。"), true);
      return;
    }

    const result = store.removePurchase(Number(button.dataset.removePurchaseId), {
      reason,
      user: currentUser.name
    });

    if (result && result.error === "NEGATIVE_STOCK") {
      setStatus(StockFlowMessages.transactionError(result, "negativeStockOnRemove"), true);
      return;
    }

    if (result) {
      recordAudit("delete", {
        entityType: "purchase",
        entityId: button.dataset.removePurchaseId,
        summary: "作廢進貨紀錄",
        reason,
        riskLevel: "high"
      });
      saveState();
      setStatus("已作廢進貨紀錄，原單已保留並排除於有效庫存。");
      render();
    }
  });

  document.querySelector("#sale-list").addEventListener("click", (event) => {
    const returnButton = event.target.closest("[data-return-sale-id]");
    if (returnButton) {
      handleReturn("sale", Number(returnButton.dataset.returnSaleId));
      return;
    }

    const reassignButton = event.target.closest("[data-reassign-sale-owner-id]");
    if (reassignButton) {
      handleDocumentOwnerReassign("sale", Number(reassignButton.dataset.reassignSaleOwnerId));
      return;
    }

    const workflowButton = event.target.closest("[data-approval-action][data-sale-id]");
    if (workflowButton) {
      handleDocumentWorkflow("sale", Number(workflowButton.dataset.saleId), workflowButton.dataset.approvalAction);
      return;
    }

    const reversalButton = event.target.closest("[data-create-sale-reversal-id]");
    if (reversalButton) {
      handleVoidReversal("sale", Number(reversalButton.dataset.createSaleReversalId));
      return;
    }

    const button = event.target.closest("[data-remove-sale-id]");

    if (!button) {
      return;
    }

    const targetDocument = targetDocumentById("sale", Number(button.dataset.removeSaleId));
    if (!requireAction("voidDocument", { targetDocument })) {
      return;
    }

    if (!confirmAction("voidSale")) {
      return;
    }

    const reason = prompt(t("prompts.voidReason", "請填寫作廢原因，系統會保留原始單據紀錄。"));
    if (!String(reason || "").trim()) {
      setStatus(t("messages.voidReasonRequired", "作廢需要填寫原因，已取消。"), true);
      return;
    }

    if (store.removeSale(Number(button.dataset.removeSaleId), {
      reason,
      user: currentUser.name
    })) {
      recordAudit("delete", {
        entityType: "sale",
        entityId: button.dataset.removeSaleId,
        summary: "作廢銷售紀錄",
        reason,
        riskLevel: "high"
      });
      saveState();
      setStatus("已作廢銷售紀錄，原單已保留並排除於有效庫存。");
      render();
    }
  });

  productQuery.addEventListener("input", renderProducts);
  productCategoryFilter.addEventListener("change", renderProducts);
  categoryQuery.addEventListener("input", renderProductCategories);
  warehouseQuery.addEventListener("input", renderWarehouses);
  departmentQuery.addEventListener("input", renderDepartments);
  employeeQuery.addEventListener("input", renderEmployees);
  partnerQuery.addEventListener("input", renderPartners);
  partnerRoleFilter.addEventListener("change", renderPartners);
  purchaseQuery.addEventListener("input", renderPurchases);
  purchaseMonth.addEventListener("change", renderPurchases);
  purchaseIncludeVoided.addEventListener("change", () => {
    if (purchaseIncludeVoided.checked) {
      recordSensitiveRead("purchase", "開啟進貨包含作廢查詢", { includeVoided: true, month: purchaseMonth.value });
    }
    renderPurchases();
  });
  saleQuery.addEventListener("input", renderSales);
  saleMonth.addEventListener("change", renderSales);
  saleIncludeVoided.addEventListener("change", () => {
    if (saleIncludeVoided.checked) {
      recordSensitiveRead("sale", "開啟銷售包含作廢查詢", { includeVoided: true, month: saleMonth.value });
    }
    renderSales();
  });
  adjustmentQuery.addEventListener("input", renderAdjustments);
  adjustmentMonth.addEventListener("change", renderAdjustments);
  transferQuery.addEventListener("input", renderTransfers);
  transferMonth.addEventListener("change", renderTransfers);
  financeQuery.addEventListener("input", renderFinance);
  financeMonth.addEventListener("change", renderFinance);
  paymentDirection.addEventListener("change", renderPaymentTargets);
  reportMonth.addEventListener("change", renderReports);
  movementQuery.addEventListener("input", renderReports);
  auditQuery.addEventListener("input", renderAuditLogs);
  auditMonth.addEventListener("change", renderAuditLogs);
  auditActionFilter.addEventListener("change", renderAuditLogs);
  auditHighRiskOnly.addEventListener("change", renderAuditLogs);
  auditExportButton.addEventListener("click", () => {
    if (!requireAction("exportAuditLogs")) {
      return;
    }

    const logs = store.listAuditLogs(currentAuditOptions());
    recordAudit("export", {
      entityType: "auditLog",
      summary: "匯出稽核 CSV",
      after: currentAuditOptions(),
      riskLevel: "high"
    });
    saveState();
    downloadCsv("stockflow-audit-log.csv", toCsv(formatAuditCsvRows(logs)));
    setStatus("已匯出稽核 CSV。");
    renderAuditLogs();
  });
  reportPrintButton.addEventListener("click", () => {
    recordAudit("print", {
      entityType: "report",
      summary: "列印營運報表",
      after: { month: reportMonth.value, movementQuery: movementQuery.value },
      riskLevel: "high"
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
    if (!button) {
      return;
    }
    activeLearningTopicId = button.dataset.learningTopic;
    renderLearning();
  });
  learningPrev.addEventListener("click", () => moveLearningTopic(-1));
  learningNext.addEventListener("click", () => moveLearningTopic(1));

  refreshButton.addEventListener("click", () => {
    window.location.reload();
  });

  exportButton.addEventListener("click", () => {
    if (!requireAction("exportInventoryCsv")) {
      return;
    }
    recordAudit("export", {
      entityType: "inventoryReport",
      summary: "匯出庫存 CSV",
      after: currentStockOptions(),
      riskLevel: "medium"
    });
    saveState();
    downloadCsv("inventory-report.csv", toCsv(formatInventoryCsvRows(store.exportInventoryRows(currentStockOptions()))));
    setStatus("已匯出庫存 CSV。");
  });

  backupExportButton.addEventListener("click", () => {
    if (!requireAction("exportBackup")) {
      return;
    }
    recordAudit("export", {
      entityType: "backup",
      summary: "匯出完整備份 JSON",
      riskLevel: "high"
    });
    saveState();
    downloadJson(backupControl.backupFilename(today), storage.createStorageEnvelope(store.snapshot()));
    setStatus("已匯出完整備份 JSON。");
  });

  backupFileInput.addEventListener("change", () => {
    pendingRestoreState = null;
    restoreButton.disabled = true;
    const file = backupFileInput.files && backupFileInput.files[0];

    if (!file) {
      backupPreview.textContent = "尚未選擇備份檔。";
      backupPreview.classList.add("empty");
      renderActionAvailability();
      return;
    }

    readBackupFile(file);
  });

  restoreButton.addEventListener("click", () => {
    if (!pendingRestoreState) {
      return;
    }

    if (!requireAction("restoreBackup")) {
      return;
    }

    if (!confirmAction("restoreBackup")) {
      return;
    }

    store = createInventoryStore(pendingRestoreState);
    recordAudit("restore", {
      entityType: "backup",
      summary: "完成整包還原",
      reason: "使用者確認還原備份",
      riskLevel: "high"
    });
    pendingRestoreState = null;
    restoreButton.disabled = true;
    backupFileInput.value = "";
    saveState();
    setStatus("已完成整包還原，資料已重新載入。");
    render();
  });

  resetButton.addEventListener("click", () => {
    if (!requireAction("resetSampleData")) {
      return;
    }

    if (!confirmAction("resetSampleData")) {
      return;
    }

    const previousAuditLogs = store.listAuditLogs ? store.listAuditLogs({}) : [];
    store = createInventoryStore(Object.assign({}, seedState, { auditLogs: previousAuditLogs }));
    recordAudit("restore", {
      entityType: "sampleData",
      summary: "重設為範例資料",
      reason: "使用者確認重設範例資料",
      riskLevel: "high"
    });
    saveState();
    setStatus("已重置為範例資料。");
    render();
  });
}

function bindNumericInputs() {
  document.querySelectorAll('input[type="number"]').forEach((input) => {
    input.addEventListener("input", () => {
      const integerOnly = input.step === "1" || input.dataset.numeric === "integer";
      const cleaned = input.value
        .replace(/[^\d.-]/g, "")
        .replace(/(?!^)-/g, "");
      const normalized = integerOnly
        ? cleaned.replace(/\..*$/, "")
        : cleaned.replace(/(\..*)\./g, "$1");

      if (input.value !== normalized) {
        input.value = normalized;
      }
    });
  });
}

function bindValidationText() {
  document.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("invalid", () => {
      field.setCustomValidity(validationMessageFor(field));
    });

    field.addEventListener("input", () => {
      field.setCustomValidity("");
    });

    field.addEventListener("change", () => {
      field.setCustomValidity("");
    });
  });
}

function bindStorageFreshnessGuard() {
  window.addEventListener("storage", (event) => {
    if (event.key !== storage.storageKey || event.newValue === event.oldValue) {
      return;
    }

    dataStale = true;
    setStatus(t("operationGuards.staleData", "資料已在其他視窗更新。為避免庫存或金額不一致，請先重新整理畫面後再操作。"), true, "warning");
    renderActionAvailability();
  });
}

function canWrite() {
  if (!dataStale) {
    return true;
  }

  setStatus(t("operationGuards.staleData", "資料已在其他視窗更新。為避免庫存或金額不一致，請先重新整理畫面後再操作。"), true, "warning");
  return false;
}

function requireAction(action, context) {
  if (!canWrite()) {
    return false;
  }

  if (canPerform(action, context)) {
    return true;
  }

  recordAudit("access", {
    entityType: "permission",
    entityId: action,
    summary: permissionReason(action),
    result: "denied",
    riskLevel: "medium"
  }, true);
  setStatus(permissionReason(action), true, "warning");
  return false;
}

function handleDocumentWorkflow(type, id, workflowAction) {
  const permissionAction = approvalPermissionAction(type, workflowAction);
  const targetDocument = targetDocumentById(type, id);
  if (!requireAction(permissionAction, { targetDocument })) {
    return;
  }

  let reason = "";
  if (workflowAction === "reject" || workflowAction === "requestVoid") {
    reason = prompt(workflowAction === "reject"
      ? t("prompts.rejectReason", "請輸入退回原因")
      : t("prompts.voidRequestReason", "請輸入作廢申請原因"));
    if (!String(reason || "").trim()) {
      setStatus(t("messages.approvalReasonRequired", "請先填寫原因。"), true);
      return;
    }
  }

  const result = type === "purchase"
    ? store.transitionPurchase(id, workflowAction, { user: currentUser.name, reason })
    : store.transitionSale(id, workflowAction, { user: currentUser.name, reason });

  if (!result) {
    setStatus(t("messages.approvalActionFailed", "單據狀態無法更新。"), true);
    return;
  }

  if (result.error === "INSUFFICIENT_STOCK") {
    setStatus(StockFlowMessages.message("insufficientStock"), true);
    return;
  }

  if (result.error) {
    setStatus(t("messages.approvalActionFailed", "單據狀態無法更新。"), true);
    return;
  }

  saveState();
  recordAudit("update", {
    entityType: type,
    entityId: id,
    documentNo: result[0] && result[0].documentNo,
    relatedDocumentNos: result[0] && result[0].documentNo ? [result[0].documentNo] : [],
    summary: `單據狀態更新：${approvalActionLabel(workflowAction)}`,
    reason,
    after: { action: workflowAction, status: result[0] && result[0].status },
    riskLevel: workflowAction === "confirm" || workflowAction === "requestVoid" ? "high" : "medium"
  });
  saveState();
  setStatus(interpolate(t("messages.approvalActionSaved", "單據狀態已更新：{action}"), {
    action: approvalActionLabel(workflowAction)
  }));
  render();
}

function handleVoidReversal(type, id) {
  const targetDocument = targetDocumentById(type, id);
  if (!requireAction("voidDocument", { targetDocument })) {
    return;
  }

  const result = store.createVoidReversal(type, id, { user: currentUser.name });
  if (!result) {
    setStatus("找不到可建立沖銷事件的作廢單據。", true);
    return;
  }

  saveState();
  recordAudit("create", {
    entityType: "voidReversal",
    entityId: result.id,
    documentNo: result.documentNo,
    sourceDocumentNo: result.sourceDocumentNo,
    relatedDocumentNos: [result.sourceDocumentNo, result.documentNo],
    summary: `建立沖銷事件：${result.documentNo}`,
    riskLevel: "high"
  });
  saveState();
  setStatus(`已建立沖銷事件：${result.documentNo}`);
  render();
}

function handleReturn(type, id) {
  const permissionAction = returnPermissionAction(type);
  const targetDocument = targetDocumentById(type, id);
  if (!requireAction(permissionAction, { targetDocument })) {
    return;
  }

  const quantity = prompt(t("prompts.returnQuantity", "請輸入退貨數量"));
  if (!Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
    setStatus(t("messages.returnQuantityRequired", "請輸入有效的退貨數量。"), true);
    return;
  }

  const reason = prompt(t("prompts.returnReason", "請輸入退貨原因"));
  if (!String(reason || "").trim()) {
    setStatus(t("messages.returnReasonRequired", "請先填寫退貨原因。"), true);
    return;
  }

  const input = {
    sourceLineId: id,
    quantity,
    reason,
    date: today,
    user: currentUser.name
  };
  const result = type === "purchase"
    ? store.addPurchaseReturn(input)
    : store.addSalesReturn(input);

  if (!result) {
    setStatus(t("messages.returnSaveFailed", "退貨單無法建立。"), true);
    return;
  }

  if (result.error === "RETURN_QUANTITY_EXCEEDS_SOURCE") {
    setStatus(t("messages.returnQuantityExceeded", "退貨數量不可超過原單剩餘可退數量。"), true);
    return;
  }

  if (result.error === "INSUFFICIENT_STOCK") {
    setStatus(StockFlowMessages.message("insufficientStock"), true);
    return;
  }

  saveState();
  recordAudit("create", {
    entityType: type === "purchase" ? "purchaseReturn" : "salesReturn",
    entityId: result.id,
    documentNo: result.documentNo,
    sourceDocumentNo: result.sourceDocumentNo,
    relatedDocumentNos: [result.sourceDocumentNo, result.documentNo],
    summary: `建立退貨單 ${result.documentNo}`,
    reason,
    after: { quantity: result.quantity, unitAmount: result.unitAmount },
    riskLevel: "high"
  });
  saveState();
  setStatus(interpolate(t("messages.returnSaved", "已建立退貨單 {documentNo}。"), {
    documentNo: result.documentNo
  }));
  render();
}

function handleDocumentOwnerReassign(type, id) {
  const targetDocument = targetDocumentById(type, id);
  const permissionAction = ownerReassignPermissionAction(type);
  if (!currentUser.employeeId || !currentUser.departmentId) {
    setStatus(t("messages.employeeRequiredForOwnership", "請先選擇本機人員，再調整單據負責人。"), true, "warning");
    return;
  }

  if (!requireAction(permissionAction, { targetDocument })) {
    return;
  }

  const result = type === "purchase"
    ? store.updatePurchaseOwner(id, {
      ownerEmployeeId: currentUser.employeeId,
      ownerDepartmentId: currentUser.departmentId,
      lastEditedByEmployeeId: currentUser.employeeId
    })
    : store.updateSaleOwner(id, {
      ownerEmployeeId: currentUser.employeeId,
      ownerDepartmentId: currentUser.departmentId,
      lastEditedByEmployeeId: currentUser.employeeId
    });

  if (!result) {
    setStatus(t("messages.ownerReassignFailed", "單據負責人無法更新。"), true);
    return;
  }

  if (result.error === "DOCUMENT_CLOSED") {
    setStatus(t("messages.ownerReassignClosed", "這張單據已正式成立或已結束，不能直接改負責人。"), true, "warning");
    return;
  }

  saveState();
  recordAudit("update", {
    entityType: type,
    entityId: id,
    documentNo: result[0] && result[0].documentNo,
    relatedDocumentNos: result[0] && result[0].documentNo ? [result[0].documentNo] : [],
    summary: `調整單據負責人：${currentUser.name}`,
    after: { ownerEmployeeId: currentUser.employeeId, ownerDepartmentId: currentUser.departmentId },
    riskLevel: "medium"
  });
  saveState();
  setStatus(t("messages.ownerReassigned", "已更新單據負責人。"));
  render();
}

function approvalPermissionAction(type, workflowAction) {
  if (workflowAction === "submit") {
    return type === "purchase" ? "submitPurchase" : "submitSale";
  }

  if (workflowAction === "approve") {
    return "approveDocument";
  }

  if (workflowAction === "reject") {
    return type === "purchase" ? "rejectPurchase" : "rejectSale";
  }

  if (workflowAction === "confirm") {
    return type === "purchase" ? "confirmPurchase" : "confirmSale";
  }

  return "requestVoid";
}

function returnPermissionAction(type) {
  return type === "purchase" ? "createPurchaseReturn" : "createSalesReturn";
}

function ownerReassignPermissionAction(type) {
  return type === "purchase" ? "reassignPurchaseOwner" : "reassignSaleOwner";
}

function canPerform(action, context) {
  return accessControl.canPerform(action, context);
}

function targetDocumentById(type, id) {
  const rows = type === "purchase"
    ? store.listPurchases({ includeVoided: true })
    : store.listSales({ includeVoided: true });
  return rows.find((item) => item.id === Number(id)) || null;
}

function targetDocumentContext(item) {
  return { targetDocument: item || null };
}

function isWithinPermissionScope(action, context) {
  return accessControl.isWithinPermissionScope(action, context);
}

function hasSupervisorScope(action, context, target) {
  return accessControl.hasSupervisorScope(action, context, target);
}

function canViewModule(moduleName, context) {
  return accessControl.canViewModule(moduleName, context);
}

function canViewField(fieldName, context) {
  return accessControl.canViewField(fieldName, context);
}

function permissionReason(action) {
  return accessControl.permissionReason(action);
}

function modulePermissionReason(moduleName) {
  return accessControl.modulePermissionReason(moduleName);
}

function actionLabel(action) {
  return accessControl.actionLabel(action);
}
function moduleLabel(moduleName) {
  const tab = document.querySelector(`[data-tab="${moduleName}"]`);
  return tab ? tab.textContent.trim() : moduleName;
}

function normalizeRole(role) {
  return StockFlowAccess.normalizeRole(role);
}

function currentRoleLabel() {
  return accessControl.currentRoleLabel();
}

function loadCurrentUser() {
  try {
    const employeeId = Number(localStorage.getItem(currentEmployeeStorageKey));
    return currentUserFromEmployee(employeeId) || {
      id: "local-user",
      employeeId: 0,
      departmentId: 0,
      name: "本機使用者",
      role: normalizeRole(localStorage.getItem(accessRoleStorageKey))
    };
  } catch (error) {
    return {
      id: "local-user",
      employeeId: 0,
      departmentId: 0,
      name: "本機使用者",
      role: "owner"
    };
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
  if (!employee) {
    return null;
  }

  return {
    id: `employee-${employee.id}`,
    employeeId: employee.id,
    departmentId: employee.departmentId,
    name: employee.name,
    role: normalizeRole(employee.role)
  };
}

function validationMessageFor(field) {
  const validity = field.validity;
  const label = fieldLabel(field);

  if (validity.valueMissing) {
    const key = field.tagName === "SELECT" ? "validation.selectMissing" : "validation.valueMissing";
    return interpolate(t(key, field.tagName === "SELECT" ? "請選擇「{label}」。" : "請填寫「{label}」。"), { label });
  }

  if (validity.rangeUnderflow) {
    return interpolate(t("validation.rangeUnderflow", "「{label}」不可小於 {min}。"), { label, min: field.min });
  }

  if (validity.rangeOverflow) {
    return interpolate(t("validation.rangeOverflow", "「{label}」不可大於 {max}。"), { label, max: field.max });
  }

  if (validity.stepMismatch) {
    return interpolate(t("validation.stepMismatch", "「{label}」的格式不符合欄位設定。"), { label });
  }

  if (validity.badInput) {
    return interpolate(t("validation.badInput", "請輸入有效的「{label}」。"), { label });
  }

  if (validity.patternMismatch) {
    return interpolate(t("validation.patternMismatch", "「{label}」格式不正確。"), { label });
  }

  return "";
}

function fieldLabel(field) {
  const label = field.closest("label");
  const span = label ? label.querySelector("span") : null;
  return span ? span.textContent.trim() : field.name || field.id || "欄位";
}

function render() {
  ensureActiveTabAllowed();
  applyTextBaseline();
  renderAccessControl();
  renderTabs();
  renderMetrics();
  renderProductOptions();
  renderWarehouseOptions();
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
  renderSales();
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
  if (canViewModule(activeTab)) {
    return;
  }

  const firstAllowed = Array.from(tabs).find((tab) => canViewModule(tab.dataset.tab));
  activeTab = firstAllowed ? firstAllowed.dataset.tab : "overview";
}

function renderAccessControl() {
  if (!roleSelect || !employeeSelect) {
    return;
  }

  const employees = store.listEmployees({ activeOnly: true });
  if (!employees.some((employee) => employee.id === currentUser.employeeId) && employees.length) {
    currentUser = currentUserFromEmployee(employees[0].id);
    saveCurrentUser();
  }

  const employeeLabel = employeeSelect.closest("label") && employeeSelect.closest("label").querySelector("span");
  if (employeeLabel) {
    employeeLabel.textContent = "本機人員";
  }
  employeeSelect.innerHTML = employees.length
    ? employees.map((employee) => {
      const department = store.listDepartments().find((item) => item.id === employee.departmentId);
      return `<option value="${employee.id}">${escapeHtml(employee.name)} / ${escapeHtml(department ? department.name : "未指定部門")} / ${escapeHtml(roleLabel(employee.role))}</option>`;
    }).join("")
    : `<option value="">本機使用者</option>`;
  employeeSelect.value = employees.some((employee) => employee.id === currentUser.employeeId) ? String(currentUser.employeeId) : "";

  const roleLabelElement = roleSelect.closest("label") && roleSelect.closest("label").querySelector("span");
  if (roleLabelElement) {
    roleLabelElement.textContent = t("access.localRole", "本機角色");
  }
  Array.from(roleSelect.options).forEach((option) => {
    option.textContent = roleLabel(option.value);
  });
  roleSelect.value = currentUser.role;
  roleSelect.disabled = Boolean(currentUser.employeeId);
  roleSelect.title = interpolate(t("access.currentRole", "目前本機角色：{role}"), { role: currentRoleLabel() });
}

function currentLanguage() {
  const preferences = store && store.getPreferences ? store.getPreferences() : {};
  return preferences.interfaceLanguage || "zh-Hant";
}

function t(path, fallback) {
  return window.StockFlowI18n
    ? window.StockFlowI18n.text(currentLanguage(), path, fallback)
    : fallback || "";
}

function applyTextBaseline() {
  document.documentElement.lang = currentLanguage();
  document.title = t("app.title", "StockFlow 進銷存系統");

  const headingText = t("app.heading", "進銷存系統");
  const heading = document.querySelector(".app-header h1");
  const versionBadge = document.querySelector("#app-version");
  if (heading && versionBadge) {
    heading.firstChild.textContent = `${headingText} `;
  }

  const navigationLabels = {
    overview: t("navigation.overview", "總覽"),
    masterdata: t("navigation.masterdata", "1 基本資料"),
    products: t("navigation.products", "2 商品管理"),
    purchases: t("navigation.purchases", "3 採購進貨"),
    sales: t("navigation.sales", "4 銷售出貨"),
    adjustments: t("navigation.adjustments", "5 盤點調整"),
    reports: t("navigation.reports", "6 庫存報表"),
    transfers: t("navigation.transfers", "E1 調撥"),
    finance: t("navigation.finance", "E2 財務"),
    learning: t("navigation.learning", "同步教學")
  };

  Object.entries(navigationLabels).forEach(([tabName, label]) => {
    const tab = document.querySelector(`[data-tab="${tabName}"]`);
    if (tab) {
      tab.textContent = label;
      tab.title = label;
    }
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
  if (!element) {
    return;
  }

  if (text !== null && text !== undefined) {
    element.textContent = text;
  }
  element.title = title || "";
}

function confirmAction(key, values) {
  const message = interpolate(t(`confirmations.${key}`, ""), values || {});
  return !message || window.confirm(message);
}

function interpolate(template, values) {
  return String(template || "").replace(/\{(\w+)\}/g, (match, key) => {
    return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match;
  });
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
    ['#warehouse-summary-cards', "headings.warehouseStockSummary", "倉庫庫存摘要"],
    ['#warehouse-transfer-cards', "headings.warehouseTransferSummary", "倉庫調撥摘要"],
    ['#warehouse-distribution-list', "headings.productWarehouseDistribution", "商品跨倉分布"],
    ['#report-sales-list', "headings.salesDetail", "銷售明細"],
    ['#report-purchase-list', "headings.purchaseDetail", "進貨明細"],
    ['#report-profit-ranking', "headings.grossProfitRankingReport", "毛利排行報表"],
    ['#movement-query', "headings.stockMovementDetail", "庫存異動明細"],
    ['#stock-query', "headings.stockReport", "庫存報表"],
    ['[data-view="learning"] .learning-sidebar h2', "headings.learning", "同步教學"],
    ['[data-view="learning"] .learning-reference h2', "headings.learningChecklist", "人肉驗證清單"],
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
  if (!head) {
    return;
  }
  const title = head.querySelector("h2");
  if (title) {
    title.textContent = heading;
  }
  const meta = head.querySelector("span");
  if (meta && subtitle !== null) {
    meta.textContent = subtitle;
  }
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
    if (label) {
      label.textContent = t(path, fallback);
    }
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
    if (!table) {
      return;
    }
    table.querySelectorAll("thead th").forEach((cell, index) => {
      const key = keys[index];
      if (key) {
        cell.textContent = t(`tables.${key}`, cell.textContent);
      }
    });
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
    ["#product-form", "sku", "fields.sku", "SKU"],
    ["#product-form", "name", "fields.productName", "商品名稱"],
    ["#product-form", "category", "fields.category", "分類"],
    ["#product-form", "unit", "fields.unit", "單位"],
    ["#product-form", "cost", "fields.cost", "成本"],
    ["#product-form", "price", "fields.price", "售價"],
    ["#product-form", "safetyStock", "fields.safetyStock", "安全庫存"],
    ["#category-form", "code", "fields.categoryCode", "分類代碼"],
    ["#category-form", "name", "fields.categoryName", "分類名稱"],
    ["#category-form", "sortOrder", "fields.sortOrder", "排序"],
    ["#warehouse-form", "code", "fields.warehouseCode", "倉庫代碼"],
    ["#warehouse-form", "name", "fields.warehouseName", "倉庫名稱"],
    ["#warehouse-form", "type", "fields.type", "類型"],
    ["#partner-form", "role", "fields.type", "類型"],
    ["#partner-form", "name", "fields.name", "名稱"],
    ["#partner-form", "contact", "fields.contact", "聯絡人"],
    ["#partner-form", "phone", "fields.phone", "電話"],
    ["#purchase-form", "warehouseId", "fields.purchaseWarehouse", "進貨倉庫"],
    ["#purchase-form", "productId", "fields.firstProduct", "第 1 筆商品"],
    ["#purchase-form", "quantity", "fields.quantity", "數量"],
    ["#purchase-form", "unitCost", "fields.unitCost", "進貨單價"],
    ["#purchase-form", "productId2", "fields.secondProductOptional", "第 2 筆商品（選填）"],
    ["#purchase-form", "quantity2", "fields.secondQuantity", "第 2 筆數量"],
    ["#purchase-form", "unitCost2", "fields.secondUnitPrice", "第 2 筆單價"],
    ["#purchase-form", "supplier", "common.supplier", "供應商"],
    ["#purchase-form", "createPayable", "fields.createPayable", "建立應付帳款"],
    ["#purchase-form", "dueDate", "fields.payableDueDate", "付款到期日"],
    ["#sale-form", "warehouseId", "fields.shippingWarehouse", "出貨倉庫"],
    ["#sale-form", "productId", "fields.firstProduct", "第 1 筆商品"],
    ["#sale-form", "quantity", "fields.quantity", "數量"],
    ["#sale-form", "unitPrice", "fields.unitPrice", "銷售單價"],
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
    if (input) {
      input.placeholder = t(path, fallback);
    }
  });
}

function setText(selector, text) {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = text;
  }
}

function setOptionText(selector, value, text) {
  const option = value === null
    ? document.querySelector(selector)
    : document.querySelector(`${selector} option[value="${value}"]`);
  if (option) {
    option.textContent = text;
  }
}

function setFieldLabel(formSelector, name, text) {
  const field = document.querySelector(`${formSelector} [name="${name}"]`);
  if (field) {
    setInputLabel(field, text);
  }
}

function setInputLabel(input, text) {
  const label = input.closest("label");
  const span = label ? label.querySelector("span") : null;
  if (span) {
    span.textContent = text;
  }
  input.title = text;
}

function renderActionAvailability() {
  const hasProducts = store.listProducts({ activeOnly: true }).length > 0;
  const hasWarehouses = store.listWarehouses({ activeOnly: true }).length > 0;
  const hasReceivables = store.listReceivables({ status: "" }).some(isOpenFinanceTarget);
  const hasPayables = store.listPayables({ status: "" }).some(isOpenFinanceTarget);
  const staleReason = dataStale ? t("operationGuards.staleData", "資料已在其他視窗更新。為避免庫存或金額不一致，請先重新整理畫面後再操作。") : "";

  const productWarehouseReason = !hasProducts && !hasWarehouses
    ? t("operationGuards.noProductOrWarehouse", "請先建立並啟用商品與倉庫。")
    : !hasProducts
      ? t("operationGuards.noProduct", "請先建立並啟用商品。")
      : !hasWarehouses
        ? t("operationGuards.noWarehouse", "請先建立並啟用倉庫。")
        : "";

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
  if (!button) {
    return;
  }

  button.disabled = Boolean(disabled);
  button.classList.toggle("is-disabled", Boolean(disabled));
  if (reason) {
    button.title = reason;
    button.setAttribute("aria-disabled", String(Boolean(disabled)));
  } else {
    button.removeAttribute("aria-disabled");
  }
}

function renderTabs() {
  tabs.forEach((tab) => {
    const allowed = canViewModule(tab.dataset.tab);
    tab.classList.toggle("is-active", tab.dataset.tab === activeTab);
    tab.classList.toggle("is-disabled", !allowed);
    tab.disabled = !allowed;
    tab.title = allowed ? "" : modulePermissionReason(tab.dataset.tab);
  });

  views.forEach((view) => {
    view.classList.toggle("is-active", view.dataset.view === activeTab);
  });
}

function renderMetrics() {
  const dashboard = store.dashboard();
  document.querySelector("#metric-products").textContent = formatCount(dashboard.activeProducts);
  document.querySelector("#metric-stock-value").textContent = canViewField("viewStockValue") ? formatMoney(dashboard.stockValue) : restrictedText();
  document.querySelector("#metric-revenue").textContent = canViewField("viewSalesRevenue") ? formatMoney(dashboard.revenue) : restrictedText();
  document.querySelector("#metric-low-stock").textContent = formatCount(dashboard.lowStockCount);
}

function renderLearning() {
  const query = normalizeLearningQuery(learningQuery.value);
  const visibleTopics = learningTopics.filter((topic) => {
    if (!query) {
      return true;
    }

    const searchable = [
      topic.title,
      topic.summary,
      topic.sections.map((section) => [
        section.heading,
        section.body,
        (section.items || []).join(" ")
      ].join(" ")).join(" ")
    ].join(" ");
    return normalizeLearningQuery(searchable).includes(query);
  });

  if (!visibleTopics.some((topic) => topic.id === activeLearningTopicId)) {
    activeLearningTopicId = (visibleTopics[0] || learningTopics[0]).id;
  }

  const activeTopic = learningTopics.find((topic) => topic.id === activeLearningTopicId) || learningTopics[0];
  learningTopicList.innerHTML = visibleTopics.length
    ? visibleTopics.map((topic) => `
      <button class="learning-topic-button ${topic.id === activeTopic.id ? "is-active" : ""}" type="button" data-learning-topic="${escapeAttr(topic.id)}">
        ${escapeHtml(topic.title)}
      </button>
    `).join("")
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
  const className = section.type === "danger"
    ? "learning-section learning-warning learning-danger"
    : section.type === "warning"
      ? "learning-section learning-warning"
      : "learning-section";
  const body = section.body ? `<p>${escapeHtml(section.body)}</p>` : "";
  const items = section.items && section.items.length
    ? `<ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
    : "";

  return `
    <section class="${className}">
      <h3>${escapeHtml(section.heading)}</h3>
      ${body}
      ${items}
    </section>
  `;
}

function moveLearningTopic(direction) {
  const currentIndex = learningTopics.findIndex((topic) => topic.id === activeLearningTopicId);
  const nextIndex = Math.min(Math.max(currentIndex + direction, 0), learningTopics.length - 1);
  activeLearningTopicId = learningTopics[nextIndex].id;
  renderLearning();
}

function normalizeLearningQuery(value) {
  return String(value || "").trim().toLowerCase();
}

function renderOverview() {
  const lowStock = store.inventoryReport({ lowStockOnly: true });
  document.querySelector("#overview-low-count").textContent = `${formatCount(lowStock.length)} ${t("common.itemUnit", "項")}`;
  document.querySelector("#low-stock-list").innerHTML = lowStock.length
    ? lowStock.map((item) => `
      <article class="compact-card">
        <strong>${escapeHtml(item.product.name)}</strong>
        <span class="compact-meta">${escapeHtml(item.product.sku)} / ${t("common.stock", "庫存")} ${formatQuantity(item.onHand)} ${escapeHtml(item.product.unit)} / ${t("fields.safetyStock", "安全庫存")} ${formatQuantity(item.product.safetyStock)}</span>
      </article>
    `).join("")
    : `<div class="empty">${t("emptyStates.noLowStock", "目前沒有低庫存商品。")}</div>`;

  const activities = store.listPurchases().slice(0, 3).map((item) => Object.assign({ kind: t("common.purchase", "進貨") }, item))
    .concat(store.listSales().slice(0, 3).map((item) => Object.assign({ kind: t("common.sale", "銷售") }, item)))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
    .slice(0, 6);

  document.querySelector("#recent-activity").innerHTML = activities.length
    ? activities.map((item) => {
      const product = productName(item.productId);
      const amount = item.kind === "進貨" ? item.quantity * item.unitCost : item.quantity * item.unitPrice;
      const fieldName = item.kind === "進貨" ? "viewCost" : "viewSalesRevenue";
      return `
        <article class="compact-card">
          <strong>${item.kind} / ${escapeHtml(product)}</strong>
          <span class="compact-meta">${formatDate(item.date)} / ${formatQuantity(item.quantity)} / ${formatRestrictedMoney(amount, fieldName)}</span>
        </article>
      `;
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

function renderProducts() {
  const products = store.listProducts({
    query: productQuery.value,
    category: productCategoryFilter.value
  });
  const body = document.querySelector("#product-table");

  body.innerHTML = products.length
    ? products.map((product) => `
      <tr>
        <td>${escapeHtml(product.sku)}</td>
        <td>
          <div class="row-title">
            <strong>${escapeHtml(product.name)}</strong>
            <span>${escapeHtml(product.unit)}</span>
          </div>
        </td>
        <td>${escapeHtml(product.category)}</td>
        <td>${formatRestrictedMoney(product.cost, "viewCost")}</td>
        <td>${formatRestrictedMoney(product.price, "viewPrice")}</td>
        <td>${statusBadge(product.active)}</td>
        <td>
          <div class="table-actions">
            <button class="text-button" type="button" title="${escapeAttr(t("tooltips.editProduct", "編輯這項商品資料。"))}" data-edit-product-id="${product.id}">${t("actions.edit", "編輯")}</button>
            ${product.active ? `<button class="text-button action-danger" type="button" title="${escapeAttr(t("tooltips.deactivateProduct", "停用商品；歷史紀錄保留，但新增單據不能再選用。"))}" data-deactivate-id="${product.id}">${t("actions.deactivate", "停用")}</button>` : ""}
          </div>
        </td>
      </tr>
    `).join("")
    : `<tr><td colspan="7" class="empty">${t("emptyStates.noProducts", "沒有符合條件的商品。")}</td></tr>`;
}

function startProductEdit(productId) {
  const product = store.listProducts().find((item) => item.id === productId);

  if (!product) {
    setStatus("找不到要編輯的商品。", true);
    return;
  }

  editingProductId = product.id;
  productForm.elements.id.value = product.id;
  productForm.elements.sku.value = product.sku;
  productForm.elements.name.value = product.name;
  productForm.elements.category.value = product.category;
  productForm.elements.unit.value = product.unit;
  productForm.elements.cost.value = product.cost;
  productForm.elements.price.value = product.price;
  productForm.elements.safetyStock.value = product.safetyStock;
  productFormTitle.textContent = t("actions.edit", "編輯") + t("tables.product", "商品");
  productSubmitButton.textContent = t("actions.updateProduct", "更新商品");
  cancelProductEdit.classList.remove("is-hidden");
  setStatus(`正在編輯商品：${product.name}`);
}

function resetProductForm() {
  editingProductId = null;
  productForm.reset();
  productForm.elements.id.value = "";
  productForm.elements.category.value = store.categories()[0] || "一般";
  productForm.elements.unit.value = "件";
  productForm.elements.safetyStock.value = "5";
  productFormTitle.textContent = t("actions.addProduct", "新增商品");
  productSubmitButton.textContent = t("actions.addProduct", "新增商品");
  cancelProductEdit.classList.add("is-hidden");
}

function renderProductCategories() {
  masterDataUi.renderProductCategories();
}

function renderWarehouses() {
  masterDataUi.renderWarehouses();
}

function renderDepartments() {
  masterDataUi.renderDepartments();
}

function renderEmployees() {
  masterDataUi.renderEmployees();
}

function renderPartners() {
  masterDataUi.renderPartners();
}

function startPartnerEdit(partnerId) {
  const partner = store.listPartners().find((item) => item.id === partnerId);

  if (!partner) {
    setStatus("找不到要編輯的往來對象。", true);
    return;
  }

  editingPartnerId = partner.id;
  partnerForm.elements.id.value = partner.id;
  partnerForm.elements.role.value = partner.role;
  partnerForm.elements.name.value = partner.name;
  partnerForm.elements.contact.value = partner.contact;
  partnerForm.elements.phone.value = partner.phone;
  partnerForm.elements.note.value = partner.note;
  partnerFormTitle.textContent = `${t("actions.edit", "編輯")}${t("headings.addPartner", "新增往來對象").replace(t("actions.addProduct", "新增").slice(0, 2), "")}`;
  partnerSubmitButton.textContent = t("actions.updatePartner", "更新對象");
  cancelPartnerEdit.classList.remove("is-hidden");
  setStatus(`正在編輯往來對象：${partner.name}`);
}

function resetPartnerForm() {
  editingPartnerId = null;
  partnerForm.reset();
  partnerForm.elements.id.value = "";
  partnerForm.elements.role.value = "supplier";
  partnerFormTitle.textContent = t("actions.addPartner", "新增往來對象");
  partnerSubmitButton.textContent = t("actions.addPartner", "新增往來對象");
  cancelPartnerEdit.classList.add("is-hidden");
}

function renderPurchases() {
  const purchases = store.listPurchases({
    query: purchaseQuery.value,
    month: purchaseMonth.value,
    includeVoided: purchaseIncludeVoided.checked
  });
  document.querySelector("#purchase-count").textContent = `${formatCount(purchases.length)} ${t("common.countUnit", "筆")}`;
  document.querySelector("#purchase-list").innerHTML = purchases.length
    ? purchases.map((item) => `
      <article class="record-card">
        <div>
          <strong>${escapeHtml(productName(item.productId))} ${documentStatusBadge(item)}</strong>
          <div class="record-meta">${escapeHtml(item.documentNo || t("common.noDocumentNo", "無單號"))} / ${formatDate(item.date)} / ${escapeHtml(warehouseName(item.warehouseId))} / ${escapeHtml(item.supplier || t("common.notFilled", "未填") + t("common.supplier", "供應商"))} / ${escapeHtml(documentResponsibilityText(item))} / ${escapeHtml(item.note || t("common.noNote", "無備註"))}${returnMeta(item, "purchaseReturn")}${voidMeta(item)}</div>
          ${voidDetailPanel(item, "purchase")}
        </div>
        <div class="record-side">
          <span class="amount income">+${formatQuantity(item.quantity)} / ${formatRestrictedMoney(item.quantity * item.unitCost, "viewCost")}</span>
          ${returnDocumentButton(item, "purchase")}
          ${voidReversalButton(item, "purchase")}
          ${reassignDocumentOwnerButton(item, "purchase")}
          ${documentWorkflowButtons(item, "purchase")}
          ${voidDocumentButton(item, "purchase")}
        </div>
      </article>
    `).join("")
    : `<div class="empty">${t("emptyStates.noPurchases", "尚無進貨紀錄。")}</div>`;
}

function renderSales() {
  const sales = store.listSales({
    query: saleQuery.value,
    month: saleMonth.value,
    includeVoided: saleIncludeVoided.checked
  });
  document.querySelector("#sale-count").textContent = `${formatCount(sales.length)} ${t("common.countUnit", "筆")}`;
  document.querySelector("#sale-list").innerHTML = sales.length
    ? sales.map((item) => `
      <article class="record-card">
        <div>
          <strong>${escapeHtml(productName(item.productId))} ${documentStatusBadge(item)}</strong>
          <div class="record-meta">${escapeHtml(item.documentNo || t("common.noDocumentNo", "無單號"))} / ${formatDate(item.date)} / ${escapeHtml(warehouseName(item.warehouseId))} / ${escapeHtml(item.customer || t("common.notFilled", "未填") + t("common.customer", "客戶"))} / ${escapeHtml(documentResponsibilityText(item))} / ${escapeHtml(item.note || t("common.noNote", "無備註"))}${returnMeta(item, "salesReturn")}${voidMeta(item)}</div>
          ${voidDetailPanel(item, "sale")}
        </div>
        <div class="record-side">
          <span class="amount expense">-${formatQuantity(item.quantity)} / ${formatRestrictedMoney(item.quantity * item.unitPrice, "viewSalesRevenue")}</span>
          ${returnDocumentButton(item, "sale")}
          ${voidReversalButton(item, "sale")}
          ${reassignDocumentOwnerButton(item, "sale")}
          ${documentWorkflowButtons(item, "sale")}
          ${voidDocumentButton(item, "sale")}
        </div>
      </article>
    `).join("")
    : `<div class="empty">${t("emptyStates.noSales", "尚無銷售紀錄。")}</div>`;
}

function renderAdjustments() {
  const adjustments = store.listAdjustments({
    query: adjustmentQuery.value,
    month: adjustmentMonth.value
  });
  document.querySelector("#adjustment-count").textContent = `${formatCount(adjustments.length)} ${t("common.countUnit", "筆")}`;
  document.querySelector("#adjustment-list").innerHTML = adjustments.length
    ? adjustments.map((item) => `
      <article class="record-card">
        <div>
          <strong>${escapeHtml(productName(item.productId))}</strong>
          <div class="record-meta">${escapeHtml(item.documentNo || t("common.noDocumentNo", "無單號"))} / ${formatDate(item.date)} / ${escapeHtml(warehouseName(item.warehouseId))} / ${escapeHtml(item.reason || t("common.adjustment", "調整"))} / ${escapeHtml(item.note || t("common.noNote", "無備註"))}</div>
        </div>
        <div class="record-side">
          <span class="amount ${item.quantity >= 0 ? "income" : "expense"}">${item.quantity >= 0 ? "+" : ""}${formatQuantity(item.quantity)}</span>
        </div>
      </article>
    `).join("")
    : `<div class="empty">${t("emptyStates.noAdjustments", "尚無盤點調整紀錄。")}</div>`;
}

function renderTransfers() {
  const transfers = store.listTransfers({
    query: transferQuery.value,
    month: transferMonth.value
  });
  document.querySelector("#transfer-count").textContent = `${formatCount(transfers.length)} ${t("common.countUnit", "筆")}`;
  document.querySelector("#transfer-list").innerHTML = transfers.length
    ? transfers.map((item) => `
      <article class="record-card">
        <div>
          <strong>${escapeHtml(productName(item.productId))}</strong>
          <div class="record-meta">${escapeHtml(item.documentNo || t("common.noDocumentNo", "無單號"))} / ${formatDate(item.date)} / ${escapeHtml(warehouseName(item.fromWarehouseId))} -> ${escapeHtml(warehouseName(item.toWarehouseId))} / ${escapeHtml(item.note || t("common.noNote", "無備註"))}</div>
        </div>
        <div class="record-side">
          <span class="amount">${formatQuantity(item.quantity)}</span>
        </div>
      </article>
    `).join("")
    : `<div class="empty">${t("emptyStates.noTransfers", "尚無調撥紀錄。")}</div>`;
}

function renderFinance() {
  const month = financeMonth.value;
  const query = financeQuery.value;
  const summary = store.financeSummary({ month });
  const receivables = store.listReceivables({ query, month });
  const payables = store.listPayables({ query, month });
  const payments = store.listPayments({ query, month });
  const canViewCompanyFinance = canViewField("viewCompanyFinanceSummary");

  document.querySelector("#finance-receivable-balance").textContent = canViewCompanyFinance ? formatMoney(summary.receivableBalance) : restrictedText();
  document.querySelector("#finance-receivable-paid").textContent = `${canViewCompanyFinance ? formatMoney(summary.receivablePaid) : restrictedText()} ${t("common.paymentIn", "收款")}`;
  document.querySelector("#finance-payable-balance").textContent = canViewCompanyFinance ? formatMoney(summary.payableBalance) : restrictedText();
  document.querySelector("#finance-payable-paid").textContent = `${canViewCompanyFinance ? formatMoney(summary.payablePaid) : restrictedText()} ${t("common.paymentOut", "付款")}`;
  document.querySelector("#finance-cash-in").textContent = canViewCompanyFinance ? formatMoney(summary.cashIn) : restrictedText();
  document.querySelector("#finance-cash-out").textContent = canViewCompanyFinance ? formatMoney(summary.cashOut) : restrictedText();

  document.querySelector("#receivable-list").innerHTML = receivables.length
    ? receivables.map((item) => financeTargetCard(item, "customer", "viewReceivables")).join("")
    : `<div class="empty">${t("emptyStates.noReceivables", "尚無應收資料。")}</div>`;
  document.querySelector("#payable-list").innerHTML = payables.length
    ? payables.map((item) => financeTargetCard(item, "supplier", "viewPayables")).join("")
    : `<div class="empty">${t("emptyStates.noPayables", "尚無應付資料。")}</div>`;

  document.querySelector("#payment-count").textContent = `${formatCount(payments.length)} ${t("common.countUnit", "筆")}`;
  document.querySelector("#payment-list").innerHTML = payments.length
    ? payments.map((item) => `
      <article class="record-card">
        <div>
          <strong>${item.direction === "in" ? t("common.paymentIn", "收款") : t("common.paymentOut", "付款")} / ${escapeHtml(item.method || t("common.notFilled", "未填") + t("fields.method", "方式"))}</strong>
          <div class="record-meta">${formatDate(item.date)} / ${escapeHtml(item.targetType)} #${item.targetId} / ${escapeHtml(item.note || t("common.noNote", "無備註"))}</div>
        </div>
          <span class="amount ${item.direction === "in" ? "income" : "expense"}">${canViewCompanyFinance ? formatMoney(item.amount) : restrictedText()}</span>
      </article>
    `).join("")
    : `<div class="empty">${t("emptyStates.noPayments", "尚無收付款紀錄。")}</div>`;

  renderPaymentTargets();
}

function financeTargetCard(item, partyField, fieldName) {
  const balance = item.amount - item.paidAmount;
  return `
    <article class="record-card">
      <div>
        <strong>${escapeHtml(item[partyField] || t("common.notFilled", "未填") + t("tables.party", "對象"))}</strong>
        <div class="record-meta">${escapeHtml(item.sourceDocumentNo || t("common.noDocumentNo", "無單號"))} / ${t("fields.date", "日期")} ${formatDate(item.dueDate)} / ${financeStatusLabel(item.status)}</div>
      </div>
      <span class="amount">${formatRestrictedMoney(balance, fieldName)}</span>
    </article>
  `;
}

function financeStatusLabel(status) {
  if (status === "paid") {
    return t("common.paid", "已結清");
  }

  if (status === "partial") {
    return t("common.partial", "部分沖帳");
  }

  if (status === "voided") {
    return t("documentStatus.voided", "已作廢");
  }

  return t("common.open", "未結");
}

function restrictedText() {
  return "未開放";
}

function formatRestrictedMoney(value, fieldName) {
  return canViewField(fieldName) ? formatMoney(value) : restrictedText();
}

function renderPaymentTargets() {
  const direction = paymentDirection.value;
  const rows = direction === "out"
    ? store.listPayables({ status: "" }).filter(isOpenFinanceTarget)
    : store.listReceivables({ status: "" }).filter(isOpenFinanceTarget);
  const current = paymentTarget.value;
  paymentTarget.innerHTML = rows.length
    ? rows.map((item) => {
      const party = direction === "out" ? item.supplier : item.customer;
      const balance = item.amount - item.paidAmount;
      return `<option value="${item.id}">${escapeHtml(item.sourceDocumentNo || t("common.noDocumentNo", "無單號"))} / ${escapeHtml(party || t("common.notFilled", "未填") + t("tables.party", "對象"))} / ${formatMoney(balance)}</option>`;
    }).join("")
    : `<option value="">${t("emptyStates.noPaymentTargets", "沒有可沖帳項目")}</option>`;
  if (rows.some((item) => String(item.id) === current)) {
    paymentTarget.value = current;
  }
}

function isOpenFinanceTarget(item) {
  return item && item.status !== "paid" && item.status !== "voided";
}

function renderPreferences() {
  const preferences = store.getPreferences();
  preferencesForm.elements.interfaceLanguage.value = preferences.interfaceLanguage;
  preferencesForm.elements.locale.value = preferences.locale;
  preferencesForm.elements.quantityDecimals.value = preferences.quantityDecimals;
  preferencesForm.elements.moneyDecimals.value = preferences.moneyDecimals;
  preferencesForm.elements.thousandsSeparator.value = preferences.thousandsSeparator;
  preferencesForm.elements.decimalSeparator.value = preferences.decimalSeparator;
  preferencesForm.elements.dateFormat.value = preferences.dateFormat;
  preferencesForm.elements.currencyCode.value = preferences.currencyCode;
  preferencesForm.elements.currencySymbol.value = preferences.currencySymbol;
  preferencesForm.elements.currencyPosition.value = preferences.currencyPosition;
  preferencesForm.elements.reportTitle.value = preferences.reportTitle;
  preferencesForm.elements.reportHeaderText.value = preferences.reportHeaderText;
  preferencesForm.elements.reportFooterText.value = preferences.reportFooterText;
  preferencesForm.elements.showPrintDate.checked = preferences.showPrintDate;
}

function renderReports() {
  StockFlowRenderers.renderReports({
    document,
    store,
    month: reportMonth.value,
    movementQuery: movementQuery.value,
    formatMoney,
    formatNumber,
    formatQuantity,
    formatCount,
    formatDate,
    formatPercent,
    escapeHtml,
    t,
    productName,
    warehouseName,
    movementBadge,
    canViewField,
    restrictedText
  });
}

function renderAuditLogs() {
  const logs = store.listAuditLogs ? store.listAuditLogs(currentAuditOptions()) : [];
  document.querySelector("#audit-count").textContent = `${formatCount(logs.length)} ${t("common.countUnit", "筆")}`;
  document.querySelector("#audit-table").innerHTML = logs.length
    ? logs.slice(0, 120).map((event) => `
      <tr>
        <td>${formatDate(event.occurredAt.slice(0, 10))}</td>
        <td>
          <div class="row-title">
            <strong>${escapeHtml(event.actorName || t("common.localUser", "本機使用者"))}</strong>
            <span>${escapeHtml(roleLabel(event.roleAtOperation))}</span>
          </div>
        </td>
        <td>${auditActionBadge(event.action)}</td>
        <td>
          <div class="row-title">
            <strong>${escapeHtml(event.documentNo || event.entityId || "-")}</strong>
            <span>${escapeHtml(event.entityType || "-")}</span>
          </div>
        </td>
        <td>${escapeHtml(event.summary || t("common.noNote", "無備註"))}</td>
        <td>${auditResultBadge(event.result)}</td>
        <td>${auditRiskBadge(event.riskLevel)}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="7" class="empty">尚無符合條件的稽核紀錄。</td></tr>`;
}

function currentAuditOptions() {
  return auditControl.currentAuditOptions();
}

function recordSensitiveRead(entityType, summary, after) {
  return auditControl.recordSensitiveRead(entityType, summary, after);
}

function recordAudit(action, payload, persistNow) {
  if (!store || !store.recordAuditEvent) {
    return null;
  }

  const event = store.recordAuditEvent(Object.assign({}, payload, {
    action,
    actorId: currentUser.id,
    actorName: currentUser.name,
    actorEmployeeId: currentUser.employeeId || 0,
    actorDepartmentId: currentUser.departmentId || 0,
    roleAtOperation: currentUser.role
  }));
  if (event && persistNow && !dataStale) {
    saveState();
  }
  return event;
}

function formatAuditCsvRows(logs) {
  return auditControl.formatAuditCsvRows(logs);
}

function auditActionBadge(action) {
  return auditControl.auditActionBadge(action);
}

function auditResultBadge(result) {
  return auditControl.auditResultBadge(result);
}

function auditRiskBadge(riskLevel) {
  return auditControl.auditRiskBadge(riskLevel);
}

function auditActionLabel(action) {
  return auditControl.auditActionLabel(action);
}

function auditResultLabel(result) {
  return auditControl.auditResultLabel(result);
}

function auditRiskLabel(riskLevel) {
  return auditControl.auditRiskLabel(riskLevel);
}

function roleLabel(role) {
  return accessControl.roleLabel(role);
}

function departmentTypeLabel(type) {
  const labels = {
    sales: "銷售",
    purchasing: "採購",
    warehouse: "倉儲",
    finance: "財務",
    admin: "管理",
    audit: "稽核"
  };
  return labels[type] || type || "-";
}

function renderStockFilters() {
  renderCategorySelect(categoryFilter, "全部分類");
  renderWarehouseFilter(warehouseFilter, "全部倉庫");
}

function renderProductFilters() {
  renderCategorySelect(productCategoryFilter, "全部分類");
}

function renderProductCategoryOptions() {
  masterDataUi.renderProductCategoryOptions();
}

function renderCategorySelect(select, emptyLabel) {
  const current = select.value;
  const categories = store.categories();
  const options = [`<option value="">${escapeHtml(emptyLabel)}</option>`]
    .concat(categories.map((category) => `<option value="${escapeAttr(category)}">${escapeHtml(category)}</option>`));

  select.innerHTML = options.join("");
  select.value = categories.includes(current) ? current : "";
}

function renderWarehouseFilter(select, emptyLabel) {
  const current = select.value;
  const warehouses = store.listWarehouses({ activeOnly: true });
  const options = [`<option value="">${escapeHtml(emptyLabel)}</option>`]
    .concat(warehouses.map((warehouse) => `<option value="${warehouse.id}">${escapeHtml(warehouse.code)} / ${escapeHtml(warehouse.name)}</option>`));

  select.innerHTML = options.join("");
  select.value = warehouses.some((warehouse) => String(warehouse.id) === current) ? current : "";
}

function statusBadge(active) {
  return active
    ? `<span class="badge">${t("common.active", "啟用")}</span>`
    : `<span class="badge warn">${t("common.inactive", "停用")}</span>`;
}

function documentStatusBadge(item) {
  if (item && item.status === "voidRequested") {
    return `<span class="badge warn">${t("documentStatus.voidRequested", "作廢申請")}</span>`;
  }

  if (item && item.status === "reversed") {
    return `<span class="badge neutral">${t("documentStatus.reversed", "已沖銷")}</span>`;
  }

  if (isVoidedDocument(item)) {
    return `<span class="badge danger">${t("documentStatus.voided", "已作廢")}</span>`;
  }

  if (item && item.status === "amended") {
    return `<span class="badge warn">${t("documentStatus.amended", "已修改")}</span>`;
  }

  if (item && item.status === "rejected") {
    return `<span class="badge warn">${t("documentStatus.rejected", "已退回")}</span>`;
  }

  if (item && item.status === "approved") {
    return `<span class="badge">${t("documentStatus.approved", "已核准")}</span>`;
  }

  if (item && item.status === "submitted") {
    return `<span class="badge neutral">${t("documentStatus.submitted", "送審中")}</span>`;
  }

  if (item && item.status === "draft") {
    return `<span class="badge neutral">${t("documentStatus.draft", "草稿")}</span>`;
  }

  return `<span class="badge">${t("documentStatus.confirmed", "已確認")}</span>`;
}

function voidMeta(item) {
  if (!isVoidedDocument(item)) {
    return "";
  }

  const reason = item.voidReason || t("common.notFilled", "未填");
  const voidedAt = item.voidedAt ? formatDate(item.voidedAt.slice(0, 10)) : t("common.notFilled", "未填");
  const voidedBy = item.voidedBy || t("common.localUser", "本機使用者");
  return ` / ${t("documentStatus.voidReason", "作廢原因")}：${escapeHtml(reason)} / ${escapeHtml(voidedBy)} / ${escapeHtml(voidedAt)}`;
}

function voidDetailPanel(item, type) {
  if (!isVoidedDocument(item)) {
    return "";
  }

  const reversal = store.findVoidReversal ? store.findVoidReversal(type, item.id) : null;
  const notCreated = t("common.notCreated", "尚未建立");
  const sourceDocumentNo = item.sourceDocumentNo || item.documentNo || t("common.noDocumentNo", "無單號");
  const reversalDocumentNo = item.reversalDocumentNo || (reversal && reversal.documentNo) || notCreated;
  const relatedDocumentNos = [sourceDocumentNo]
    .concat(item.relatedDocumentNos || [])
    .concat(reversalDocumentNo === notCreated ? [] : [reversalDocumentNo])
    .filter(Boolean);
  const effectText = type === "purchase"
    ? "進貨庫存與應付帳款已從有效資料排除，沖銷事件建立後可追溯原單。"
    : "銷售出貨、應收帳款與毛利已從有效資料排除，沖銷事件建立後可追溯原單。";

  return `
    <div class="void-detail" data-void-ui-source-reversal-link>
      <span data-void-ui-reason-visible>原單 ${escapeHtml(sourceDocumentNo)} / 沖銷 ${escapeHtml(reversalDocumentNo)}</span>
      <span>原因 ${escapeHtml(item.voidReason || t("common.notFilled", "未填"))} / ${escapeHtml(item.voidedBy || t("common.localUser", "本機使用者"))} / ${escapeHtml(item.voidedAt ? formatDate(item.voidedAt.slice(0, 10)) : t("common.notFilled", "未填"))}</span>
      <span>關聯 ${escapeHtml(Array.from(new Set(relatedDocumentNos)).join(" / ") || t("common.notFilled", "未填"))}</span>
      <span>${escapeHtml(effectText)}</span>
    </div>
  `;
}

function isVoidedDocument(item) {
  return item && (item.status === "voided" || item.status === "reversed");
}

function returnMeta(item, documentType) {
  const quantity = returnedQuantity(item, documentType);
  if (!quantity) {
    return "";
  }

  return ` / ${t("documentStatus.returnedQuantity", "已退")}：${formatQuantity(quantity)}`;
}

function returnedQuantity(item, documentType) {
  return store.listReturns({ documentType })
    .filter((returnRow) => returnRow.sourceLineId === item.id)
    .reduce((sum, returnRow) => sum + returnRow.quantity, 0);
}

function documentResponsibilityText(item) {
  const unassigned = t("common.unassignedOwner", "未指派");
  const ownerName = employeeName(item && item.ownerEmployeeId) || unassigned;
  const department = departmentName(item && item.ownerDepartmentId) || unassigned;
  return `${t("common.responsibility", "負責")}：${ownerName} / ${department}`;
}

function employeeName(employeeId) {
  const employee = store.listEmployees().find((item) => item.id === Number(employeeId));
  return employee ? employee.name : "";
}

function departmentName(departmentId) {
  const department = store.listDepartments().find((item) => item.id === Number(departmentId));
  return department ? department.name : "";
}

function returnDocumentButton(item, type) {
  if (!item || !["confirmed", "amended", "voidRequested"].includes(item.status || "confirmed") || isVoidedDocument(item)) {
    return "";
  }

  const documentType = type === "purchase" ? "purchaseReturn" : "salesReturn";
  const remaining = item.quantity - returnedQuantity(item, documentType);
  const label = t("actions.createReturn", "退貨");
  if (remaining <= 0) {
    return `<button class="text-button" type="button" disabled title="${escapeAttr(t("tooltips.returnCompleted", "此單據已無可退數量。"))}">${label}</button>`;
  }

  const permissionAction = returnPermissionAction(type);
  if (!canPerform(permissionAction, targetDocumentContext(item))) {
    return `<button class="text-button" type="button" disabled title="${escapeAttr(permissionReason(permissionAction))}">${label}</button>`;
  }

  const dataAttribute = type === "purchase" ? "data-return-purchase-id" : "data-return-sale-id";
  const tooltip = type === "purchase"
    ? t("tooltips.purchaseReturn", "建立進貨退貨，會扣回庫存並調整應付。")
    : t("tooltips.salesReturn", "建立銷售退貨，會回補庫存並調整應收。");
  return `<button class="text-button" type="button" title="${escapeAttr(tooltip)}" ${dataAttribute}="${item.id}">${label}</button>`;
}

function documentWorkflowButtons(item, type) {
  if (!item || isVoidedDocument(item)) {
    return "";
  }

  const buttonsByStatus = {
    draft: [["submit"]],
    rejected: [["submit"]],
    submitted: [["approve", "approveDocument"], ["reject"]],
    approved: [["confirm"], ["reject"]],
    confirmed: [["requestVoid", "requestVoid"]],
    amended: [["requestVoid", "requestVoid"]]
  };
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
  if (!item || isVoidedDocument(item) || !["draft", "submitted", "approved"].includes(item.status || "confirmed")) {
    return "";
  }

  const label = t("actions.takeDocumentOwnership", "改由我負責");
  if (!currentUser.employeeId || !currentUser.departmentId) {
    return `<button class="text-button" type="button" disabled title="${escapeAttr(t("tooltips.employeeRequiredForOwnership", "請先選擇本機人員。"))}">${label}</button>`;
  }

  if (Number(item.ownerEmployeeId) === Number(currentUser.employeeId)) {
    return `<button class="text-button" type="button" disabled title="${escapeAttr(t("tooltips.alreadyDocumentOwner", "這張單據目前已由你負責。"))}">${label}</button>`;
  }

  const permissionAction = ownerReassignPermissionAction(type);
  if (!canPerform(permissionAction, targetDocumentContext(item))) {
    return `<button class="text-button" type="button" disabled title="${escapeAttr(permissionReason(permissionAction))}">${label}</button>`;
  }

  const dataAttribute = type === "purchase" ? "data-reassign-purchase-owner-id" : "data-reassign-sale-owner-id";
  return `<button class="text-button" type="button" ${dataAttribute}="${item.id}" title="${escapeAttr(t("tooltips.takeDocumentOwnership", "將這張未確認單據改由目前人員負責。"))}">${label}</button>`;
}

function approvalActionLabel(workflowAction) {
  const labels = {
    submit: t("actions.submitApproval", "送審"),
    approve: t("actions.approveDocument", "核准"),
    reject: t("actions.rejectDocument", "退回"),
    confirm: t("actions.confirmDocument", "確認"),
    requestVoid: t("actions.requestVoid", "申請作廢")
  };
  return labels[workflowAction] || workflowAction;
}

function approvalActionTitle(workflowAction) {
  const titles = {
    submit: t("tooltips.submitApproval", "送出審核，等待核准。"),
    approve: t("tooltips.approveDocument", "核准後仍需確認才會影響庫存與帳款。"),
    reject: t("tooltips.rejectDocument", "退回並保留原因與紀錄。"),
    confirm: t("tooltips.confirmDocument", "確認後才會正式影響庫存、財務與報表。"),
    requestVoid: t("tooltips.requestVoid", "提出作廢申請，等待管理者處理。")
  };
  return titles[workflowAction] || "";
}

function voidDocumentButton(item, type) {
  const label = t("actions.void", "作廢");

  if (isVoidedDocument(item)) {
    return `<button class="text-button action-danger" type="button" disabled title="${escapeAttr(t("tooltips.alreadyVoided", "此單據已作廢，原始紀錄保留供查詢。"))}">${label}</button>`;
  }

  if (!canPerform("voidDocument", targetDocumentContext(item))) {
    return `<button class="text-button action-danger" type="button" disabled title="${escapeAttr(permissionReason("voidDocument"))}">${label}</button>`;
  }

  const dataAttribute = type === "purchase" ? "data-remove-purchase-id" : "data-remove-sale-id";
  const tooltip = type === "purchase"
    ? t("tooltips.voidPurchase", "作廢這筆進貨紀錄，庫存會重新計算。")
    : t("tooltips.voidSale", "作廢這筆銷售紀錄，庫存會回補。");
  return `<button class="text-button action-danger" type="button" title="${escapeAttr(tooltip)}" ${dataAttribute}="${item.id}">${label}</button>`;
}

function voidReversalButton(item, type) {
  if (!isVoidedDocument(item)) {
    return "";
  }

  const label = "建立沖銷";
  if (item.reversalDocumentNo) {
    return `<button class="text-button" type="button" disabled title="${escapeAttr(`已建立沖銷事件：${item.reversalDocumentNo}`)}">${label}</button>`;
  }

  if (!canPerform("voidDocument", targetDocumentContext(item))) {
    return `<button class="text-button" type="button" disabled title="${escapeAttr(permissionReason("voidDocument"))}">${label}</button>`;
  }

  const dataAttribute = type === "purchase" ? "data-create-purchase-reversal-id" : "data-create-sale-reversal-id";
  return `<button class="text-button" type="button" data-void-ui-create-reversal-action ${dataAttribute}="${item.id}" title="建立反向事件並連結原單">${label}</button>`;
}

function renderStock() {
  const rows = store.inventoryReport(currentStockOptions());
  const body = document.querySelector("#stock-table");

  body.innerHTML = rows.length
    ? rows.map((item) => `
      <tr>
        <td>${escapeHtml(item.product.sku)}</td>
        <td>
          <div class="row-title">
            <strong>${escapeHtml(item.product.name)}</strong>
            <span>${escapeHtml(item.product.unit)} / ${escapeHtml(item.warehouse ? item.warehouse.name : t("common.unassignedWarehouse", "未指定倉庫"))}</span>
          </div>
        </td>
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

function renderProductOptions() {
  const products = store.listProducts({ activeOnly: true });
  const inventoryRows = store.inventoryReport();
  const options = products.map((product) => {
    const stock = inventoryRows
      .filter((item) => item.productId === product.id)
      .reduce((total, item) => total + item.onHand, 0);
    return `<option value="${product.id}">${escapeHtml(product.sku)} / ${escapeHtml(product.name)} / ${t("common.totalStock", "總庫存")} ${formatQuantity(stock)}</option>`;
  }).join("");

  document.querySelectorAll("[data-product-select]").forEach((select) => {
    const selected = select.value;
    const blank = select.required ? "" : `<option value="">${t("fields.secondProductOptional", "不新增第二筆")}</option>`;
    select.innerHTML = options ? blank + options : `<option value="">${t("emptyStates.noActiveProducts", "尚無啟用商品")}</option>`;
    if (selected && Array.from(select.options).some((option) => option.value === selected)) {
      select.value = selected;
    }
  });
}

function renderWarehouseOptions() {
  const warehouses = store.listWarehouses({ activeOnly: true });
  const options = warehouses
    .map((warehouse) => `<option value="${warehouse.id}">${escapeHtml(warehouse.code)} / ${escapeHtml(warehouse.name)}</option>`)
    .join("");

  document.querySelectorAll("[data-warehouse-select]").forEach((select) => {
    const selected = select.value;
    select.innerHTML = options || `<option value="">${t("emptyStates.noAvailableWarehouses", "沒有可用倉庫")}</option>`;
    if (selected && Array.from(select.options).some((option) => option.value === selected)) {
      select.value = selected;
    }
  });
}

function renderDepartmentOptions() {
  masterDataUi.renderDepartmentOptions();
}

function renderPartnerOptions() {
  masterDataUi.renderPartnerOptions();
}

function collectOrderItems(data, priceField) {
  const secondPriceField = `${priceField}2`;
  const items = [{
    productId: data.productId,
    quantity: data.quantity,
    [priceField]: data[priceField]
  }];

  if (data.productId2 && data.quantity2 && data[secondPriceField]) {
    items.push({
      productId: data.productId2,
      quantity: data.quantity2,
      [priceField]: data[secondPriceField]
    });
  }

  return items;
}

function collectTransferItems(data) {
  const items = [{
    productId: data.productId,
    quantity: data.quantity
  }];

  if (data.productId2 && data.quantity2) {
    items.push({
      productId: data.productId2,
      quantity: data.quantity2
    });
  }

  return items;
}

function productName(productId) {
  const product = store.listProducts().find((item) => item.id === Number(productId));
  return product ? product.name : "未知商品";
}

function warehouseName(warehouseId) {
  const warehouse = store.listWarehouses().find((item) => item.id === Number(warehouseId));
  return warehouse ? `${warehouse.code} ${warehouse.name}` : "未指定倉庫";
}

function movementBadge(type) {
  if (type === "purchase") {
    return '<span class="badge">進貨</span>';
  }

  if (type === "adjustment") {
    return '<span class="badge neutral">調整</span>';
  }

  if (type === "transfer") {
    return '<span class="badge neutral">調撥</span>';
  }

  if (type === "salesReturn") {
    return '<span class="badge neutral">銷退</span>';
  }

  if (type === "purchaseReturn") {
    return '<span class="badge warn">進退</span>';
  }

  return '<span class="badge warn">銷售</span>';
}

function warehouseTypeLabel(type) {
  if (type === "store") {
    return "門市";
  }

  if (type === "display") {
    return "展示";
  }

  if (type === "return") {
    return "退貨區";
  }

  return "倉庫";
}

function saveState() {
  storage.saveState(store.snapshot());
}

function readBackupFile(file) {
  backupControl.readBackupFile(file);
}

function renderBackupSummary(summary) {
  return backupControl.renderBackupSummary(summary);
}

function setDefaultDates() {
  document.querySelectorAll('input[type="date"]').forEach((input) => {
    if (!input.value) {
      input.value = today;
    }
  });
}

function setStatus(message, isError, tone) {
  statusLine.textContent = message;
  statusLine.classList.toggle("is-warning", tone === "warning");
  statusLine.classList.toggle("is-error", Boolean(isError) && tone !== "warning");
  statusLine.classList.toggle("is-success", Boolean(message && !isError && tone !== "warning"));
}

function formatMoney(value) {
  const preferences = store.getPreferences
    ? store.getPreferences()
    : { moneyDecimals: 0, thousandsSeparator: ",", decimalSeparator: ".", currencySymbol: "$", currencyPosition: "prefix" };
  const amount = formatNumber(value, preferences.moneyDecimals, preferences);
  const symbol = preferences.currencySymbol || preferences.currencyCode || "$";
  return preferences.currencyPosition === "suffix" ? `${amount}${symbol}` : `${symbol}${amount}`;
}

function formatQuantity(value) {
  const preferences = store.getPreferences ? store.getPreferences() : {};
  return formatNumber(value, preferences.quantityDecimals, preferences);
}

function formatCount(value) {
  return formatNumber(value, 0, store.getPreferences ? store.getPreferences() : {});
}

function formatNumber(value, decimals, options) {
  const preferences = options || (store.getPreferences ? store.getPreferences() : {});
  const fixed = (Number(value) || 0).toFixed(Number(decimals) || 0);
  const parts = fixed.split(".");
  const thousands = preferences.thousandsSeparator === "" ? "," : preferences.thousandsSeparator || ",";
  const decimal = preferences.decimalSeparator === "" ? "." : preferences.decimalSeparator || ".";
  const integer = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
  return parts[1] ? `${integer}${decimal}${parts[1]}` : integer;
}

function formatPercent(value) {
  return `${formatNumber((Number(value) || 0) * 100, 0)}%`;
}

function formatDate(value) {
  const preferences = store.getPreferences ? store.getPreferences() : {};
  const date = parseDate(value);
  if (!date) {
    return "";
  }
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  if (preferences.dateFormat === "YYYY/MM/DD") {
    return `${yyyy}/${mm}/${dd}`;
  }
  if (preferences.dateFormat === "DD/MM/YYYY") {
    return `${dd}/${mm}/${yyyy}`;
  }
  if (preferences.dateFormat === "MM/DD/YYYY") {
    return `${mm}/${dd}/${yyyy}`;
  }
  return `${yyyy}-${mm}-${dd}`;
}

function parseDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    return null;
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function toCsv(rows) {
  const header = ["sku", "name", "warehouse", "category", "unit", "onHand", "adjusted", "cost", "price", "safetyStock", "stockValue", "revenue", "grossProfit", "lowStock"];
  return [header.join(",")]
    .concat(rows.map((row) => header.map((key) => csvCell(row[key])).join(",")))
    .join("\n");
}

function formatInventoryCsvRows(rows) {
  return rows.map((row) => Object.assign({}, row, {
    onHand: formatQuantity(row.onHand),
    adjusted: formatQuantity(row.adjusted),
    cost: formatMoney(row.cost),
    price: formatMoney(row.price),
    safetyStock: formatQuantity(row.safetyStock),
    stockValue: formatMoney(row.stockValue),
    revenue: formatMoney(row.revenue),
    grossProfit: formatMoney(row.grossProfit)
  }));
}

function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadJson(filename, data) {
  backupControl.downloadJson(filename, data);
}

function csvCell(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
