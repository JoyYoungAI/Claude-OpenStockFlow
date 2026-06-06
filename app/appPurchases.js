// Purchases: form submission, list actions, render

function bindPurchaseHandlers() {
  purchaseForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAction("createPurchase")) { return; }
    const data = Object.fromEntries(new FormData(purchaseForm));
    const purchase = store.addPurchaseOrder({
      supplierId: data.supplierId,
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
    if (!purchase) { setStatus(ClaudeOpenStockFlowMessages.transactionError(purchase, "purchaseOrderFailed"), true); return; }
    recordAudit("create", {
      entityType: "purchase", documentNo: purchase.documentNo,
      relatedDocumentNos: [purchase.documentNo],
      summary: `建立進貨單 ${purchase.documentNo}`,
      after: { lines: purchase.lines.length, total: ClaudeOpenStockFlowModels.purchaseDocTotal(purchase) },
      riskLevel: data.saveAsDraft ? "medium" : "high"
    });
    purchaseForm.reset();
    setDefaultDates();
    saveState();
    setStatus(interpolate(t("messages.purchaseSaved", "已建立進貨單 {documentNo}，共 {lineCount} 筆明細。"), { documentNo: purchase.documentNo, lineCount: purchase.lines.length }));
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
    if (result && result.error === "NEGATIVE_STOCK") { setStatus(ClaudeOpenStockFlowMessages.transactionError(result, "negativeStockOnRemove"), true); return; }
    if (result) {
      recordAudit("delete", {
        entityType: "purchase", entityId: button.dataset.removePurchaseId,
        summary: "作廢進貨紀錄", reason, riskLevel: "high"
      });
      saveState();
      setStatus(t("messages.purchaseVoided", "已作廢進貨紀錄，原單已保留並排除於有效庫存。"));
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

function renderPurchaseReturns() {
  const returns = store.listReturns({ documentType: "purchaseReturn" });
  document.querySelector("#purchase-return-count").textContent = `${formatCount(returns.length)} ${t("common.countUnit", "筆")}`;
  document.querySelector("#purchase-return-list").innerHTML = returns.length
    ? returns.map((item) => `
      <article class="record-card">
        <div>
          <strong>${escapeHtml(productName(item.productId))}</strong>
          <div class="record-meta">${escapeHtml(item.documentNo)} / ${formatDate(item.date)} / ${t("documentStatus.returnedQuantity", "已退")} ${formatQuantity(item.quantity)} / ${escapeHtml(item.reason || "")} / ${t("common.source", "來源")} ${escapeHtml(item.sourceDocumentNo || "-")}</div>
        </div>
        <div class="record-side">
          <span class="amount expense">-${formatQuantity(item.quantity)} / ${formatRestrictedMoney(item.quantity * item.unitPrice, "viewCost")}</span>
        </div>
      </article>
    `).join("")
    : `<div class="empty">${t("emptyStates.noPurchaseReturns", "尚無進貨退貨紀錄。")}</div>`;
}

function renderPurchases() {
  const purchases = store.listPurchases({ query: purchaseQuery.value, month: purchaseMonth.value, includeVoided: purchaseIncludeVoided.checked });
  document.querySelector("#purchase-count").textContent = `${formatCount(purchases.length)} ${t("common.countUnit", "筆")}`;
  const allReturns = store.listReturns({ documentType: "purchaseReturn" });
  document.querySelector("#purchase-list").innerHTML = purchases.length
    ? purchases.map((doc) => {
      const supplierDisplay = doc.supplierName
        ? escapeHtml(doc.supplierName)
        : `<span class="text-danger">${t("common.notFilled", "未填")}${t("common.supplier", "供應商")}</span>`;
      const lines = doc.lines || [];
      const linesTotal = ClaudeOpenStockFlowModels.purchaseDocTotal(doc);
      const linesHtml = lines.map((line) => {
        const remaining = ClaudeOpenStockFlowModels.returnableQuantity(line, allReturns);
        const returned = line.quantity - remaining;
        const canReturn = !isVoidedDocument(doc) && ["confirmed", "amended", "voidRequested"].includes(doc.status || "confirmed") && canPerform("createPurchaseReturn", { targetDocument: doc });
        const returnBtn = canReturn && remaining > 0
          ? `<button class="text-button" type="button" data-return-purchase-id="${line.lineId}" title="${escapeAttr(t("tooltips.purchaseReturn", "建立進貨退貨，會扣回庫存並調整應付。"))}">${t("actions.createReturn", "退貨")}</button>`
          : canReturn ? `<button class="text-button" type="button" disabled title="${escapeAttr(t("tooltips.returnCompleted", "此單據已無可退數量。"))}">${t("actions.createReturn", "退貨")}</button>` : "";
        return `<div class="record-meta">${escapeHtml(productName(line.productId))} × ${formatQuantity(line.quantity)} / ${formatRestrictedMoney(line.unitCost, "viewCost")}${returned ? ` / ${t("documentStatus.returnedQuantity", "已退")} ${formatQuantity(returned)}` : ""} ${returnBtn}</div>`;
      }).join("");
      return `
        <article class="record-card">
          <div>
            <strong>${escapeHtml(doc.documentNo || t("common.noDocumentNo", "無單號"))} ${documentStatusBadge(doc)}</strong>
            <div class="record-meta">${formatDate(doc.date)} / ${escapeHtml(warehouseName(doc.warehouseId))} / ${supplierDisplay} / ${escapeHtml(documentResponsibilityText(doc))} / ${escapeHtml(doc.note || t("common.noNote", "無備註"))}${voidMeta(doc)}</div>
            ${linesHtml}
            ${voidDetailPanel(doc, "purchase")}
          </div>
          <div class="record-side">
            <span class="amount income">+${formatRestrictedMoney(linesTotal, "viewCost")}</span>
            ${voidReversalButton(doc, "purchase")}
            ${reassignDocumentOwnerButton(doc, "purchase")}
            ${documentWorkflowButtons(doc, "purchase")}
            ${voidDocumentButton(doc, "purchase")}
          </div>
        </article>
      `;
    }).join("")
    : `<div class="empty">${t("emptyStates.noPurchases", "尚無進貨紀錄。")}</div>`;
}
