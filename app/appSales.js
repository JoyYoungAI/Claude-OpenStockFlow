// Sales: form submission, list actions, render

function bindSaleHandlers() {
  saleForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAction("createSale")) { return; }
    const data = Object.fromEntries(new FormData(saleForm));
    const sale = store.addSaleOrder({
      customerId: data.customerId,
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
    if (!sale) { setStatus(ClaudeOpenStockFlowMessages.message("saleOrderFailed"), true); return; }
    if (sale.error === "INSUFFICIENT_STOCK") { setStatus(ClaudeOpenStockFlowMessages.transactionError(sale, "saleOrderFailed"), true); return; }
    recordAudit("create", {
      entityType: "sale", documentNo: sale.documentNo,
      relatedDocumentNos: [sale.documentNo],
      summary: `建立銷售單 ${sale.documentNo}`,
      after: { lines: sale.lines.length, total: ClaudeOpenStockFlowModels.saleDocTotal(sale) },
      riskLevel: data.saveAsDraft ? "medium" : "high"
    });
    saleForm.reset();
    setDefaultDates();
    saveState();
    setStatus(interpolate(t("messages.saleSaved", "已建立銷售單 {documentNo}，共 {lineCount} 筆明細。"), { documentNo: sale.documentNo, lineCount: sale.lines.length }));
    render();
  });

  document.querySelector("#sale-list").addEventListener("click", (event) => {
    const returnButton = event.target.closest("[data-return-sale-id]");
    if (returnButton) { handleReturn("sale", Number(returnButton.dataset.returnSaleId)); return; }

    const convertLoanButton = event.target.closest("[data-convert-to-loan-line-id]");
    if (convertLoanButton) { handleConvertToLoan(Number(convertLoanButton.dataset.convertToLoanLineId)); return; }

    const reassignButton = event.target.closest("[data-reassign-sale-owner-id]");
    if (reassignButton) { handleDocumentOwnerReassign("sale", Number(reassignButton.dataset.reassignSaleOwnerId)); return; }

    const workflowButton = event.target.closest("[data-approval-action][data-sale-id]");
    if (workflowButton) { handleDocumentWorkflow("sale", Number(workflowButton.dataset.saleId), workflowButton.dataset.approvalAction); return; }

    const reversalButton = event.target.closest("[data-create-sale-reversal-id]");
    if (reversalButton) { handleVoidReversal("sale", Number(reversalButton.dataset.createSaleReversalId)); return; }

    const button = event.target.closest("[data-remove-sale-id]");
    if (!button) { return; }
    const targetDocument = targetDocumentById("sale", Number(button.dataset.removeSaleId));
    if (!requireAction("voidDocument", { targetDocument })) { return; }
    if (!confirmAction("voidSale")) { return; }
    const reason = prompt(t("prompts.voidReason", "請填寫作廢原因，系統會保留原始單據紀錄。"));
    if (!String(reason || "").trim()) { setStatus(t("messages.voidReasonRequired", "作廢需要填寫原因，已取消。"), true); return; }
    const removeResult = store.removeSale(Number(button.dataset.removeSaleId), { reason, user: currentUser.name });
    if (removeResult) {
      recordAudit("delete", {
        entityType: "sale", entityId: button.dataset.removeSaleId,
        summary: "作廢銷售紀錄", reason, riskLevel: "high"
      });
      saveState();
      setStatus(t("messages.saleVoided", "已作廢銷售紀錄，原單已保留並排除於有效庫存。"));
      render();
    } else {
      setStatus(t("messages.approvalActionFailed", "單據狀態無法更新。"), true);
    }
  });

  saleQuery.addEventListener("input", renderSales);
  saleMonth.addEventListener("change", renderSales);
  saleIncludeVoided.addEventListener("change", () => {
    if (saleIncludeVoided.checked) { recordSensitiveRead("sale", "開啟銷售包含作廢查詢", { includeVoided: true, month: saleMonth.value }); }
    renderSales();
  });
}

