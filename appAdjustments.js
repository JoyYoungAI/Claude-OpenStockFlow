// Adjustments and transfers: form submission, render

function bindAdjustmentHandlers() {
  adjustmentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAction("stockAdjust")) { return; }
    const data = Object.fromEntries(new FormData(adjustmentForm));
    const adjustment = store.addStockCount(data);
    if (!adjustment) { setStatus(OpenStockFlowMessages.message("adjustmentFailed"), true); return; }
    if (adjustment.error === "NO_DIFFERENCE") { setStatus(OpenStockFlowMessages.transactionError(adjustment, "adjustmentFailed")); return; }
    recordAudit("create", {
      entityType: "adjustment", entityId: adjustment.id, documentNo: adjustment.documentNo,
      summary: `建立盤點調整 ${adjustment.documentNo}`,
      after: { quantity: adjustment.quantity, reason: adjustment.reason }, riskLevel: "high"
    });
    adjustmentForm.reset();
    setDefaultDates();
    saveState();
    setStatus(`已建立盤點調整 ${adjustment.documentNo}，異動 ${adjustment.quantity > 0 ? "+" : ""}${formatQuantity(adjustment.quantity)}。`);
    render();
  });

  transferForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAction("transferStock")) { return; }
    const data = Object.fromEntries(new FormData(transferForm));
    const transfer = store.addTransferOrder({
      fromWarehouseId: data.fromWarehouseId,
      toWarehouseId: data.toWarehouseId,
      date: data.date,
      note: data.note,
      items: collectTransferItems(data)
    });
    if (!transfer) { setStatus(OpenStockFlowMessages.message("transferOrderFailed"), true); return; }
    if (transfer.error === "INSUFFICIENT_STOCK") { setStatus(OpenStockFlowMessages.transactionError(transfer, "transferOrderFailed"), true); return; }
    recordAudit("create", {
      entityType: "transfer", documentNo: transfer.documentNo,
      relatedDocumentNos: [transfer.documentNo],
      summary: `建立調撥單 ${transfer.documentNo}`,
      after: { lines: transfer.lines.length, totalQuantity: transfer.totalQuantity }, riskLevel: "high"
    });
    transferForm.reset();
    setDefaultDates();
    saveState();
    setStatus(`已建立調撥單 ${transfer.documentNo}，共 ${transfer.lines.length} 筆明細。`);
    render();
  });

  adjustmentQuery.addEventListener("input", renderAdjustments);
  adjustmentMonth.addEventListener("change", renderAdjustments);
  transferQuery.addEventListener("input", renderTransfers);
  transferMonth.addEventListener("change", renderTransfers);
}

function renderAdjustments() {
  const adjustments = store.listAdjustments({ query: adjustmentQuery.value, month: adjustmentMonth.value });
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
  const transfers = store.listTransfers({ query: transferQuery.value, month: transferMonth.value });
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
