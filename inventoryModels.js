(function (global) {
  const utils = global.OpenStockFlowUtils || (typeof require !== "undefined" ? require("./inventoryUtils") : {});
  const { normalizeText, positiveNumber, nonNegativeNumber, normalizeDate } = utils;

  const master = global.OpenStockFlowModelsMaster || (typeof require !== "undefined" ? require("./inventoryModelsMaster") : {});
  const finance = global.OpenStockFlowModelsFinance || (typeof require !== "undefined" ? require("./inventoryModelsFinance") : {});

  // ── Shared document utilities ────────────────────────────────────────────────

  function normalizeDocumentStatus(status) {
    const value = normalizeText(status);
    return ["draft", "submitted", "approved", "rejected", "confirmed", "amended", "voidRequested", "voided", "reversed"].includes(value) ? value : "confirmed";
  }

  function normalizeDocumentNoList(value) {
    if (!Array.isArray(value)) { return []; }
    return value.map(normalizeText).filter(Boolean);
  }

  function normalizeCostBasis(value) {
    const basis = value && typeof value === "object" ? value : {};
    const unitCost = nonNegativeNumber(basis.unitCost);
    const totalCost = nonNegativeNumber(basis.totalCost);
    const quantity = positiveNumber(basis.quantity);
    if (unitCost === null && totalCost === null) { return null; }
    return {
      method: normalizeText(basis.method) || "standardCost",
      unitCost: unitCost === null ? 0 : unitCost,
      quantity: quantity === null ? 0 : quantity,
      totalCost: totalCost === null ? (unitCost || 0) * (quantity || 0) : totalCost,
      source: normalizeText(basis.source) || "productCost",
      capturedAt: normalizeText(basis.capturedAt)
    };
  }

  // ── Transaction models ───────────────────────────────────────────────────────

  function normalizePurchase(input, id) {
    const productId = Number(input && input.productId);
    const quantity = positiveNumber(input && input.quantity);
    const unitCost = nonNegativeNumber(input && input.unitCost);
    const date = normalizeDate(input && input.date);
    if (!productId || quantity === null || unitCost === null || !date) { return null; }
    return {
      id, productId,
      warehouseId: Number(input && input.warehouseId) || 0,
      supplierId: Number(input && input.supplierId) || 0,
      quantity, unitCost,
      supplier: normalizeText(input && input.supplier),
      date, note: normalizeText(input && input.note),
      documentNo: normalizeText(input && input.documentNo),
      status: normalizeDocumentStatus(input && input.status),
      createPayable: Boolean(input && input.createPayable),
      dueDate: normalizeDate(input && input.dueDate),
      createdBy: normalizeText(input && input.createdBy),
      ownerEmployeeId: Number(input && input.ownerEmployeeId) || 0,
      ownerDepartmentId: Number(input && input.ownerDepartmentId) || 0,
      createdByEmployeeId: Number(input && input.createdByEmployeeId) || 0,
      lastEditedByEmployeeId: Number(input && input.lastEditedByEmployeeId) || 0,
      submittedBy: normalizeText(input && input.submittedBy),
      submittedAt: normalizeText(input && input.submittedAt),
      approvedBy: normalizeText(input && input.approvedBy),
      approvedAt: normalizeText(input && input.approvedAt),
      rejectedBy: normalizeText(input && input.rejectedBy),
      rejectedAt: normalizeText(input && input.rejectedAt),
      rejectReason: normalizeText(input && input.rejectReason),
      confirmedBy: normalizeText(input && input.confirmedBy),
      confirmedAt: normalizeText(input && input.confirmedAt),
      voidRequestedBy: normalizeText(input && input.voidRequestedBy),
      voidRequestedAt: normalizeText(input && input.voidRequestedAt),
      voidRequestReason: normalizeText(input && input.voidRequestReason),
      receivedQuantity: nonNegativeNumber(input && input.receivedQuantity) || 0
    };
  }

  function normalizeSale(input, id) {
    const productId = Number(input && input.productId);
    const quantity = positiveNumber(input && input.quantity);
    const unitPrice = nonNegativeNumber(input && input.unitPrice);
    const date = normalizeDate(input && input.date);
    if (!productId || quantity === null || unitPrice === null || !date) { return null; }
    return {
      id, productId,
      warehouseId: Number(input && input.warehouseId) || 0,
      customerId: Number(input && input.customerId) || 0,
      quantity, unitPrice,
      customer: normalizeText(input && input.customer),
      date, note: normalizeText(input && input.note),
      documentNo: normalizeText(input && input.documentNo),
      status: normalizeDocumentStatus(input && input.status),
      costBasis: normalizeCostBasis(input && input.costBasis),
      createReceivable: Boolean(input && input.createReceivable),
      dueDate: normalizeDate(input && input.dueDate),
      createdBy: normalizeText(input && input.createdBy),
      ownerEmployeeId: Number(input && input.ownerEmployeeId) || 0,
      ownerDepartmentId: Number(input && input.ownerDepartmentId) || 0,
      createdByEmployeeId: Number(input && input.createdByEmployeeId) || 0,
      lastEditedByEmployeeId: Number(input && input.lastEditedByEmployeeId) || 0,
      submittedBy: normalizeText(input && input.submittedBy),
      submittedAt: normalizeText(input && input.submittedAt),
      approvedBy: normalizeText(input && input.approvedBy),
      approvedAt: normalizeText(input && input.approvedAt),
      rejectedBy: normalizeText(input && input.rejectedBy),
      rejectedAt: normalizeText(input && input.rejectedAt),
      rejectReason: normalizeText(input && input.rejectReason),
      confirmedBy: normalizeText(input && input.confirmedBy),
      confirmedAt: normalizeText(input && input.confirmedAt),
      voidRequestedBy: normalizeText(input && input.voidRequestedBy),
      voidRequestedAt: normalizeText(input && input.voidRequestedAt),
      voidRequestReason: normalizeText(input && input.voidRequestReason),
      shippedQuantity: nonNegativeNumber(input && input.shippedQuantity) || 0,
      commissionStatus: normalizeText(input && input.commissionStatus)
    };
  }

  function normalizeAdjustment(input, id) {
    const productId = Number(input && input.productId);
    const quantity = Math.round(Number(input && input.quantity));
    const date = normalizeDate(input && input.date);
    if (!productId || !Number.isFinite(quantity) || quantity === 0 || !date) { return null; }
    return {
      id, productId,
      warehouseId: Number(input && input.warehouseId) || 0,
      quantity, reason: normalizeText(input && input.reason) || "調整",
      date, note: normalizeText(input && input.note),
      documentNo: normalizeText(input && input.documentNo),
      status: normalizeDocumentStatus(input && input.status),
      createdBy: normalizeText(input && input.createdBy),
      createdByEmployeeId: Number(input && input.createdByEmployeeId) || 0
    };
  }

  function normalizeTransfer(input, id) {
    const productId = Number(input && input.productId);
    const fromWarehouseId = Number(input && input.fromWarehouseId);
    const toWarehouseId = Number(input && input.toWarehouseId);
    const quantity = positiveNumber(input && input.quantity);
    const date = normalizeDate(input && input.date);
    if (!productId || !fromWarehouseId || !toWarehouseId || fromWarehouseId === toWarehouseId || quantity === null || !date) { return null; }
    return {
      id, productId, fromWarehouseId, toWarehouseId, quantity, date,
      note: normalizeText(input && input.note),
      documentNo: normalizeText(input && input.documentNo),
      status: normalizeDocumentStatus(input && input.status),
      createdBy: normalizeText(input && input.createdBy),
      createdByEmployeeId: Number(input && input.createdByEmployeeId) || 0
    };
  }

  function normalizeReturn(input, id) {
    const documentType = normalizeText(input && input.documentType);
    const productId = Number(input && input.productId);
    const warehouseId = Number(input && input.warehouseId);
    const quantity = positiveNumber(input && input.quantity);
    const unitPrice = nonNegativeNumber(input && input.unitPrice) !== null
      ? nonNegativeNumber(input && input.unitPrice)
      : nonNegativeNumber(input && input.unitAmount);
    const date = normalizeDate(input && input.date);
    if (!["salesReturn", "purchaseReturn"].includes(documentType) || !productId || !warehouseId || quantity === null || unitPrice === null || !date) { return null; }
    return {
      id, documentType,
      documentNo: normalizeText(input && input.documentNo),
      sourceDocumentNo: normalizeText(input && input.sourceDocumentNo),
      sourceLineId: Number(input && input.sourceLineId) || 0,
      productId, warehouseId, quantity, unitPrice,
      costBasis: normalizeCostBasis(input && input.costBasis),
      reason: normalizeText(input && input.reason), date,
      inspectionStatus: normalizeText(input && input.inspectionStatus) || "accepted",
      createdBy: normalizeText(input && input.createdBy),
      confirmedBy: normalizeText(input && input.confirmedBy),
      relatedDocumentNos: normalizeDocumentNoList(input && input.relatedDocumentNos),
      status: normalizeDocumentStatus(input && input.status)
    };
  }

  function copyPurchase(purchase) {
    return {
      id: Number(purchase.id), productId: Number(purchase.productId),
      warehouseId: Number(purchase.warehouseId) || 0,
      supplierId: Number(purchase.supplierId) || 0,
      quantity: positiveNumber(purchase.quantity) || 0,
      unitCost: nonNegativeNumber(purchase.unitCost) || 0,
      supplier: normalizeText(purchase.supplier), date: normalizeDate(purchase.date),
      note: normalizeText(purchase.note), documentNo: normalizeText(purchase.documentNo),
      status: normalizeDocumentStatus(purchase.status),
      createPayable: Boolean(purchase.createPayable), dueDate: normalizeDate(purchase.dueDate),
      createdBy: normalizeText(purchase.createdBy),
      ownerEmployeeId: Number(purchase.ownerEmployeeId) || 0,
      ownerDepartmentId: Number(purchase.ownerDepartmentId) || 0,
      createdByEmployeeId: Number(purchase.createdByEmployeeId) || 0,
      lastEditedByEmployeeId: Number(purchase.lastEditedByEmployeeId) || 0,
      submittedBy: normalizeText(purchase.submittedBy), submittedAt: normalizeText(purchase.submittedAt),
      approvedBy: normalizeText(purchase.approvedBy), approvedAt: normalizeText(purchase.approvedAt),
      rejectedBy: normalizeText(purchase.rejectedBy), rejectedAt: normalizeText(purchase.rejectedAt),
      rejectReason: normalizeText(purchase.rejectReason),
      confirmedBy: normalizeText(purchase.confirmedBy), confirmedAt: normalizeText(purchase.confirmedAt),
      voidRequestedBy: normalizeText(purchase.voidRequestedBy),
      voidRequestedAt: normalizeText(purchase.voidRequestedAt),
      voidRequestReason: normalizeText(purchase.voidRequestReason),
      voidReason: normalizeText(purchase.voidReason),
      voidedAt: normalizeText(purchase.voidedAt), voidedBy: normalizeText(purchase.voidedBy),
      sourceDocumentNo: normalizeText(purchase.sourceDocumentNo),
      reversalDocumentNo: normalizeText(purchase.reversalDocumentNo),
      relatedDocumentNos: normalizeDocumentNoList(purchase.relatedDocumentNos)
    };
  }

  function copySale(sale) {
    return {
      id: Number(sale.id), productId: Number(sale.productId),
      warehouseId: Number(sale.warehouseId) || 0,
      customerId: Number(sale.customerId) || 0,
      quantity: positiveNumber(sale.quantity) || 0,
      unitPrice: nonNegativeNumber(sale.unitPrice) || 0,
      customer: normalizeText(sale.customer), date: normalizeDate(sale.date),
      note: normalizeText(sale.note), documentNo: normalizeText(sale.documentNo),
      status: normalizeDocumentStatus(sale.status),
      costBasis: normalizeCostBasis(sale.costBasis),
      createReceivable: Boolean(sale.createReceivable), dueDate: normalizeDate(sale.dueDate),
      createdBy: normalizeText(sale.createdBy),
      ownerEmployeeId: Number(sale.ownerEmployeeId) || 0,
      ownerDepartmentId: Number(sale.ownerDepartmentId) || 0,
      createdByEmployeeId: Number(sale.createdByEmployeeId) || 0,
      lastEditedByEmployeeId: Number(sale.lastEditedByEmployeeId) || 0,
      submittedBy: normalizeText(sale.submittedBy), submittedAt: normalizeText(sale.submittedAt),
      approvedBy: normalizeText(sale.approvedBy), approvedAt: normalizeText(sale.approvedAt),
      rejectedBy: normalizeText(sale.rejectedBy), rejectedAt: normalizeText(sale.rejectedAt),
      rejectReason: normalizeText(sale.rejectReason),
      confirmedBy: normalizeText(sale.confirmedBy), confirmedAt: normalizeText(sale.confirmedAt),
      voidRequestedBy: normalizeText(sale.voidRequestedBy),
      voidRequestedAt: normalizeText(sale.voidRequestedAt),
      voidRequestReason: normalizeText(sale.voidRequestReason),
      voidReason: normalizeText(sale.voidReason),
      voidedAt: normalizeText(sale.voidedAt), voidedBy: normalizeText(sale.voidedBy),
      sourceDocumentNo: normalizeText(sale.sourceDocumentNo),
      reversalDocumentNo: normalizeText(sale.reversalDocumentNo),
      relatedDocumentNos: normalizeDocumentNoList(sale.relatedDocumentNos)
    };
  }

  function copyAdjustment(adjustment) {
    return {
      id: Number(adjustment.id), productId: Number(adjustment.productId),
      warehouseId: Number(adjustment.warehouseId) || 0,
      quantity: Math.round(Number(adjustment.quantity)) || 0,
      reason: normalizeText(adjustment.reason) || "調整",
      date: normalizeDate(adjustment.date), note: normalizeText(adjustment.note),
      documentNo: normalizeText(adjustment.documentNo)
    };
  }

  function copyTransfer(transfer) {
    return {
      id: Number(transfer.id), productId: Number(transfer.productId),
      fromWarehouseId: Number(transfer.fromWarehouseId),
      toWarehouseId: Number(transfer.toWarehouseId),
      quantity: positiveNumber(transfer.quantity) || 0,
      date: normalizeDate(transfer.date), note: normalizeText(transfer.note),
      documentNo: normalizeText(transfer.documentNo)
    };
  }

  function copyReturn(returnRow) {
    return {
      id: Number(returnRow.id),
      documentType: normalizeText(returnRow.documentType) === "purchaseReturn" ? "purchaseReturn" : "salesReturn",
      documentNo: normalizeText(returnRow.documentNo),
      sourceDocumentNo: normalizeText(returnRow.sourceDocumentNo),
      sourceLineId: Number(returnRow.sourceLineId) || 0,
      productId: Number(returnRow.productId), warehouseId: Number(returnRow.warehouseId) || 0,
      quantity: positiveNumber(returnRow.quantity) || 0,
      unitPrice: nonNegativeNumber(returnRow.unitPrice !== undefined ? returnRow.unitPrice : returnRow.unitAmount) || 0,
      costBasis: normalizeCostBasis(returnRow.costBasis),
      reason: normalizeText(returnRow.reason), date: normalizeDate(returnRow.date),
      inspectionStatus: normalizeText(returnRow.inspectionStatus) || "accepted",
      createdBy: normalizeText(returnRow.createdBy), confirmedBy: normalizeText(returnRow.confirmedBy),
      relatedDocumentNos: normalizeDocumentNoList(returnRow.relatedDocumentNos),
      status: normalizeDocumentStatus(returnRow.status)
    };
  }

  // ── Preferences ──────────────────────────────────────────────────────────────

  function defaultPreferences() {
    return { locale: "zh-Hant-TW", interfaceLanguage: "zh-Hant", quantityDecimals: 0, moneyDecimals: 0, thousandsSeparator: ",", decimalSeparator: ".", currencyCode: "TWD", currencySymbol: "$", currencyPosition: "prefix", reportTitle: "OpenStockFlow 營運報表", reportHeaderText: "OpenStockFlow", reportFooterText: "", showPrintDate: true, dateFormat: "YYYY-MM-DD" };
  }

  function normalizePreferences(input) {
    const defaults = defaultPreferences();
    const quantityDecimals = nonNegativeNumber(input && input.quantityDecimals);
    const moneyDecimals = nonNegativeNumber(input && input.moneyDecimals);
    const thousandsSeparator = normalizeText(input && input.thousandsSeparator);
    const decimalSeparator = normalizeText(input && input.decimalSeparator);
    const currencyPosition = normalizeText(input && input.currencyPosition);
    return {
      locale: normalizeText(input && input.locale) || defaults.locale,
      interfaceLanguage: normalizeText(input && input.interfaceLanguage) || defaults.interfaceLanguage,
      quantityDecimals: Math.min(6, Math.round(quantityDecimals === null ? defaults.quantityDecimals : quantityDecimals)),
      moneyDecimals: Math.min(6, Math.round(moneyDecimals === null ? defaults.moneyDecimals : moneyDecimals)),
      thousandsSeparator: thousandsSeparator || defaults.thousandsSeparator,
      decimalSeparator: decimalSeparator || defaults.decimalSeparator,
      currencyCode: normalizeText(input && input.currencyCode) || defaults.currencyCode,
      currencySymbol: normalizeText(input && input.currencySymbol) || defaults.currencySymbol,
      currencyPosition: currencyPosition === "suffix" ? "suffix" : defaults.currencyPosition,
      reportTitle: normalizeText(input && input.reportTitle) || defaults.reportTitle,
      reportHeaderText: normalizeText(input && input.reportHeaderText) || defaults.reportHeaderText,
      reportFooterText: normalizeText(input && input.reportFooterText),
      showPrintDate: input && input.showPrintDate === false ? false : true,
      dateFormat: normalizeText(input && input.dateFormat) || defaults.dateFormat
    };
  }

  function defaultWarehouse() {
    return { id: 1, code: "MAIN", name: "主倉", type: "warehouse", note: "預設倉庫", active: true };
  }

  function ensureWarehouseOnRow(row, warehouseId) {
    return Object.assign({}, row, { warehouseId: Number(row && row.warehouseId) || warehouseId });
  }

  // ── Combined export ───────────────────────────────────────────────────────────

  const api = Object.assign(
    {},
    master,
    finance,
    {
      normalizePurchase, normalizeSale, normalizeAdjustment, normalizeTransfer, normalizeReturn,
      copyPurchase, copySale, copyAdjustment, copyTransfer, copyReturn,
      defaultPreferences, normalizePreferences,
      defaultWarehouse, ensureWarehouseOnRow,
      normalizeDocumentStatus, normalizeDocumentNoList
    }
  );

  global.OpenStockFlowModels = api;
  if (typeof module !== "undefined") { module.exports = api; }
})(typeof window !== "undefined" ? window : globalThis);
