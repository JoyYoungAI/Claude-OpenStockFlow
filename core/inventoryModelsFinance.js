(function (global) {
  const utils = global.ClaudeOpenStockFlowUtils || (typeof require !== "undefined" ? require("./inventoryUtils") : {});
  const { normalizeText, positiveNumber, nonNegativeNumber, normalizeDate } = utils;

  function normalizeDocumentNoList(value) {
    if (!Array.isArray(value)) { return []; }
    return value.map(normalizeText).filter(Boolean);
  }

  function financeStatus(amount, paidAmount) {
    if (paidAmount <= 0) { return "open"; }
    return paidAmount >= amount ? "paid" : "partial";
  }

  function normalizeFinanceStatus(status, amount, paidAmount) {
    const value = normalizeText(status);
    if (value === "voided") { return value; }
    return financeStatus(amount, paidAmount);
  }

  function normalizeReceivable(input, id) {
    const amount = positiveNumber(input && input.amount);
    const paidAmount = nonNegativeNumber(input && input.paidAmount);
    const dueDate = normalizeDate(input && input.dueDate);
    if (amount === null || paidAmount === null || paidAmount > amount || !dueDate) { return null; }
    return {
      id, sourceType: normalizeText(input && input.sourceType) || "sale",
      sourceDocumentNo: normalizeText(input && input.sourceDocumentNo),
      customer: normalizeText(input && input.customer), amount, paidAmount, dueDate,
      status: normalizeFinanceStatus(input && input.status, amount, paidAmount),
      note: normalizeText(input && input.note), voidReason: normalizeText(input && input.voidReason),
      voidedAt: normalizeText(input && input.voidedAt), voidedBy: normalizeText(input && input.voidedBy),
      relatedDocumentNos: normalizeDocumentNoList(input && input.relatedDocumentNos)
    };
  }

  function copyReceivable(receivable) {
    const amount = positiveNumber(receivable.amount) || 0;
    const paidAmount = nonNegativeNumber(receivable.paidAmount) || 0;
    return {
      id: Number(receivable.id), sourceType: normalizeText(receivable.sourceType) || "sale",
      sourceDocumentNo: normalizeText(receivable.sourceDocumentNo), customer: normalizeText(receivable.customer),
      amount, paidAmount, dueDate: normalizeDate(receivable.dueDate),
      status: normalizeFinanceStatus(receivable.status, amount, paidAmount),
      note: normalizeText(receivable.note), voidReason: normalizeText(receivable.voidReason),
      voidedAt: normalizeText(receivable.voidedAt), voidedBy: normalizeText(receivable.voidedBy),
      relatedDocumentNos: normalizeDocumentNoList(receivable.relatedDocumentNos)
    };
  }

  function normalizePayable(input, id) {
    const amount = positiveNumber(input && input.amount);
    const paidAmount = nonNegativeNumber(input && input.paidAmount);
    const dueDate = normalizeDate(input && input.dueDate);
    if (amount === null || paidAmount === null || paidAmount > amount || !dueDate) { return null; }
    return {
      id, sourceType: normalizeText(input && input.sourceType) || "purchase",
      sourceDocumentNo: normalizeText(input && input.sourceDocumentNo),
      supplier: normalizeText(input && input.supplier), amount, paidAmount, dueDate,
      status: normalizeFinanceStatus(input && input.status, amount, paidAmount),
      note: normalizeText(input && input.note), voidReason: normalizeText(input && input.voidReason),
      voidedAt: normalizeText(input && input.voidedAt), voidedBy: normalizeText(input && input.voidedBy),
      relatedDocumentNos: normalizeDocumentNoList(input && input.relatedDocumentNos)
    };
  }

  function copyPayable(payable) {
    const amount = positiveNumber(payable.amount) || 0;
    const paidAmount = nonNegativeNumber(payable.paidAmount) || 0;
    return {
      id: Number(payable.id), sourceType: normalizeText(payable.sourceType) || "purchase",
      sourceDocumentNo: normalizeText(payable.sourceDocumentNo), supplier: normalizeText(payable.supplier),
      amount, paidAmount, dueDate: normalizeDate(payable.dueDate),
      status: normalizeFinanceStatus(payable.status, amount, paidAmount),
      note: normalizeText(payable.note), voidReason: normalizeText(payable.voidReason),
      voidedAt: normalizeText(payable.voidedAt), voidedBy: normalizeText(payable.voidedBy),
      relatedDocumentNos: normalizeDocumentNoList(payable.relatedDocumentNos)
    };
  }

  function normalizePayment(input, id) {
    const direction = input && input.direction === "out" ? "out" : "in";
    const targetType = input && input.targetType === "payable" ? "payable" : "receivable";
    const targetId = Number(input && input.targetId);
    const amount = positiveNumber(input && input.amount);
    const date = normalizeDate(input && input.date);
    if (!targetId || amount === null || !date) { return null; }
    return { id, direction, targetType, targetId, amount, method: normalizeText(input && input.method), date, note: normalizeText(input && input.note) };
  }

  function copyPayment(payment) {
    return { id: Number(payment.id), direction: payment.direction === "out" ? "out" : "in", targetType: payment.targetType === "payable" ? "payable" : "receivable", targetId: Number(payment.targetId), amount: positiveNumber(payment.amount) || 0, method: normalizeText(payment.method), date: normalizeDate(payment.date), note: normalizeText(payment.note) };
  }

  function remainingBalance(item) {
    return (item ? item.amount || 0 : 0) - (item ? item.paidAmount || 0 : 0);
  }

  const api = {
    financeStatus, normalizeFinanceStatus,
    normalizeReceivable, copyReceivable,
    normalizePayable, copyPayable,
    normalizePayment, copyPayment,
    remainingBalance
  };

  global.ClaudeOpenStockFlowModelsFinance = api;
  if (typeof module !== "undefined") { module.exports = api; }
})(typeof window !== "undefined" ? window : globalThis);