function renderSalesReturns() {
  const returns = store.listReturns({ documentType: "salesReturn" });
  document.querySelector("#sale-return-count").textContent = `${formatCount(returns.length)} ${t("common.countUnit", "筆")}`;
  document.querySelector("#sale-return-list").innerHTML = returns.length
    ? returns.map((item) => `
      <article class="record-card">
        <div>
          <strong>${escapeHtml(productName(item.productId))}</strong>
          <div class="record-meta">${escapeHtml(item.documentNo)} / ${formatDate(item.date)} / ${t("documentStatus.returnedQuantity", "已退")} ${formatQuantity(item.quantity)} / ${escapeHtml(item.reason || "")} / ${t("common.source", "來源")} ${escapeHtml(item.sourceDocumentNo || "-")}</div>
        </div>
        <div class="record-side">
          <span class="amount income">+${formatQuantity(item.quantity)} / ${formatRestrictedMoney(item.quantity * item.unitPrice, "viewSalesRevenue")}</span>
        </div>
      </article>
    `).join("")
    : `<div class="empty">${t("emptyStates.noSalesReturns", "尚無銷售退貨紀錄。")}</div>`;
}

function renderSales() {
  const sales = store.listSales({ query: saleQuery.value, month: saleMonth.value, includeVoided: saleIncludeVoided.checked });
  document.querySelector("#sale-count").textContent = `${formatCount(sales.length)} ${t("common.countUnit", "筆")}`;
  const allReturns = store.listReturns({ documentType: "salesReturn" });
  document.querySelector("#sale-list").innerHTML = sales.length
    ? sales.map((doc) => {
      const customerDisplay = doc.customerName
        ? escapeHtml(doc.customerName)
        : `<span class="text-danger">${t("common.notFilled", "未填")}${t("common.customer", "客戶")}</span>`;
      const lines = doc.lines || [];
      const linesTotal = ClaudeOpenStockFlowModels.saleDocTotal(doc);
      const linesHtml = lines.map((line) => {
        const remaining = ClaudeOpenStockFlowModels.returnableQuantity(line, allReturns);
        const returned = line.quantity - remaining;
        const canReturn = !isVoidedDocument(doc) && ["confirmed", "amended", "voidRequested"].includes(doc.status || "confirmed") && canPerform("createSalesReturn", { targetDocument: doc });
        const returnBtn = canReturn && remaining > 0
          ? `<button class="text-button" type="button" data-return-sale-id="${line.lineId}" title="${escapeAttr(t("tooltips.salesReturn", "建立銷售退貨，會回補庫存並調整應收。"))}">${t("actions.createReturn", "退貨")}</button>`
          : canReturn ? `<button class="text-button" type="button" disabled title="${escapeAttr(t("tooltips.returnCompleted", "此單據已無可退數量。"))}">${t("actions.createReturn", "退貨")}</button>` : "";
        const convertLoanBtn = canReturn && remaining > 0
          ? `<button class="text-button" type="button" data-convert-to-loan-line-id="${line.lineId}" title="${escapeAttr(t("tooltips.convertToLoan", "銷貨轉借貨：建立退貨單並調撥至借貨倉。"))}">${t("actions.convertToLoan", "轉借貨")}</button>`
          : "";
        return `<div class="record-meta">${escapeHtml(productName(line.productId))} × ${formatQuantity(line.quantity)} / ${formatRestrictedMoney(line.unitPrice, "viewSalesRevenue")}${returned ? ` / ${t("documentStatus.returnedQuantity", "已退")} ${formatQuantity(returned)}` : ""} ${returnBtn}${convertLoanBtn}</div>`;
      }).join("");
      return `
        <article class="record-card">
          <div>
            <strong>${escapeHtml(doc.documentNo || t("common.noDocumentNo", "無單號"))} ${documentStatusBadge(doc)}</strong>
            <div class="record-meta">${formatDate(doc.date)} / ${escapeHtml(warehouseName(doc.warehouseId))} / ${customerDisplay} / ${escapeHtml(documentResponsibilityText(doc))} / ${escapeHtml(doc.note || t("common.noNote", "無備註"))}${voidMeta(doc)}</div>
            ${linesHtml}
            ${voidDetailPanel(doc, "sale")}
          </div>
          <div class="record-side">
            <span class="amount expense">-${formatRestrictedMoney(linesTotal, "viewSalesRevenue")}</span>
            ${voidReversalButton(doc, "sale")}
            ${reassignDocumentOwnerButton(doc, "sale")}
            ${documentWorkflowButtons(doc, "sale")}
            ${voidDocumentButton(doc, "sale")}
          </div>
        </article>
      `;
    }).join("")
    : `<div class="empty">${t("emptyStates.noSales", "尚無銷售紀錄。")}</div>`;
}
