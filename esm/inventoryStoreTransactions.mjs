import {
  normalizePurchase, normalizeSale,
  normalizeAdjustment, copyAdjustment,
  normalizeTransfer, copyTransfer,
  normalizeReturn, copyReturn,
  copyPurchaseDoc, copyPurchaseLine,
  copySaleDoc, copySaleLine
} from "./inventoryModels.mjs";

function createTransactionsModule(ctx) {
  const {
    getPurchases, setPurchases,
    getSales, setSales,
    getAdjustments, setAdjustments,
    getTransfers, setTransfers,
    getReturns, setReturns,
    getCostLayers, setCostLayers,
    nextPurchaseId, incNextPurchaseId,
    nextSaleId, incNextSaleId,
    nextAdjustmentId, incNextAdjustmentId,
    nextTransferId, incNextTransferId,
    nextReturnId, incNextReturnId,
    nextCostLayerId, incNextCostLayerId,
    findProduct,
    findPartner,
    findWarehouse,
    resolveActiveWarehouse,
    stockForProduct,
    setProductsCost,
    addPayable,
    addReceivable,
    reducePayableForReturn,
    reduceReceivableForReturn,
    voidPayablesForDocument,
    voidReceivablesForDocument,
    hasReceivableForDocument,
    hasPayableForDocument,
    isDocumentEffective,
    isVoidedDocument,
    createVoidInfo,
    sameDocument,
    appendNote,
    mergeDocumentNos,
    normalizeDocumentStatus,
    transitionDocumentRows,
    updateDocumentOwnerRows,
    nextDocumentNo
  } = ctx;

  function resolvePartnerName(partnerId, role, fallbackName) {
    if (!partnerId) return normalizeText(fallbackName);
    const partner = findPartner(partnerId);
    if (partner && partner.role === role && partner.active) return partner.name;
    return normalizeText(fallbackName);
  }

  function normalizeText(value) {
    return String(value || "").trim();
  }

  function positiveNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : null;
  }

  function nonNegativeNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : null;
  }

  function normalizeDate(value) {
    const date = normalizeText(value);
    return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
  }

  function todayString() {
    return new Date().toISOString().slice(0, 10);
  }

  function normalizeOrderItems(items, priceField) {
    if (!Array.isArray(items)) return [];
    return items.map((item) => {
      const productId = Number(item && item.productId);
      const quantity = positiveNumber(item && item.quantity);
      const price = nonNegativeNumber(item && item[priceField]);
      if (!productId || quantity === null || price === null) return null;
      return { productId, quantity, [priceField]: price };
    }).filter(Boolean);
  }

  function copyCostLayer(layer) {
    return {
      id: Number(layer.id),
      method: normalizeText(layer.method) || "standardCost",
      sourceType: normalizeText(layer.sourceType) || "purchase",
      sourceDocumentNo: normalizeText(layer.sourceDocumentNo),
      sourceLineId: Number(layer.sourceLineId) || 0,
      productId: Number(layer.productId),
      warehouseId: Number(layer.warehouseId) || 0,
      quantity: positiveNumber(layer.quantity) || 0,
      remainingQuantity: nonNegativeNumber(layer.remainingQuantity) || 0,
      unitCost: nonNegativeNumber(layer.unitCost) || 0,
      date: normalizeDate(layer.date),
      createdAt: normalizeText(layer.createdAt)
    };
  }

  function ensureCostLayerForLine(doc, line) {
    if (!doc || !isDocumentEffective(doc)) return;
    if (getCostLayers().some((layer) =>
      layer.sourceLineId === line.lineId && layer.sourceDocumentNo === doc.documentNo)) {
      return;
    }
    setCostLayers([{
      id: nextCostLayerId(),
      method: "standardCost",
      sourceType: "purchase",
      sourceDocumentNo: doc.documentNo,
      sourceLineId: line.lineId,
      productId: line.productId,
      warehouseId: doc.warehouseId,
      quantity: line.quantity,
      remainingQuantity: line.quantity,
      unitCost: line.unitCost,
      date: doc.date,
      createdAt: new Date().toISOString()
    }].concat(getCostLayers()));
    incNextCostLayerId();
  }

  function consumeCostLayers(productId, warehouseId, quantity) {
    let toConsume = quantity;
    setCostLayers(getCostLayers().slice().reverse().map((layer) => {
      if (layer.productId !== Number(productId) || layer.warehouseId !== Number(warehouseId) || toConsume <= 0) {
        return layer;
      }
      const consumed = Math.min(layer.remainingQuantity, toConsume);
      toConsume -= consumed;
      return Object.assign({}, layer, { remainingQuantity: layer.remainingQuantity - consumed });
    }).reverse());
  }

  function createCostBasis(productId, quantity, capturedAt) {
    const product = findProduct(productId);
    const unitCost = product ? product.cost : 0;
    const normalizedQuantity = positiveNumber(quantity) || 0;
    return {
      method: "standardCost",
      unitCost,
      quantity: normalizedQuantity,
      totalCost: unitCost * normalizedQuantity,
      source: "productCost",
      capturedAt: capturedAt || new Date().toISOString()
    };
  }

  function returnedQuantityForSource(documentType, sourceLineId) {
    return getReturns()
      .filter((returnRow) => returnRow.documentType === documentType &&
        returnRow.sourceLineId === Number(sourceLineId) &&
        isDocumentEffective(returnRow))
      .reduce((sum, returnRow) => sum + returnRow.quantity, 0);
  }

  function applyPurchaseOrderEffects(doc) {
    if (!doc || !isDocumentEffective(doc) || !Array.isArray(doc.lines)) return;
    if (doc.createPayable && !hasPayableForDocument(doc.documentNo)) {
      addPayable({
        sourceType: "purchase",
        sourceDocumentNo: doc.documentNo,
        supplier: doc.supplierName,
        amount: doc.lines.reduce((sum, line) => sum + line.quantity * line.unitCost, 0),
        paidAmount: 0,
        dueDate: doc.dueDate || doc.date,
        note: doc.note
      });
    }
    doc.lines.forEach((line) => ensureCostLayerForLine(doc, line));
    doc.lines.forEach((line) => { setProductsCost(line.productId, line.unitCost); });
  }

  function applySaleOrderEffects(doc) {
    if (!doc || !isDocumentEffective(doc) || !Array.isArray(doc.lines)) return;
    if (doc.createReceivable && !hasReceivableForDocument(doc.documentNo)) {
      addReceivable({
        sourceType: "sale",
        sourceDocumentNo: doc.documentNo,
        customer: doc.customerName,
        amount: doc.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0),
        paidAmount: 0,
        dueDate: doc.dueDate || doc.date,
        note: doc.note
      });
    }
  }

  function buildDocumentHeader(input, documentNo, date, warehouseId, status) {
    const ownerEmployeeId = Number(input && input.ownerEmployeeId) || 0;
    return {
      documentNo,
      date,
      warehouseId,
      note: normalizeText(input && input.note),
      status,
      createdBy: normalizeText(input && input.createdBy),
      ownerEmployeeId,
      ownerDepartmentId: Number(input && input.ownerDepartmentId) || 0,
      createdByEmployeeId: Number(input && input.createdByEmployeeId) || ownerEmployeeId,
      lastEditedByEmployeeId: Number(input && input.lastEditedByEmployeeId) || 0,
      submittedBy: "", submittedAt: "", approvedBy: "", approvedAt: "",
      rejectedBy: "", rejectedAt: "", rejectReason: "",
      confirmedBy: "", confirmedAt: "",
      voidRequestedBy: "", voidRequestedAt: "", voidRequestReason: "",
      voidReason: "", voidedAt: "", voidedBy: "",
      sourceDocumentNo: "", reversalDocumentNo: "",
      relatedDocumentNos: []
    };
  }

  function findDocByLineId(docs, lineId) {
    const id = Number(lineId);
    return docs.find((doc) =>
      doc.id === id ||
      (Array.isArray(doc.lines) && doc.lines.some((l) => l.lineId === id))
    ) || null;
  }

  function addPurchase(input) {
    const flat = normalizePurchase(input, nextPurchaseId());
    const product = findProduct(flat && flat.productId);
    const warehouse = resolveActiveWarehouse(flat && flat.warehouseId);
    if (!flat || !product || !product.active || !warehouse) return null;
    const lineId = flat.id;
    const documentNo = flat.documentNo || `PUR-${lineId}`;
    const supplierId = Number(input && input.supplierId) || 0;
    const doc = Object.assign(buildDocumentHeader(input, documentNo, flat.date, warehouse.id, flat.status || "confirmed"), {
      id: lineId,
      supplierId,
      supplierName: resolvePartnerName(supplierId, "supplier", flat.supplierName),
      createPayable: Boolean(input && input.createPayable),
      dueDate: flat.dueDate || flat.date,
      lines: [{
        lineId,
        productId: flat.productId,
        quantity: flat.quantity,
        unitCost: flat.unitCost,
        receivedQuantity: flat.receivedQuantity || 0
      }]
    });
    incNextPurchaseId();
    setPurchases([doc].concat(getPurchases()));
    if (isDocumentEffective(doc)) {
      applyPurchaseOrderEffects(doc);
    } else if (doc.createPayable) {
      addPayable({
        sourceType: "purchase",
        sourceDocumentNo: doc.documentNo,
        supplier: doc.supplierName,
        amount: doc.lines[0].quantity * doc.lines[0].unitCost,
        paidAmount: 0,
        dueDate: doc.dueDate || doc.date,
        note: doc.note
      });
    }
    return copyPurchaseDoc(doc);
  }

  function addPurchaseOrder(input) {
    const date = normalizeDate(input && input.date);
    const items = normalizeOrderItems(input && input.items, "unitCost");
    const warehouse = resolveActiveWarehouse(input && input.warehouseId);
    if (!date || !items.length || !warehouse) return null;
    if (items.some((item) => {
      const product = findProduct(item.productId);
      return !product || !product.active;
    })) return null;
    const documentNo = normalizeText(input && input.documentNo) || nextDocumentNo("PO", date, getPurchases());
    const status = normalizeDocumentStatus(input && input.status);
    const supplierId = Number(input && input.supplierId) || 0;
    const lines = items.map((item) => {
      const lineId = nextPurchaseId();
      incNextPurchaseId();
      return { lineId, productId: item.productId, quantity: item.quantity, unitCost: item.unitCost, receivedQuantity: 0 };
    });
    const headerId = lines[0].lineId;
    const doc = Object.assign(buildDocumentHeader(input, documentNo, date, warehouse.id, status), {
      id: headerId,
      supplierId,
      supplierName: resolvePartnerName(supplierId, "supplier", normalizeText(input && (input.supplierName || input.supplier))),
      createPayable: Boolean(input && input.createPayable),
      dueDate: normalizeDate(input && input.dueDate) || date,
      lines
    });
    setPurchases([doc].concat(getPurchases()));
    if (isDocumentEffective(doc)) {
      applyPurchaseOrderEffects(doc);
    }
    return copyPurchaseDoc(doc);
  }

  function addSale(input) {
    const flat = normalizeSale(input, nextSaleId());
    const product = findProduct(flat && flat.productId);
    const warehouse = resolveActiveWarehouse(flat && flat.warehouseId);
    if (!flat || !product || !product.active || !warehouse) return null;
    if (stockForProduct(flat.productId, warehouse.id).onHand < flat.quantity) {
      return { error: "INSUFFICIENT_STOCK" };
    }
    const lineId = flat.id;
    const documentNo = flat.documentNo || `SAL-${lineId}`;
    const customerId = Number(input && input.customerId) || 0;
    const doc = Object.assign(buildDocumentHeader(input, documentNo, flat.date, warehouse.id, flat.status || "confirmed"), {
      id: lineId,
      customerId,
      customerName: resolvePartnerName(customerId, "customer", flat.customerName),
      commissionStatus: flat.commissionStatus || "",
      createReceivable: Boolean(input && input.createReceivable),
      dueDate: flat.dueDate || flat.date,
      lines: [{
        lineId,
        productId: flat.productId,
        quantity: flat.quantity,
        unitPrice: flat.unitPrice,
        shippedQuantity: flat.shippedQuantity || 0,
        costBasis: createCostBasis(flat.productId, flat.quantity)
      }]
    });
    incNextSaleId();
    setSales([doc].concat(getSales()));
    if (isDocumentEffective(doc)) {
      consumeCostLayers(flat.productId, warehouse.id, flat.quantity);
      if (doc.createReceivable && !hasReceivableForDocument(doc.documentNo)) {
        addReceivable({
          sourceType: "sale",
          sourceDocumentNo: doc.documentNo,
          customer: doc.customerName,
          amount: flat.quantity * flat.unitPrice,
          paidAmount: 0,
          dueDate: doc.dueDate || doc.date,
          note: doc.note
        });
      }
    }
    return copySaleDoc(doc);
  }

  function addSaleOrder(input) {
    const date = normalizeDate(input && input.date);
    const items = normalizeOrderItems(input && input.items, "unitPrice");
    const warehouse = resolveActiveWarehouse(input && input.warehouseId);
    if (!date || !items.length || !warehouse) return null;
    if (items.some((item) => {
      const product = findProduct(item.productId);
      return !product || !product.active;
    })) return null;
    const requestedByProduct = new Map();
    items.forEach((item) => {
      requestedByProduct.set(item.productId, (requestedByProduct.get(item.productId) || 0) + item.quantity);
    });
    for (const [productId, quantity] of requestedByProduct.entries()) {
      if (stockForProduct(productId, warehouse.id).onHand < quantity) {
        return { error: "INSUFFICIENT_STOCK" };
      }
    }
    const documentNo = normalizeText(input && input.documentNo) || nextDocumentNo("SO", date, getSales());
    const status = normalizeDocumentStatus(input && input.status);
    const customerId = Number(input && input.customerId) || 0;
    const lines = items.map((item) => {
      const lineId = nextSaleId();
      incNextSaleId();
      return {
        lineId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        shippedQuantity: 0,
        costBasis: createCostBasis(item.productId, item.quantity)
      };
    });
    const headerId = lines[0].lineId;
    const doc = Object.assign(buildDocumentHeader(input, documentNo, date, warehouse.id, status), {
      id: headerId,
      customerId,
      customerName: resolvePartnerName(customerId, "customer", normalizeText(input && (input.customerName || input.customer))),
      commissionStatus: normalizeText(input && input.commissionStatus),
      createReceivable: Boolean(input && input.createReceivable),
      dueDate: normalizeDate(input && input.dueDate) || date,
      lines
    });
    setSales([doc].concat(getSales()));
    if (isDocumentEffective(doc)) {
      doc.lines.forEach((line) => consumeCostLayers(line.productId, warehouse.id, line.quantity));
      applySaleOrderEffects(doc);
    }
    return copySaleDoc(doc);
  }

  function removePurchase(id, options) {
    const doc = findDocByLineId(getPurchases(), id);
    if (!doc) return false;
    if (isVoidedDocument(doc)) return true;
    if (isDocumentEffective(doc)) {
      for (const line of doc.lines) {
        const currentStock = stockForProduct(line.productId, doc.warehouseId).onHand;
        if (currentStock - line.quantity < 0) {
          return { error: "NEGATIVE_STOCK" };
        }
      }
    }
    const voidInfo = createVoidInfo(options);
    setPurchases(getPurchases().map((item) => item.id === doc.id
      ? Object.assign({}, item, voidInfo, {
        sourceDocumentNo: item.sourceDocumentNo || item.documentNo,
        relatedDocumentNos: mergeDocumentNos(item.relatedDocumentNos, [item.documentNo])
      }) : item));
    voidPayablesForDocument(doc.documentNo, voidInfo);
    setCostLayers(getCostLayers().map((layer) =>
      layer.sourceDocumentNo === doc.documentNo
        ? Object.assign({}, layer, { remainingQuantity: 0 })
        : layer
    ));
    const latestEffectivePurchase = getPurchases().find(
      (d) => Array.isArray(d.lines) && d.lines.some((l) => l.productId === doc.lines[0].productId) && isDocumentEffective(d)
    );
    if (latestEffectivePurchase) {
      const latestLine = latestEffectivePurchase.lines.find((l) => l.productId === doc.lines[0].productId);
      if (latestLine) setProductsCost(doc.lines[0].productId, latestLine.unitCost);
    }
    return true;
  }

  function removeSale(id, options) {
    const doc = findDocByLineId(getSales(), id);
    if (!doc) return false;
    if (isVoidedDocument(doc)) return true;
    const voidInfo = createVoidInfo(options);
    setSales(getSales().map((item) => item.id === doc.id
      ? Object.assign({}, item, voidInfo, {
        sourceDocumentNo: item.sourceDocumentNo || item.documentNo,
        relatedDocumentNos: mergeDocumentNos(item.relatedDocumentNos, [item.documentNo]),
        commissionStatus: item.commissionStatus ? "voided" : item.commissionStatus
      }) : item));
    voidReceivablesForDocument(doc.documentNo, voidInfo);
    return true;
  }

  function transitionPurchase(id, action, options) {
    const doc = findDocByLineId(getPurchases(), id);
    if (!doc) return false;
    const result = transitionDocumentRows(getPurchases(), doc.documentNo, doc.id, action, options);
    if (!result || result.error) return result;
    setPurchases(result.rows);
    if (action === "confirm") {
      const confirmedDoc = getPurchases().find((d) => d.id === doc.id);
      if (confirmedDoc) applyPurchaseOrderEffects(confirmedDoc);
    }
    return result.lines.map(copyPurchaseDoc);
  }

  function transitionSale(id, action, options) {
    const doc = findDocByLineId(getSales(), id);
    if (!doc) return false;
    if (action === "confirm") {
      const requestedByProductWarehouse = new Map();
      doc.lines.forEach((line) => {
        const key = `${line.productId}:${doc.warehouseId}`;
        requestedByProductWarehouse.set(key, (requestedByProductWarehouse.get(key) || 0) + line.quantity);
      });
      for (const [key, quantity] of requestedByProductWarehouse.entries()) {
        const [productId, warehouseId] = key.split(":").map(Number);
        if (stockForProduct(productId, warehouseId).onHand < quantity) {
          return { error: "INSUFFICIENT_STOCK" };
        }
      }
    }
    const result = transitionDocumentRows(getSales(), doc.documentNo, doc.id, action, options);
    if (!result || result.error) return result;
    setSales(result.rows);
    if (action === "confirm") {
      const now = new Date().toISOString();
      setSales(getSales().map((d) => {
        if (d.id !== doc.id) return d;
        return Object.assign({}, d, {
          lines: d.lines.map((line) =>
            Object.assign({}, line, { costBasis: createCostBasis(line.productId, line.quantity, now) })
          )
        });
      }));
      const confirmedDoc = getSales().find((d) => d.id === doc.id);
      if (confirmedDoc) applySaleOrderEffects(confirmedDoc);
    }
    return result.lines.map(copySaleDoc);
  }

  function updatePurchaseOwner(id, input) {
    const doc = findDocByLineId(getPurchases(), id);
    if (!doc) return false;
    const result = updateDocumentOwnerRows(getPurchases(), doc.documentNo, doc.id, input);
    if (!result || result.error) return result;
    setPurchases(result.rows);
    return result.lines.map(copyPurchaseDoc);
  }

  function updateSaleOwner(id, input) {
    const doc = findDocByLineId(getSales(), id);
    if (!doc) return false;
    const result = updateDocumentOwnerRows(getSales(), doc.documentNo, doc.id, input);
    if (!result || result.error) return result;
    setSales(result.rows);
    return result.lines.map(copySaleDoc);
  }

  function addSalesReturn(input) {
    const sourceLineId = Number(input && input.sourceLineId);
    const sourceDoc = findDocByLineId(getSales(), sourceLineId);
    if (!sourceDoc || !isDocumentEffective(sourceDoc)) return null;
    const sourceLine = Array.isArray(sourceDoc.lines)
      ? sourceDoc.lines.find((l) => l.lineId === sourceLineId)
      : null;
    if (!sourceLine) return null;
    const quantity = positiveNumber(input && input.quantity);
    const returned = returnedQuantityForSource("salesReturn", sourceLineId);
    if (quantity === null || quantity > sourceLine.quantity - returned) {
      return { error: "RETURN_QUANTITY_EXCEEDS_SOURCE" };
    }
    const date = normalizeDate(input && input.date) || todayString();
    const returnRow = normalizeReturn({
      documentType: "salesReturn",
      documentNo: nextDocumentNo("SRTN", date, getReturns()),
      sourceDocumentNo: sourceDoc.documentNo,
      sourceLineId,
      productId: sourceLine.productId,
      warehouseId: sourceDoc.warehouseId,
      quantity,
      unitPrice: sourceLine.unitPrice,
      costBasis: sourceLine.costBasis,
      reason: input && input.reason,
      date,
      inspectionStatus: input && input.inspectionStatus,
      createdBy: input && input.user,
      confirmedBy: input && input.user,
      relatedDocumentNos: [sourceDoc.documentNo],
      status: "confirmed"
    }, nextReturnId());
    if (!returnRow) return null;
    incNextReturnId();
    setReturns([returnRow].concat(getReturns()));
    reduceReceivableForReturn(returnRow);
    return copyReturn(returnRow);
  }

  function addPurchaseReturn(input) {
    const sourceLineId = Number(input && input.sourceLineId);
    const sourceDoc = findDocByLineId(getPurchases(), sourceLineId);
    if (!sourceDoc || !isDocumentEffective(sourceDoc)) return null;
    const sourceLine = Array.isArray(sourceDoc.lines)
      ? sourceDoc.lines.find((l) => l.lineId === sourceLineId)
      : null;
    if (!sourceLine) return null;
    const quantity = positiveNumber(input && input.quantity);
    const returned = returnedQuantityForSource("purchaseReturn", sourceLineId);
    if (quantity === null || quantity > sourceLine.quantity - returned) {
      return { error: "RETURN_QUANTITY_EXCEEDS_SOURCE" };
    }
    if (stockForProduct(sourceLine.productId, sourceDoc.warehouseId).onHand < quantity) {
      return { error: "INSUFFICIENT_STOCK" };
    }
    const date = normalizeDate(input && input.date) || todayString();
    const returnRow = normalizeReturn({
      documentType: "purchaseReturn",
      documentNo: nextDocumentNo("PRTN", date, getReturns()),
      sourceDocumentNo: sourceDoc.documentNo,
      sourceLineId,
      productId: sourceLine.productId,
      warehouseId: sourceDoc.warehouseId,
      quantity,
      unitPrice: sourceLine.unitCost,
      reason: input && input.reason,
      date,
      inspectionStatus: input && input.inspectionStatus,
      createdBy: input && input.user,
      confirmedBy: input && input.user,
      relatedDocumentNos: [sourceDoc.documentNo],
      status: "confirmed"
    }, nextReturnId());
    if (!returnRow) return null;
    incNextReturnId();
    setReturns([returnRow].concat(getReturns()));
    reducePayableForReturn(returnRow);
    return copyReturn(returnRow);
  }

  function createVoidReversal(type, id, options) {
    const isPurchase = type === "purchase";
    const sourceDoc = isPurchase
      ? findDocByLineId(getPurchases(), id)
      : findDocByLineId(getSales(), id);
    if (!sourceDoc || !isVoidedDocument(sourceDoc)) return null;
    const existing = findVoidReversal(type, sourceDoc.id);
    if (existing) return existing;
    const firstLine = Array.isArray(sourceDoc.lines) && sourceDoc.lines[0];
    if (!firstLine) return null;
    const date = sourceDoc.voidedAt ? sourceDoc.voidedAt.slice(0, 10) : todayString();
    const documentType = isPurchase ? "purchaseReturn" : "salesReturn";
    const documentNo = nextDocumentNo(isPurchase ? "PRTN" : "SRTN", date, getReturns());
    const user = normalizeText(options && options.user) || sourceDoc.voidedBy || "本機使用者";
    const returnRow = normalizeReturn({
      documentType,
      documentNo,
      sourceDocumentNo: sourceDoc.documentNo,
      sourceLineId: sourceDoc.id,
      productId: firstLine.productId,
      warehouseId: sourceDoc.warehouseId,
      quantity: firstLine.quantity,
      unitPrice: isPurchase ? firstLine.unitCost : firstLine.unitPrice,
      costBasis: firstLine.costBasis,
      reason: `作廢沖銷：${sourceDoc.voidReason || "未填寫作廢原因"}`,
      date,
      inspectionStatus: "reversal",
      createdBy: user,
      confirmedBy: user,
      relatedDocumentNos: [sourceDoc.documentNo],
      status: "reversed"
    }, nextReturnId());
    if (!returnRow) return null;
    incNextReturnId();
    setReturns([returnRow].concat(getReturns()));
    const linkedSource = {
      status: "reversed",
      reversalDocumentNo: documentNo,
      relatedDocumentNos: mergeDocumentNos(sourceDoc.relatedDocumentNos, [sourceDoc.documentNo, documentNo])
    };
    if (isPurchase) {
      setPurchases(getPurchases().map((doc) => doc.id === sourceDoc.id ? Object.assign({}, doc, linkedSource) : doc));
    } else {
      setSales(getSales().map((doc) => doc.id === sourceDoc.id ? Object.assign({}, doc, linkedSource) : doc));
    }
    return copyReturn(returnRow);
  }

  function findVoidReversal(type, id) {
    const isPurchase = type === "purchase";
    const documentType = isPurchase ? "purchaseReturn" : "salesReturn";
    const sourceDoc = isPurchase
      ? findDocByLineId(getPurchases(), id)
      : findDocByLineId(getSales(), id);
    const sourceId = sourceDoc ? sourceDoc.id : Number(id);
    const found = getReturns().find((returnRow) =>
      returnRow.documentType === documentType &&
      returnRow.sourceLineId === sourceId &&
      returnRow.status === "reversed"
    );
    return found ? copyReturn(found) : null;
  }

  function addStockAdjustment(input) {
    const adjustment = normalizeAdjustment(input, nextAdjustmentId());
    const product = findProduct(adjustment && adjustment.productId);
    const warehouse = resolveActiveWarehouse(adjustment && adjustment.warehouseId);
    if (!adjustment || !product || !product.active || !warehouse) return null;
    const saved = Object.assign({}, adjustment, {
      warehouseId: warehouse.id,
      documentNo: adjustment.documentNo || nextDocumentNo("ADJ", adjustment.date, getAdjustments())
    });
    incNextAdjustmentId();
    setAdjustments([saved].concat(getAdjustments()));
    return copyAdjustment(saved);
  }

  function addStockCount(input) {
    const productId = Number(input && input.productId);
    const countedQuantity = nonNegativeNumber(input && input.countedQuantity);
    const product = findProduct(productId);
    const warehouse = resolveActiveWarehouse(input && input.warehouseId);
    if (!product || !product.active || countedQuantity === null || !warehouse) return null;
    const diff = countedQuantity - stockForProduct(productId, warehouse.id).onHand;
    if (diff === 0) return { error: "NO_DIFFERENCE" };
    return addStockAdjustment({
      productId,
      quantity: diff,
      warehouseId: warehouse.id,
      reason: normalizeText(input && input.reason) || "盤點",
      date: input && input.date,
      note: input && input.note,
      documentNo: input && input.documentNo
    });
  }

  function addTransferOrder(input) {
    const date = normalizeDate(input && input.date);
    const items = normalizeOrderItems(input && input.items, "quantity");
    const fromWarehouse = resolveActiveWarehouse(input && input.fromWarehouseId);
    const toWarehouse = resolveActiveWarehouse(input && input.toWarehouseId);
    if (!date || !items.length || !fromWarehouse || !toWarehouse || fromWarehouse.id === toWarehouse.id) return null;
    if (items.some((item) => {
      const product = findProduct(item.productId);
      return !product || !product.active;
    })) return null;
    const requestedByProduct = new Map();
    items.forEach((item) => {
      requestedByProduct.set(item.productId, (requestedByProduct.get(item.productId) || 0) + item.quantity);
    });
    for (const [productId, quantity] of requestedByProduct.entries()) {
      if (stockForProduct(productId, fromWarehouse.id).onHand < quantity) {
        return { error: "INSUFFICIENT_STOCK" };
      }
    }
    const documentNo = normalizeText(input && input.documentNo) || nextDocumentNo("TRF", date, getTransfers());
    const created = items.map((item) => {
      const transfer = normalizeTransfer({
        productId: item.productId,
        fromWarehouseId: fromWarehouse.id,
        toWarehouseId: toWarehouse.id,
        quantity: item.quantity,
        date,
        note: input && input.note,
        documentNo
      }, nextTransferId());
      incNextTransferId();
      return transfer;
    }).filter(Boolean);
    setTransfers(created.concat(getTransfers()));
    return {
      documentNo,
      lines: created.map(copyTransfer),
      totalQuantity: created.reduce((sum, item) => sum + item.quantity, 0)
    };
  }

  function listPurchases(options) {
    const filter = Object.assign({ query: "", month: "", includeVoided: false }, options);
    const query = normalizeText(filter.query).toLowerCase();
    return getPurchases()
      .filter((doc) => filter.includeVoided || !isVoidedDocument(doc))
      .filter((doc) => !filter.month || doc.date.slice(0, 7) === filter.month)
      .filter((doc) => {
        if (!query) return true;
        const warehouse = findWarehouse(doc.warehouseId);
        const lineMatches = Array.isArray(doc.lines) && doc.lines.some((line) => {
          const product = findProduct(line.productId);
          return [product && product.sku, product && product.name].some(
            (value) => normalizeText(value).toLowerCase().includes(query)
          );
        });
        return lineMatches || [
          warehouse && warehouse.code, warehouse && warehouse.name,
          doc.documentNo, doc.sourceDocumentNo, doc.reversalDocumentNo,
          doc.voidReason, doc.voidedBy, doc.supplierName, doc.note
        ].some((value) => normalizeText(value).toLowerCase().includes(query));
      })
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
      .map(copyPurchaseDoc);
  }

  function listSales(options) {
    const filter = Object.assign({ query: "", month: "", includeVoided: false }, options);
    const query = normalizeText(filter.query).toLowerCase();
    return getSales()
      .filter((doc) => filter.includeVoided || !isVoidedDocument(doc))
      .filter((doc) => !filter.month || doc.date.slice(0, 7) === filter.month)
      .filter((doc) => {
        if (!query) return true;
        const warehouse = findWarehouse(doc.warehouseId);
        const lineMatches = Array.isArray(doc.lines) && doc.lines.some((line) => {
          const product = findProduct(line.productId);
          return [product && product.sku, product && product.name].some(
            (value) => normalizeText(value).toLowerCase().includes(query)
          );
        });
        return lineMatches || [
          warehouse && warehouse.code, warehouse && warehouse.name,
          doc.documentNo, doc.sourceDocumentNo, doc.reversalDocumentNo,
          doc.voidReason, doc.voidedBy, doc.customerName, doc.note
        ].some((value) => normalizeText(value).toLowerCase().includes(query));
      })
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
      .map(copySaleDoc);
  }

  function listAdjustments(options) {
    const filter = Object.assign({ query: "", month: "" }, options);
    const query = normalizeText(filter.query).toLowerCase();
    return getAdjustments()
      .filter((adjustment) => !filter.month || adjustment.date.slice(0, 7) === filter.month)
      .filter((adjustment) => {
        if (!query) return true;
        const product = findProduct(adjustment.productId);
        const warehouse = findWarehouse(adjustment.warehouseId);
        return [
          product && product.sku, product && product.name,
          warehouse && warehouse.code, warehouse && warehouse.name,
          adjustment.documentNo, adjustment.reason, adjustment.note
        ].some((value) => normalizeText(value).toLowerCase().includes(query));
      })
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
      .map(copyAdjustment);
  }

  function listTransfers(options) {
    const filter = Object.assign({ query: "", month: "" }, options);
    const query = normalizeText(filter.query).toLowerCase();
    return getTransfers()
      .filter((transfer) => !filter.month || transfer.date.slice(0, 7) === filter.month)
      .filter((transfer) => {
        if (!query) return true;
        const product = findProduct(transfer.productId);
        const fromWarehouse = findWarehouse(transfer.fromWarehouseId);
        const toWarehouse = findWarehouse(transfer.toWarehouseId);
        return [
          product && product.sku, product && product.name,
          fromWarehouse && fromWarehouse.code, fromWarehouse && fromWarehouse.name,
          toWarehouse && toWarehouse.code, toWarehouse && toWarehouse.name,
          transfer.documentNo, transfer.note
        ].some((value) => normalizeText(value).toLowerCase().includes(query));
      })
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
      .map(copyTransfer);
  }

  function listReturns(options) {
    const filter = Object.assign({ query: "", month: "", documentType: "" }, options);
    const query = normalizeText(filter.query).toLowerCase();
    return getReturns()
      .filter((returnRow) => !filter.documentType || returnRow.documentType === filter.documentType)
      .filter((returnRow) => !filter.month || returnRow.date.slice(0, 7) === filter.month)
      .filter((returnRow) => {
        if (!query) return true;
        const product = findProduct(returnRow.productId);
        const warehouse = findWarehouse(returnRow.warehouseId);
        return [
          product && product.sku, product && product.name,
          warehouse && warehouse.code, warehouse && warehouse.name,
          returnRow.documentNo, returnRow.sourceDocumentNo, returnRow.reason
        ].some((value) => normalizeText(value).toLowerCase().includes(query));
      })
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
      .map(copyReturn);
  }

  function listCostLayers(options) {
    const filter = Object.assign({ productId: 0, method: "" }, options);
    return getCostLayers()
      .filter((layer) => !filter.productId || layer.productId === Number(filter.productId))
      .filter((layer) => !filter.method || layer.method === filter.method)
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
      .map(copyCostLayer);
  }

  return {
    addPurchase, addPurchaseOrder, removePurchase, transitionPurchase, updatePurchaseOwner,
    addSale, addSaleOrder, removeSale, transitionSale, updateSaleOwner,
    addSalesReturn, addPurchaseReturn, createVoidReversal, findVoidReversal,
    addStockAdjustment, addStockCount, addTransferOrder,
    listPurchases, listSales, listAdjustments, listTransfers, listReturns, listCostLayers
  };
}

const inventoryStoreTransactions = { createTransactionsModule };

export { createTransactionsModule };
export default inventoryStoreTransactions;
