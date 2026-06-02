// Purchases: form submission, list actions, render

function bindPurchaseHandlers() {
  purchaseForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAction("createPurchase")) { return; }
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
    if (!purchase) { setStatus(OpenStockFlowMessages.transactionError(purchase, "purchaseOrderFailed"), true); return; }
    recordAudit("create", {
      entityType: "purchase", documentNo: purchase.documentNo,
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

  document.querySelector("#purchase-list").addEventListener("click", (event) => {
    const returnButton = event.target.closest("[data-return-purchase-id]");
    if (returnButton) { handleReturn("purchase", Number(returnButton.dataset.returnPurchaseId)); return; }

    const reassignButton = event.target.closest("[data-reassign-purchase-owner-id]");
    if (reassignButton) { handleDocumentOwnerReassign("purchase", Number(reassignButton.dataset.reassignPurchaseOwnerId)); return; }

    const workflowButton = event.target.closest("[data-approval-action][data-purchase-id]");
    if (workflowButton) { handleDocumentWorkflow("purchase", Number(workflowButton.dataset.purchaseId), workflowButton.dataset.approvalAction); return; }

    const reversalButton = event.target.closest("[data-create-purchase-reversal-id]");
    if (reversalButton) { handleVoidReversal("purchase", Number(reversalButton.dataset.createPurchaseReversalId)); return; }

    const button = event.target.closest("[data-remove-purchase-id]");
    if (!button) { return; }
    const targetDocument = targetDocumentById("purchase", Number(button.dataset.removePurchaseId));
    if (!requireAction("voidDocument", { targetDocument })) { return; }
    if (!confirmAction("voidPurchase")) { return; }
    const reason = prompt(t("prompts.voidReason", "請填寫作廢原因，系統會保留原始單據紀錄。"));
    if (!String(reason || "").trim()) { setStatus(t("messages.voidReasonRequired", "作廢需要填寫原因，已取消。"), true); return; }
    const result = store.removePurchase(Number(button.dataset.removePurchaseId), { reason, user: currentUser.name });
    if (result && result.error === "NEGATIVE_STOCK") { setStatus(OpenStockFlowMessages.transactionError(result, "negativeStockOnRemove"), true); return; }
    if (result) {
      recordAudit("delete", {
        entityType: "purchase", entityId: button.dataset.removePurchaseId,
        summary: "作廢進貨紀錄", reason, riskLevel: "high"
      });
      saveState();
      setStatus("已作廢進貨紀錄，原單已保留並排除於有效庫存。");
      render();
    }
  });

  purchaseQuery.addEventListener("input", renderPurchases);
  purchaseMonth.addEventListener("change", renderPurchases);
  purchaseIncludeVoided.addEventListener("change", () => {
    if (purchaseIncludeVoided.checked) { recordSensitiveRead("purchase", "開啟進貨包含作廢查詢", { includeVoided: true, month: purchaseMonth.value }); }
    renderPurchases();
  });
}

function renderPurchases() {
  const purchases = store.listPurchases({ query: purchaseQuery.value, month: purchaseMonth.value, includeVoided: purchaseIncludeVoided.checked });
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
