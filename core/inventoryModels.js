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

  // ── Purchase line ──────────────────────────────────────────────────────────

  function copyPurchaseLine(line) {
    return {
      lineId: Number(line.lineId),
      productId: Number(line.productId),
      quantity: positiveNumber(line.quantity) || 0,
      unitCost: nonNegativeNumber(line.unitCost) || 0,
      receivedQuantity: nonNegativeNumber(line.receivedQuantity) || 0
    };
  }

  // ── Sale line ──────────────────────────────────────────────────────────────

  function copySaleLine(line) {
    return {
      lineId: Number(line.lineId),
      productId: Number(line.productId),
      quantity: positiveNumber(line.quantity) || 0,
      unitPrice: nonNegativeNumber(line.unitPrice) || 0,
      shippedQuantity: nonNegativeNumber(line.shippedQuantity) || 0,
      costBasis: normalizeCostBasis(line.costBasis)
    };
  }

  // ── Document header copy helpers ──────────────────────────────────────────

  function copyDocumentHeader(doc) {
    return {
      id: Number(doc.id),
      documentNo: normalizeText(doc.documentNo),
      date: normalizeDate(doc.date),
      warehouseId: Number(doc.warehouseId) || 0,
      note: normalizeText(doc.note),
      status: normalizeDocumentStatus(doc.status),
      createdBy: normalizeText(doc.createdBy),
      ownerEmployeeId: Number(doc.ownerEmployeeId) || 0,
      ownerDepartmentId: Number(doc.ownerDepartmentId) || 0,
      createdByEmployeeId: Number(doc.createdByEmployeeId) || 0,
      lastEditedByEmployeeId: Number(doc.lastEditedByEmployeeId) || 0,
      submittedBy: normalizeText(doc.submittedBy), submittedAt: normalizeText(doc.submittedAt),
      approvedBy: normalizeText(doc.approvedBy), approvedAt: normalizeText(doc.approvedAt),
      rejectedBy: normalizeText(doc.rejectedBy), rejectedAt: normalizeText(doc.rejectedAt),
      rejectReason: normalizeText(doc.rejectReason),
      confirmedBy: normalizeText(doc.confirmedBy), confirmedAt: normalizeText(doc.confirmedAt),
      voidRequestedBy: normalizeText(doc.voidRequestedBy),
      voidRequestedAt: normalizeText(doc.voidRequestedAt),
      voidRequestReason: normalizeText(doc.voidRequestReason),
      voidReason: normalizeText(doc.voidReason),
      voidedAt: normalizeText(doc.voidedAt), voidedBy: normalizeText(doc.voidedBy),
      sourceDocumentNo: normalizeText(doc.sourceDocumentNo),
      reversalDocumentNo: normalizeText(doc.reversalDocumentNo),
      relatedDocumentNos: normalizeDocumentNoList(doc.relatedDocumentNos)
    };
  }

  function copyPurchaseDoc(doc) {
    return Object.assign(copyDocumentHeader(doc), {
      supplierId: Number(doc.supplierId) || 0,
      supplierName: normalizeText(doc.supplierName),
      createPayable: Boolean(doc.createPayable),
      dueDate: normalizeDate(doc.dueDate),
      lines: Array.isArray(doc.lines) ? doc.lines.map(copyPurchaseLine) : []
    });
  }

  function copySaleDoc(doc) {
    return Object.assign(copyDocumentHeader(doc), {
      customerId: Number(doc.customerId) || 0,
      customerName: normalizeText(doc.customerName),
      commissionStatus: normalizeText(doc.commissionStatus),
      createReceivable: Boolean(doc.createReceivable),
      dueDate: normalizeDate(doc.dueDate),
      lines: Array.isArray(doc.lines) ? doc.lines.map(copySaleLine) : []
    });
  }

  // ── Flat record → document migration helpers ──────────────────────────────

  function flatPurchaseToDoc(flat) {
    const lineId = Number(flat.id);
    const header = Object.assign(copyDocumentHeader(flat), {
      id: lineId,
      supplierId: Number(flat.supplierId) || 0,
      // support both old `supplier` and new `supplierName` field names
      supplierName: normalizeText(flat.supplierName || flat.supplier),
      createPayable: Boolean(flat.createPayable),
      dueDate: normalizeDate(flat.dueDate)
    });
    header.lines = [{
      lineId,
      productId: Number(flat.productId),
      quantity: positiveNumber(flat.quantity) || 0,
      unitCost: nonNegativeNumber(flat.unitCost) || 0,
      receivedQuantity: nonNegativeNumber(flat.receivedQuantity) || 0
    }];
    return header;
  }

  function flatSaleToDoc(flat) {
    const lineId = Number(flat.id);
    const header = Object.assign(copyDocumentHeader(flat), {
      id: lineId,
      customerId: Number(flat.customerId) || 0,
      // support both old `customer` and new `customerName` field names
      customerName: normalizeText(flat.customerName || flat.customer),
      commissionStatus: normalizeText(flat.commissionStatus),
      createReceivable: Boolean(flat.createReceivable),
      dueDate: normalizeDate(flat.dueDate)
    });
    header.lines = [{
      lineId,
      productId: Number(flat.productId),
      quantity: positiveNumber(flat.quantity) || 0,
      unitPrice: nonNegativeNumber(flat.unitPrice) || 0,
      shippedQuantity: nonNegativeNumber(flat.shippedQuantity) || 0,
      costBasis: normalizeCostBasis(flat.costBasis)
    }];
    return header;
  }

  // ── Group flat records into documents (for migration of multi-line orders) ──

  function groupFlatPurchasesToDocs(flatRecords) {
    const records = Array.isArray(flatRecords) ? flatRecords : [];
    if (!records.length) { return []; }
    // Group by documentNo (or individual if no documentNo)
    const groups = new Map();
    const order = [];
    records.forEach((record) => {
      const key = normalizeText(record.documentNo) || `__solo_${record.id}`;
      if (!groups.has(key)) { groups.set(key, []); order.push(key); }
      groups.get(key).push(record);
    });
    return order.map((key) => {
      const group = groups.get(key).slice().sort((a, b) => Number(a.id) - Number(b.id));
      const first = group[0];
      const headerId = Number(first.id);
      const header = Object.assign(copyDocumentHeader(first), {
        id: headerId,
        supplierId: Number(first.supplierId) || 0,
        supplierName: normalizeText(first.supplierName || first.supplier),
        createPayable: Boolean(first.createPayable),
        dueDate: normalizeDate(first.dueDate)
      });
      header.lines = group.map((record) => ({
        lineId: Number(record.id),
        productId: Number(record.productId),
        quantity: positiveNumber(record.quantity) || 0,
        unitCost: nonNegativeNumber(record.unitCost) || 0,
        receivedQuantity: nonNegativeNumber(record.receivedQuantity) || 0
      }));
      return header;
    });
  }

  function groupFlatSalesToDocs(flatRecords) {
    const records = Array.isArray(flatRecords) ? flatRecords : [];
    if (!records.length) { return []; }
    const groups = new Map();
    const order = [];
    records.forEach((record) => {
      const key = normalizeText(record.documentNo) || `__solo_${record.id}`;
      if (!groups.has(key)) { groups.set(key, []); order.push(key); }
      groups.get(key).push(record);
    });
    return order.map((key) => {
      const group = groups.get(key).slice().sort((a, b) => Number(a.id) - Number(b.id));
      const first = group[0];
      const headerId = Number(first.id);
      const header = Object.assign(copyDocumentHeader(first), {
        id: headerId,
        customerId: Number(first.customerId) || 0,
        customerName: normalizeText(first.customerName || first.customer),
        commissionStatus: normalizeText(first.commissionStatus),
        createReceivable: Boolean(first.createReceivable),
        dueDate: normalizeDate(first.dueDate)
      });
      header.lines = group.map((record) => ({
        lineId: Number(record.id),
        productId: Number(record.productId),
        quantity: positiveNumber(record.quantity) || 0,
        unitPrice: nonNegativeNumber(record.unitPrice) || 0,
        shippedQuantity: nonNegativeNumber(record.shippedQuantity) || 0,
        costBasis: normalizeCostBasis(record.costBasis)
      }));
      return header;
    });
  }

  // ── loadDocs: handles both flat and document arrays on init ──────────────

  function loadPurchaseDocs(items) {
    if (!Array.isArray(items) || !items.length) { return []; }
    if (Array.isArray(items[0] && items[0].lines)) {
      return items.map(copyPurchaseDoc);
    }
    // Check first item: if it has productId at top level, it's flat
    if (items[0] && items[0].productId !== undefined) {
      return groupFlatPurchasesToDocs(items);
    }
    return items.map(copyPurchaseDoc);
  }

  function loadSaleDocs(items) {
    if (!Array.isArray(items) || !items.length) { return []; }
    if (Array.isArray(items[0] && items[0].lines)) {
      return items.map(copySaleDoc);
    }
    if (items[0] && items[0].productId !== undefined) {
      return groupFlatSalesToDocs(items);
    }
    return items.map(copySaleDoc);
  }

  // ── Legacy flat-format functions (kept for migration + export name checks) ─

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
      supplierName: normalizeText(input && (input.supplierName || input.supplier)),
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
      customerName: normalizeText(input && (input.customerName || input.customer)),
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

  // copyPurchase / copySale are smart: handle both flat and document format
  function copyPurchase(item) {
    if (item && Array.isArray(item.lines)) { return copyPurchaseDoc(item); }
    return flatPurchaseToDoc(item);
  }

  function copySale(item) {
    if (item && Array.isArray(item.lines)) { return copySaleDoc(item); }
    return flatSaleToDoc(item);
  }

  // ── Other transaction models (unchanged) ──────────────────────────────────

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
      copyPurchaseDoc, copySaleDoc, copyPurchaseLine, copySaleLine,
      flatPurchaseToDoc, flatSaleToDoc,
      loadPurchaseDocs, loadSaleDocs,
      groupFlatPurchasesToDocs, groupFlatSalesToDocs,
      defaultPreferences, normalizePreferences,
      defaultWarehouse, ensureWarehouseOnRow,
      normalizeDocumentStatus, normalizeDocumentNoList
    }
  );

  global.OpenStockFlowModels = api;
  if (typeof module !== "undefined") { module.exports = api; }
})(typeof window !== "undefined" ? window : globalThis);
