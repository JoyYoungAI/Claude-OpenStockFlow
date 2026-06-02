(function (global) {
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
      // cross-domain dependencies
      findProduct,
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
      updateDocumentOwnerRows
    } = ctx;

    const models = global.OpenStockFlowModels || (typeof require !== "undefined" ? require("./inventoryModels") : {});
    const {
      normalizePurchase, copyPurchase,
      normalizeSale, copySale,
      normalizeAdjustment, copyAdjustment,
      normalizeTransfer, copyTransfer,
      normalizeReturn, copyReturn
    } = models;

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

    function nextDocumentNo(prefix, date, rows) {
      const yyyymm = date.slice(0, 7).replace("-", "");
      const base = `${prefix}-${yyyymm}-`;
      const max = rows.reduce((current, row) => {
        const value = normalizeText(row.documentNo);
        if (!value.startsWith(base)) return current;
        const number = Number(value.slice(base.length));
        return Number.isFinite(number) ? Math.max(current, number) : current;
      }, 0);
      return `${base}${String(max + 1).padStart(3, "0")}`;
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

    function ensureCostLayer(purchase) {
      if (!purchase || !isDocumentEffective(purchase) ||
        getCostLayers().some((layer) => layer.sourceLineId === purchase.id && layer.sourceDocumentNo === purchase.documentNo)) {
        return;
      }
      setCostLayers([{
        id: nextCostLayerId(),
        method: "standardCost",
        sourceType: "purchase",
        sourceDocumentNo: purchase.documentNo,
        sourceLineId: purchase.id,
        productId: purchase.productId,
        warehouseId: purchase.warehouseId,
        quantity: purchase.quantity,
        remainingQuantity: purchase.quantity,
        unitCost: purchase.unitCost,
        date: purchase.date,
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

    function applyPurchaseOrderEffects(documentNo) {
      const lines = getPurchases().filter((item) => sameDocument(item, documentNo, 0));
      if (!lines.length) return;
      const first = lines[0];
      if (first.createPayable && !hasPayableForDocument(documentNo)) {
        addPayable({
          sourceType: "purchase",
          sourceDocumentNo: documentNo,
          supplier: first.supplier,
          amount: lines.reduce((sum, item) => sum + item.quantity * item.unitCost, 0),
          paidAmount: 0,
          dueDate: first.dueDate || first.date,
          note: first.note
        });
      }
      lines.forEach((line) => ensureCostLayer(line));
      lines.forEach((line) => {
        setProductsCost(line.productId, line.unitCost);
      });
    }

    function applySaleOrderEffects(documentNo) {
      const lines = getSales().filter((item) => sameDocument(item, documentNo, 0));
      if (!lines.length) return;
      const first = lines[0];
      if (first.createReceivable && !hasReceivableForDocument(documentNo)) {
        addReceivable({
          sourceType: "sale",
          sourceDocumentNo: documentNo,
          customer: first.customer,
          amount: lines.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
          paidAmount: 0,
          dueDate: first.dueDate || first.date,
          note: first.note
        });
      }
    }

    function addPurchase(input) {
      const purchase = normalizePurchase(input, nextPurchaseId());
      const product = findProduct(purchase && purchase.productId);
      const warehouse = resolveActiveWarehouse(purchase && purchase.warehouseId);
      if (!purchase || !product || !product.active || !warehouse) return null;
      const saved = Object.assign({}, purchase, { warehouseId: warehouse.id });
      incNextPurchaseId();
      setPurchases([saved].concat(getPurchases()));
      if (input && input.createPayable) {
        addPayable({
          sourceType: "purchase",
          sourceDocumentNo: saved.documentNo || `PUR-${saved.id}`,
          supplier: saved.supplier,
          amount: saved.quantity * saved.unitCost,
          paidAmount: 0,
          dueDate: input.dueDate || saved.date,
          note: saved.note
        });
      }
      setProductsCost(saved.productId, saved.unitCost);
      return copyPurchase(saved);
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
      const createPayable = Boolean(input && input.createPayable);
      const dueDate = normalizeDate(input && input.dueDate) || date;
      const createdBy = normalizeText(input && input.createdBy);
      const ownerEmployeeId = Number(input && input.ownerEmployeeId) || 0;
      const ownerDepartmentId = Number(input && input.ownerDepartmentId) || 0;
      const createdByEmployeeId = Number(input && input.createdByEmployeeId) || ownerEmployeeId;
      const lastEditedByEmployeeId = Number(input && input.lastEditedByEmployeeId) || 0;
      const created = items.map((item) => {
        const purchase = {
          id: nextPurchaseId(),
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          supplier: normalizeText(input && input.supplier),
          date, note: normalizeText(input && input.note),
          documentNo, warehouseId: warehouse.id,
          status, createPayable, dueDate, createdBy,
          ownerEmployeeId, ownerDepartmentId, createdByEmployeeId, lastEditedByEmployeeId
        };
        incNextPurchaseId();
        return purchase;
      });
      setPurchases(created.concat(getPurchases()));
      if (isDocumentEffective({ status })) {
        applyPurchaseOrderEffects(documentNo);
      }
      return {
        documentNo,
        lines: created.map(copyPurchase),
        total: created.reduce((sum, item) => sum + item.quantity * item.unitCost, 0)
      };
    }

    function addSale(input) {
      const sale = normalizeSale(input, nextSaleId());
      const product = findProduct(sale && sale.productId);
      const warehouse = resolveActiveWarehouse(sale && sale.warehouseId);
      if (!sale || !product || !product.active || !warehouse) return null;
      if (stockForProduct(sale.productId, warehouse.id).onHand < sale.quantity) {
        return { error: "INSUFFICIENT_STOCK" };
      }
      const saved = Object.assign({}, sale, {
        warehouseId: warehouse.id,
        costBasis: createCostBasis(sale.productId, sale.quantity)
      });
      incNextSaleId();
      setSales([saved].concat(getSales()));
      consumeCostLayers(saved.productId, saved.warehouseId, saved.quantity);
      if (input && input.createReceivable) {
        addReceivable({
          sourceType: "sale",
          sourceDocumentNo: saved.documentNo || `SAL-${saved.id}`,
          customer: saved.customer,
          amount: saved.quantity * saved.unitPrice,
          paidAmount: 0,
          dueDate: input.dueDate || saved.date,
          note: saved.note
        });
      }
      return copySale(saved);
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
      const createReceivable = Boolean(input && input.createReceivable);
      const dueDate = normalizeDate(input && input.dueDate) || date;
      const createdBy = normalizeText(input && input.createdBy);
      const ownerEmployeeId = Number(input && input.ownerEmployeeId) || 0;
      const ownerDepartmentId = Number(input && input.ownerDepartmentId) || 0;
      const createdByEmployeeId = Number(input && input.createdByEmployeeId) || ownerEmployeeId;
      const lastEditedByEmployeeId = Number(input && input.lastEditedByEmployeeId) || 0;
      const created = items.map((item) => {
        const sale = {
          id: nextSaleId(),
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          customer: normalizeText(input && input.customer),
          date, note: normalizeText(input && input.note),
          documentNo, warehouseId: warehouse.id,
          status, createReceivable, dueDate, createdBy,
          ownerEmployeeId, ownerDepartmentId, createdByEmployeeId, lastEditedByEmployeeId,
          costBasis: createCostBasis(item.productId, item.quantity)
        };
        incNextSaleId();
        return sale;
      });
      setSales(created.concat(getSales()));
      if (isDocumentEffective({ status })) {
        created.forEach((line) => consumeCostLayers(line.productId, line.warehouseId, line.quantity));
        applySaleOrderEffects(documentNo);
      }
      return {
        documentNo,
        lines: created.map(copySale),
        total: created.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
      };
    }

    function removePurchase(id, options) {
      const purchase = getPurchases().find((item) => item.id === Number(id));
      if (!purchase) return false;
      if (isVoidedDocument(purchase)) return true;
      const currentStock = stockForProduct(purchase.productId, purchase.warehouseId).onHand;
      if (isDocumentEffective(purchase) && currentStock - purchase.quantity < 0) {
        return { error: "NEGATIVE_STOCK" };
      }
      const voidInfo = createVoidInfo(options);
      setPurchases(getPurchases().map((item) => item.id === purchase.id
        ? Object.assign({}, item, voidInfo, {
          sourceDocumentNo: item.sourceDocumentNo || item.documentNo,
          relatedDocumentNos: mergeDocumentNos(item.relatedDocumentNos, [item.documentNo])
        }) : item));
      voidPayablesForDocument(purchase.documentNo, voidInfo);
      setCostLayers(getCostLayers().map((layer) =>
        layer.sourceDocumentNo === purchase.documentNo && layer.sourceLineId === purchase.id
          ? Object.assign({}, layer, { remainingQuantity: 0 })
          : layer
      ));
      const latestEffectivePurchase = getPurchases().find(
        (p) => p.productId === purchase.productId && isDocumentEffective(p)
      );
      if (latestEffectivePurchase) {
        setProductsCost(purchase.productId, latestEffectivePurchase.unitCost);
      }
      return true;
    }

    function removeSale(id, options) {
      const sale = getSales().find((item) => item.id === Number(id));
      if (!sale) return false;
      if (isVoidedDocument(sale)) return true;
      const voidInfo = createVoidInfo(options);
      setSales(getSales().map((item) => item.id === sale.id
        ? Object.assign({}, item, voidInfo, {
          sourceDocumentNo: item.sourceDocumentNo || item.documentNo,
          relatedDocumentNos: mergeDocumentNos(item.relatedDocumentNos, [item.documentNo]),
          commissionStatus: item.commissionStatus ? "voided" : item.commissionStatus
        }) : item));
      voidReceivablesForDocument(sale.documentNo, voidInfo);
      return true;
    }

    function transitionPurchase(id, action, options) {
      const purchase = getPurchases().find((item) => item.id === Number(id));
      if (!purchase) return false;
      const result = transitionDocumentRows(getPurchases(), purchase.documentNo, purchase.id, action, options);
      if (!result || result.error) return result;
      setPurchases(result.rows);
      if (action === "confirm") {
        applyPurchaseOrderEffects(result.documentNo);
      }
      return result.lines.map(copyPurchase);
    }

    function transitionSale(id, action, options) {
      const sale = getSales().find((item) => item.id === Number(id));
      if (!sale) return false;
      const documentNo = sale.documentNo || "";
      if (action === "confirm") {
        const lines = getSales().filter((item) => sameDocument(item, documentNo, sale.id));
        const requestedByProductWarehouse = new Map();
        lines.forEach((line) => {
          const key = `${line.productId}:${line.warehouseId}`;
          requestedByProductWarehouse.set(key, (requestedByProductWarehouse.get(key) || 0) + line.quantity);
        });
        for (const [key, quantity] of requestedByProductWarehouse.entries()) {
          const [productId, warehouseId] = key.split(":").map(Number);
          if (stockForProduct(productId, warehouseId).onHand < quantity) {
            return { error: "INSUFFICIENT_STOCK" };
          }
        }
      }
      const result = transitionDocumentRows(getSales(), documentNo, sale.id, action, options);
      if (!result || result.error) return result;
      setSales(result.rows);
      if (action === "confirm") {
        const now = new Date().toISOString();
        setSales(getSales().map((item) => sameDocument(item, result.documentNo, id)
          ? Object.assign({}, item, { costBasis: createCostBasis(item.productId, item.quantity, now) })
          : item));
        applySaleOrderEffects(result.documentNo);
      }
      return result.lines.map(copySale);
    }

    function updatePurchaseOwner(id, input) {
      const purchase = getPurchases().find((item) => item.id === Number(id));
      if (!purchase) return false;
      const result = updateDocumentOwnerRows(getPurchases(), purchase.documentNo, purchase.id, input);
      if (!result || result.error) return result;
      setPurchases(result.rows);
      return result.lines.map(copyPurchase);
    }

    function updateSaleOwner(id, input) {
      const sale = getSales().find((item) => item.id === Number(id));
      if (!sale) return false;
      const result = updateDocumentOwnerRows(getSales(), sale.documentNo, sale.id, input);
      if (!result || result.error) return result;
      setSales(result.rows);
      return result.lines.map(copySale);
    }

    function addSalesReturn(input) {
      const source = getSales().find((item) => item.id === Number(input && input.sourceLineId));
      if (!source || !isDocumentEffective(source)) return null;
      const quantity = positiveNumber(input && input.quantity);
      const returned = returnedQuantityForSource("salesReturn", source.id);
      if (quantity === null || quantity > source.quantity - returned) {
        return { error: "RETURN_QUANTITY_EXCEEDS_SOURCE" };
      }
      const date = normalizeDate(input && input.date) || todayString();
      const returnRow = normalizeReturn({
        documentType: "salesReturn",
        documentNo: nextDocumentNo("SRTN", date, getReturns()),
        sourceDocumentNo: source.documentNo,
        sourceLineId: source.id,
        productId: source.productId,
        warehouseId: source.warehouseId,
        quantity,
        unitPrice: source.unitPrice,
        costBasis: source.costBasis,
        reason: input && input.reason,
        date,
        inspectionStatus: input && input.inspectionStatus,
        createdBy: input && input.user,
        confirmedBy: input && input.user,
        relatedDocumentNos: [source.documentNo],
        status: "confirmed"
      }, nextReturnId());
      if (!returnRow) return null;
      incNextReturnId();
      setReturns([returnRow].concat(getReturns()));
      reduceReceivableForReturn(returnRow);
      return copyReturn(returnRow);
    }

    function addPurchaseReturn(input) {
      const source = getPurchases().find((item) => item.id === Number(input && input.sourceLineId));
      if (!source || !isDocumentEffective(source)) return null;
      const quantity = positiveNumber(input && input.quantity);
      const returned = returnedQuantityForSource("purchaseReturn", source.id);
      if (quantity === null || quantity > source.quantity - returned) {
        return { error: "RETURN_QUANTITY_EXCEEDS_SOURCE" };
      }
      if (stockForProduct(source.productId, source.warehouseId).onHand < quantity) {
        return { error: "INSUFFICIENT_STOCK" };
      }
      const date = normalizeDate(input && input.date) || todayString();
      const returnRow = normalizeReturn({
        documentType: "purchaseReturn",
        documentNo: nextDocumentNo("PRTN", date, getReturns()),
        sourceDocumentNo: source.documentNo,
        sourceLineId: source.id,
        productId: source.productId,
        warehouseId: source.warehouseId,
        quantity,
        unitPrice: source.unitCost,
        reason: input && input.reason,
        date,
        inspectionStatus: input && input.inspectionStatus,
        createdBy: input && input.user,
        confirmedBy: input && input.user,
        relatedDocumentNos: [source.documentNo],
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
      const source = isPurchase
        ? getPurchases().find((item) => item.id === Number(id))
        : getSales().find((item) => item.id === Number(id));
      if (!source || !isVoidedDocument(source)) return null;
      const existing = findVoidReversal(type, id);
      if (existing) return existing;
      const date = source.voidedAt ? source.voidedAt.slice(0, 10) : todayString();
      const documentType = isPurchase ? "purchaseReturn" : "salesReturn";
      const documentNo = nextDocumentNo(isPurchase ? "PRTN" : "SRTN", date, getReturns());
      const user = normalizeText(options && options.user) || source.voidedBy || "本機使用者";
      const returnRow = normalizeReturn({
        documentType,
        documentNo,
        sourceDocumentNo: source.documentNo,
        sourceLineId: source.id,
        productId: source.productId,
        warehouseId: source.warehouseId,
        quantity: source.quantity,
        unitPrice: isPurchase ? source.unitCost : source.unitPrice,
        costBasis: source.costBasis,
        reason: `作廢沖銷：${source.voidReason || "未填寫作廢原因"}`,
        date,
        inspectionStatus: "reversal",
        createdBy: user,
        confirmedBy: user,
        relatedDocumentNos: [source.documentNo],
        status: "reversed"
      }, nextReturnId());
      if (!returnRow) return null;
      incNextReturnId();
      setReturns([returnRow].concat(getReturns()));
      const linkedSource = {
        status: "reversed",
        reversalDocumentNo: documentNo,
        relatedDocumentNos: mergeDocumentNos(source.relatedDocumentNos, [source.documentNo, documentNo])
      };
      if (isPurchase) {
        setPurchases(getPurchases().map((item) => item.id === source.id ? Object.assign({}, item, linkedSource) : item));
      } else {
        setSales(getSales().map((item) => item.id === source.id ? Object.assign({}, item, linkedSource) : item));
      }
      return copyReturn(returnRow);
    }

    function findVoidReversal(type, id) {
      const isPurchase = type === "purchase";
      const documentType = isPurchase ? "purchaseReturn" : "salesReturn";
      const sourceId = Number(id);
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
        .filter((purchase) => filter.includeVoided || !isVoidedDocument(purchase))
        .filter((purchase) => !filter.month || purchase.date.slice(0, 7) === filter.month)
        .filter((purchase) => {
          if (!query) return true;
          const product = findProduct(purchase.productId);
          const warehouse = findWarehouse(purchase.warehouseId);
          return [
            product && product.sku, product && product.name,
            warehouse && warehouse.code, warehouse && warehouse.name,
            purchase.documentNo, purchase.sourceDocumentNo, purchase.reversalDocumentNo,
            purchase.voidReason, purchase.voidedBy, purchase.supplier, purchase.note
          ].some((value) => normalizeText(value).toLowerCase().includes(query));
        })
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
        .map(copyPurchase);
    }

    function listSales(options) {
      const filter = Object.assign({ query: "", month: "", includeVoided: false }, options);
      const query = normalizeText(filter.query).toLowerCase();
      return getSales()
        .filter((sale) => filter.includeVoided || !isVoidedDocument(sale))
        .filter((sale) => !filter.month || sale.date.slice(0, 7) === filter.month)
        .filter((sale) => {
          if (!query) return true;
          const product = findProduct(sale.productId);
          const warehouse = findWarehouse(sale.warehouseId);
          return [
            product && product.sku, product && product.name,
            warehouse && warehouse.code, warehouse && warehouse.name,
            sale.documentNo, sale.sourceDocumentNo, sale.reversalDocumentNo,
            sale.voidReason, sale.voidedBy, sale.customer, sale.note
          ].some((value) => normalizeText(value).toLowerCase().includes(query));
        })
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
        .map(copySale);
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

  global.OpenStockFlowStoreTransactions = { createTransactionsModule };

  if (typeof module !== "undefined") {
    module.exports = global.OpenStockFlowStoreTransactions;
  }
})(typeof window !== "undefined" ? window : globalThis);
