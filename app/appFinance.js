// Finance: receivables, payables, payments, preferences

function bindFinanceHandlers() {
  paymentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAction("managePayments")) { return; }
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
    if (!payment) { setStatus(ClaudeOpenStockFlowMessages.message("paymentSaveFailed"), true); return; }
    if (payment.error === "PAYMENT_EXCEEDS_BALANCE") { setStatus(ClaudeOpenStockFlowMessages.message("paymentExceedsBalance"), true); return; }
    if (payment.error === "INVALID_PAYMENT_DIRECTION") { setStatus(ClaudeOpenStockFlowMessages.message("invalidPaymentDirection"), true); return; }
    recordAudit("create", {
      entityType: "payment", entityId: payment.id,
      summary: `登錄${payment.direction === "in" ? "收款" : "付款"}`,
      after: { direction: payment.direction, targetType: payment.targetType, targetId: payment.targetId, amount: payment.amount },
      riskLevel: "high"
    });
    paymentForm.reset();
    setDefaultDates();
    saveState();
    setStatus(t("messages.paymentSaved", "已儲存收付款。"));
    render();
  });

  preferencesForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAction("savePreferences")) { return; }
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
    setStatus(t("messages.preferencesSaved", "已儲存格式與報表設定。"));
    render();
  });

  financeQuery.addEventListener("input", renderFinance);
  financeMonth.addEventListener("change", renderFinance);
  paymentDirection.addEventListener("change", renderPaymentTargets);
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
          <div class="record-meta">${formatDate(item.date)} / ${item.targetType === "receivable" ? t("common.receivable", "應收") : t("common.payable", "應付")} #${item.targetId} / ${escapeHtml(item.note || t("common.noNote", "無備註"))}</div>
        </div>
        <span class="amount ${item.direction === "in" ? "income" : "expense"}">${canViewCompanyFinance ? formatMoney(item.amount) : restrictedText()}</span>
      </article>
    `).join("")
    : `<div class="empty">${t("emptyStates.noPayments", "尚無收付款紀錄。")}</div>`;

  renderPaymentTargets();
}

function financeTargetCard(item, partyField, fieldName) {
  const balance = ClaudeOpenStockFlowModels.remainingBalance(item);
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
  if (status === "paid") { return t("common.paid", "已結清"); }
  if (status === "partial") { return t("common.partial", "部分沖帳"); }
  if (status === "voided") { return t("documentStatus.voided", "已作廢"); }
  return t("common.open", "未結");
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
      const balance = ClaudeOpenStockFlowModels.remainingBalance(item);
      return `<option value="${item.id}">${escapeHtml(item.sourceDocumentNo || t("common.noDocumentNo", "無單號"))} / ${escapeHtml(party || t("common.notFilled", "未填") + t("tables.party", "對象"))} / ${formatMoney(balance)}</option>`;
    }).join("")
    : `<option value="">${t("emptyStates.noPaymentTargets", "沒有可沖帳項目")}</option>`;
  if (rows.some((item) => String(item.id) === current)) { paymentTarget.value = current; }
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
