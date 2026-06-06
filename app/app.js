const appVersion = "1.20.0";
const assetVersion = "1.20.0";
const today = new Date().toISOString().slice(0, 10);
const accessRoleStorageKey = "stockflow-current-role-v1";
const currentEmployeeStorageKey = "stockflow-current-employee-v1";
const storage = ClaudeOpenStockFlowStorage.createInventoryStorage({ seedState, appVersion, assetVersion, storageKey: typeof getActiveCompanyStorageKey === "function" ? getActiveCompanyStorageKey() : undefined });
const initialLoad = storage.loadState();
let store = createInventoryStore(initialLoad.state);
const accessControl = ClaudeOpenStockFlowAccess.createInventoryAccess({
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
const auditControl = ClaudeOpenStockFlowAudit.createInventoryAudit({
  getStore: () => store,
  getCurrentUser: () => currentUser,
  document,
  escapeHtml,
  t,
  formatDate,
  roleLabel
});
const backupControl = ClaudeOpenStockFlowBackup.createInventoryBackup({
  document,
  storage,
  backupPreview,
  restoreButton,
  onRestoreReady: (state) => { pendingRestoreState = state; renderActionAvailability(); },
  t,
  escapeHtml
});
const masterDataUi = ClaudeOpenStockFlowMasterDataUi.createInventoryMasterDataUi({
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
    setStatus(t("messages.inventoryCsvExported", "已匯出庫存 CSV。"));
  });

  backupExportButton.addEventListener("click", () => {
    if (!requireAction("exportBackup")) { return; }
    recordAudit("export", { entityType: "backup", summary: "匯出完整備份 JSON", riskLevel: "high" });
    saveState();
    downloadJson(backupControl.backupFilename(today), storage.createStorageEnvelope(store.snapshot()));
    setStatus(t("messages.backupExported", "已匯出完整備份 JSON。"));
  });

  backupFileInput.addEventListener("change", () => {
    pendingRestoreState = null;
    restoreButton.disabled = true;
    const file = backupFileInput.files && backupFileInput.files[0];
    if (!file) { backupPreview.textContent = t("emptyStates.noBackupFile", "尚未選擇備份檔。"); backupPreview.classList.add("empty"); renderActionAvailability(); return; }
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
    setStatus(t("messages.backupRestored", "已完成整包還原，資料已重新載入。"));
    render();
  });

  resetButton.addEventListener("click", () => {
    if (!requireAction("resetSampleData")) { return; }
    if (!confirmAction("resetSampleData")) { return; }
    const previousAuditLogs = store.listAuditLogs ? store.listAuditLogs({}) : [];
    store = createInventoryStore(Object.assign({}, seedState, { auditLogs: previousAuditLogs }));
    recordAudit("restore", { entityType: "sampleData", summary: "重設為範例資料", reason: "使用者確認重設範例資料", riskLevel: "high" });
    saveState();
    setStatus(t("messages.sampleDataReset", "已重置為範例資料。"));
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
  if (result.error === "INSUFFICIENT_STOCK") { setStatus(ClaudeOpenStockFlowMessages.message("insufficientStock"), true); return; }
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
  if (!result) { setStatus(t("messages.voidReversalNotFound", "找不到可建立沖銷事件的作廢單據。"), true); return; }
  saveState();
  recordAudit("create", {
    entityType: "voidReversal", entityId: result.id, documentNo: result.documentNo,
    sourceDocumentNo: result.sourceDocumentNo, relatedDocumentNos: [result.sourceDocumentNo, result.documentNo],
    summary: `建立沖銷事件：${result.documentNo}`, riskLevel: "high"
  });
  saveState();
  setStatus(interpolate(t("messages.voidReversalSaved", "已建立沖銷事件：{documentNo}"), { documentNo: result.documentNo }));
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
  if (result.error === "INSUFFICIENT_STOCK") { setStatus(ClaudeOpenStockFlowMessages.message("insufficientStock"), true); return; }
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

function handleConvertToLoan(lineId) {
  const targetDocument = targetDocumentById("sale", lineId);
  if (!requireAction("createSalesReturn", { targetDocument })) { return; }
  const loanWarehouses = store.listWarehouses({ activeOnly: true }).filter((w) => w.type === "loan");
  if (!loanWarehouses.length) { setStatus(t("messages.noLoanWarehouse", "系統中尚未設定借貨倉，請先在倉庫主檔新增 type=loan 的倉庫。"), true); return; }
  let loanWarehouseId;
  if (loanWarehouses.length === 1) {
    loanWarehouseId = loanWarehouses[0].id;
  } else {
    const choices = loanWarehouses.map((w, i) => `${i + 1}. ${w.name} (${w.code})`).join("\n");
    const input = prompt(`${t("prompts.selectLoanWarehouse", "請選擇借貨倉（輸入序號）")}：\n${choices}`);
    const idx = Number(input) - 1;
    if (!Number.isFinite(idx) || idx < 0 || idx >= loanWarehouses.length) { setStatus(t("messages.invalidLoanWarehouseSelection", "請輸入有效的序號選擇借貨倉。"), true); return; }
    loanWarehouseId = loanWarehouses[idx].id;
  }
  const reason = prompt(t("prompts.convertToLoanReason", "請輸入轉借貨原因"));
  if (!String(reason || "").trim()) { setStatus(t("messages.convertToLoanReasonRequired", "請先填寫轉借貨原因。"), true); return; }
  const result = store.convertSaleLinesToLoan({
    saleId: lineId, lineIds: [lineId], loanWarehouseId,
    reason, user: currentUser.name, date: today
  });
  if (!result) { setStatus(t("messages.convertToLoanFailed", "轉借貨失敗，請確認銷售單狀態與借貨倉設定。"), true); return; }
  if (result.error === "NO_RETURNABLE_QUANTITY") { setStatus(t("messages.noConvertibleQuantity", "此單身已無可轉換數量。"), true); return; }
  saveState();
  recordAudit("create", {
    entityType: "loanConversion", documentNo: result.returnDocumentNo,
    relatedDocumentNos: [result.returnDocumentNo, result.transferDocumentNo],
    summary: `銷貨轉借貨 ${result.returnDocumentNo} + 調撥 ${result.transferDocumentNo}`,
    reason, after: { lines: result.lines.length }, riskLevel: "high"
  });
  saveState();
  setStatus(interpolate(t("messages.convertToLoanSaved", "已轉為借貨：退貨單 {returnDocumentNo}，調撥單 {transferDocumentNo}。"), { returnDocumentNo: result.returnDocumentNo, transferDocumentNo: result.transferDocumentNo }));
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
  const numId = Number(id);
  return rows.find((item) => item.id === numId || (Array.isArray(item.lines) && item.lines.some((l) => l.lineId === numId))) || null;
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
function normalizeRole(role) { return ClaudeOpenStockFlowAccess.normalizeRole(role); }
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
  if (employeeLabel) { employeeLabel.textContent = t("access.localEmployee", "本機人員"); }
  employeeSelect.innerHTML = employees.length
    ? employees.map((employee) => {
      const department = store.listDepartments().find((item) => item.id === employee.departmentId);
      return `<option value="${employee.id}">${escapeHtml(employee.name)} / ${escapeHtml(department ? department.name : t("common.unassignedDepartment", "未指定部門"))} / ${escapeHtml(roleLabel(employee.role))}</option>`;
    }).join("")
    : `<option value="">${escapeHtml(t("common.localUser", "本機使用者"))}</option>`;
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
function t(path, fallback) { return window.ClaudeOpenStockFlowI18n ? window.ClaudeOpenStockFlowI18n.text(currentLanguage(), path, fallback) : (fallback !== undefined ? fallback : path); }

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

function productName(productId) { const product = store.listProducts().find((item) => item.id === Number(productId)); return product ? product.name : t("common.unknownProduct", "未知商品"); }
function warehouseName(warehouseId) { const warehouse = store.listWarehouses().find((item) => item.id === Number(warehouseId)); return warehouse ? `${warehouse.code} ${warehouse.name}` : t("common.unassignedWarehouse", "未指定倉庫"); }
function categoryName(categoryId) { const category = store.listProductCategories().find((item) => item.id === Number(categoryId)); return category ? category.name : ""; }

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

function downloadJson(filename, data) { backupControl.downloadJson(filename, data); }
