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
  const effectText = type === "purchase" ? t("voidEffect.purchase", "進貨庫存與應付帳款已從有效資料排除，沖銷事件建立後可追溯原單。") : t("voidEffect.sale", "銷售出貨、應收帳款與毛利已從有效資料排除，沖銷事件建立後可追溯原單。");
  return `
    <div class="void-detail" data-void-ui-source-reversal-link>
      <span data-void-ui-reason-visible>${t("common.sourceDocument", "原單")} ${escapeHtml(sourceDocumentNo)} / ${t("common.reversal", "沖銷")} ${escapeHtml(reversalDocumentNo)}</span>
      <span>${t("common.reason", "原因")} ${escapeHtml(item.voidReason || t("common.notFilled", "未填"))} / ${escapeHtml(item.voidedBy || t("common.localUser", "本機使用者"))} / ${escapeHtml(item.voidedAt ? formatDate(item.voidedAt.slice(0, 10)) : t("common.notFilled", "未填"))}</span>
      <span>${t("common.related", "關聯")} ${escapeHtml(Array.from(new Set(relatedDocumentNos)).join(" / ") || t("common.notFilled", "未填"))}</span>
      <span>${escapeHtml(effectText)}</span>
    </div>
  `;
}

function isVoidedDocument(item) { return ClaudeOpenStockFlowModels.isVoidedDocument(item); }

function documentResponsibilityText(item) {
  const unassigned = t("common.unassignedOwner", "未指派");
  const ownerName = employeeName(item && item.ownerEmployeeId) || unassigned;
  const department = departmentName(item && item.ownerDepartmentId) || unassigned;
  return `${t("common.responsibility", "負責")}：${ownerName} / ${department}`;
}

function employeeName(employeeId) { const employee = store.listEmployees().find((item) => item.id === Number(employeeId)); return employee ? employee.name : ""; }
function departmentName(departmentId) { const department = store.listDepartments().find((item) => item.id === Number(departmentId)); return department ? department.name : ""; }

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
  const label = t("actions.createReversal", "建立沖銷");
  if (item.reversalDocumentNo) { return `<button class="text-button" type="button" disabled title="${escapeAttr(interpolate(t("tooltips.reversalAlreadyCreated", "已建立沖銷事件：{documentNo}"), { documentNo: item.reversalDocumentNo }))}">${label}</button>`; }
  if (!canPerform("voidDocument", targetDocumentContext(item))) { return `<button class="text-button" type="button" disabled title="${escapeAttr(permissionReason("voidDocument"))}">${label}</button>`; }
  const dataAttribute = type === "purchase" ? "data-create-purchase-reversal-id" : "data-create-sale-reversal-id";
  return `<button class="text-button" type="button" data-void-ui-create-reversal-action ${dataAttribute}="${item.id}" title="${escapeAttr(t("tooltips.createReversal", "建立反向事件並連結原單"))}">${label}</button>`;
}
