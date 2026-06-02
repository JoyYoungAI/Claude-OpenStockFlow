(function (global) {
  const models = global.OpenStockFlowModels || (typeof require !== "undefined" ? require("./inventoryModels") : {});
  const reports = global.OpenStockFlowReports || (typeof require !== "undefined" ? require("./inventoryReports") : {});
  const {
    copyPartner,
    copyDepartment,
    copyEmployee,
    copyPermissionScope,
    copyProductCategory,
    copyWarehouse,
    copyPurchase,
    copySale,
    copyAdjustment,
    copyTransfer,
    copyReturn,
    copyReceivable,
    copyPayable,
    copyPayment,
    normalizePreferences,
    defaultPreferences,
    defaultWarehouse,
    ensureWarehouseOnRow
  } = models;

  function createInventoryStore(initialState) {
    // ── State variables ──────────────────────────────────────────────────────
    let products = Array.isArray(initialState && initialState.products)
      ? initialState.products.map(copyProductLocal) : [];
    let purchases = Array.isArray(initialState && initialState.purchases)
      ? initialState.purchases.map(copyPurchase) : [];
    let sales = Array.isArray(initialState && initialState.sales)
      ? initialState.sales.map(copySale) : [];
    let partners = Array.isArray(initialState && initialState.partners)
      ? initialState.partners.map(copyPartner) : [];
    let departments = Array.isArray(initialState && initialState.departments)
      ? initialState.departments.map(copyDepartment) : [];
    let employees = Array.isArray(initialState && initialState.employees)
      ? initialState.employees.map(copyEmployee) : [];
    let permissionScopes = Array.isArray(initialState && initialState.permissionScopes)
      ? initialState.permissionScopes.map(copyPermissionScope) : [];
    let productCategories = Array.isArray(initialState && initialState.productCategories)
      ? initialState.productCategories.map(copyProductCategory) : [];
    let warehouses = Array.isArray(initialState && initialState.warehouses)
      ? initialState.warehouses.map(copyWarehouse) : [];
    if (!warehouses.length) {
      warehouses = [defaultWarehouse()];
    }
    let adjustments = Array.isArray(initialState && initialState.adjustments)
      ? initialState.adjustments.map(copyAdjustment) : [];
    let transfers = Array.isArray(initialState && initialState.transfers)
      ? initialState.transfers.map(copyTransfer) : [];
    let returns = Array.isArray(initialState && initialState.returns)
      ? initialState.returns.map(copyReturn) : [];
    let costLayers = Array.isArray(initialState && initialState.costLayers)
      ? initialState.costLayers.map(copyCostLayer) : [];
    let receivables = Array.isArray(initialState && initialState.receivables)
      ? initialState.receivables.map(copyReceivable) : [];
    let payables = Array.isArray(initialState && initialState.payables)
      ? initialState.payables.map(copyPayable) : [];
    let payments = Array.isArray(initialState && initialState.payments)
      ? initialState.payments.map(copyPayment) : [];
    let auditLogs = Array.isArray(initialState && initialState.auditLogs)
      ? initialState.auditLogs.map(copyAuditLog) : [];
    let preferences = normalizePreferences
      ? normalizePreferences(initialState && initialState.preferences)
      : defaultPreferences();

    const fallbackWarehouseId = defaultWarehouseId();
    purchases = purchases.map((purchase) => ensureWarehouseOnRow(purchase, fallbackWarehouseId));
    sales = sales.map((sale) => ensureWarehouseOnRow(sale, fallbackWarehouseId));
    adjustments = adjustments.map((adjustment) => ensureWarehouseOnRow(adjustment, fallbackWarehouseId));

    // ── ID counters ──────────────────────────────────────────────────────────
    let _nextProductId = nextId(products);
    let _nextPurchaseId = nextId(purchases);
    let _nextSaleId = nextId(sales);
    let _nextPartnerId = nextId(partners);
    let _nextDepartmentId = nextId(departments);
    let _nextEmployeeId = nextId(employees);
    let _nextPermissionScopeId = nextId(permissionScopes);
    let _nextCategoryId = nextId(productCategories);
    let _nextWarehouseId = nextId(warehouses);
    let _nextAdjustmentId = nextId(adjustments);
    let _nextTransferId = nextId(transfers);
    let _nextReturnId = nextId(returns);
    let _nextCostLayerId = nextId(costLayers);
    let _nextReceivableId = nextId(receivables);
    let _nextPayableId = nextId(payables);
    let _nextPaymentId = nextId(payments);
    let _nextAuditId = nextId(auditLogs);

    // ── Helper: local copyProduct (same logic as original) ───────────────────
    function copyProductLocal(product) {
      const { nonNegativeNumber } = global.OpenStockFlowUtils || {};
      const nnn = nonNegativeNumber || function (v) {
        const n = Number(v);
        return Number.isFinite(n) && n >= 0 ? n : null;
      };
      return {
        id: Number(product.id),
        sku: normalizeText(product.sku).toUpperCase(),
        name: normalizeText(product.name),
        category: normalizeText(product.category) || "未分類",
        unit: normalizeText(product.unit) || "件",
        cost: nnn(product.cost) || 0,
        price: nnn(product.price) || 0,
        safetyStock: nnn(product.safetyStock) || 0,
        active: product.active === false ? false : true
      };
    }

    // ── State accessors ──────────────────────────────────────────────────────
    const ctx = {
      getProducts: () => products,
      setProducts: (v) => { products = v; },
      getPartners: () => partners,
      setPartners: (v) => { partners = v; },
      getDepartments: () => departments,
      setDepartments: (v) => { departments = v; },
      getEmployees: () => employees,
      setEmployees: (v) => { employees = v; },
      getPermissionScopes: () => permissionScopes,
      setPermissionScopes: (v) => { permissionScopes = v; },
      getProductCategories: () => productCategories,
      setProductCategories: (v) => { productCategories = v; },
      getWarehouses: () => warehouses,
      setWarehouses: (v) => { warehouses = v; },
      getPreferences: () => preferences,
      setPreferences: (v) => { preferences = v; },
      getPurchases: () => purchases,
      setPurchases: (v) => { purchases = v; },
      getSales: () => sales,
      setSales: (v) => { sales = v; },
      getAdjustments: () => adjustments,
      setAdjustments: (v) => { adjustments = v; },
      getTransfers: () => transfers,
      setTransfers: (v) => { transfers = v; },
      getReturns: () => returns,
      setReturns: (v) => { returns = v; },
      getCostLayers: () => costLayers,
      setCostLayers: (v) => { costLayers = v; },
      getReceivables: () => receivables,
      setReceivables: (v) => { receivables = v; },
      getPayables: () => payables,
      setPayables: (v) => { payables = v; },
      getPayments: () => payments,
      setPayments: (v) => { payments = v; },

      nextProductId: () => _nextProductId,
      incNextProductId: () => { _nextProductId += 1; },
      nextPurchaseId: () => _nextPurchaseId,
      incNextPurchaseId: () => { _nextPurchaseId += 1; },
      nextSaleId: () => _nextSaleId,
      incNextSaleId: () => { _nextSaleId += 1; },
      nextPartnerId: () => _nextPartnerId,
      incNextPartnerId: () => { _nextPartnerId += 1; },
      nextDepartmentId: () => _nextDepartmentId,
      incNextDepartmentId: () => { _nextDepartmentId += 1; },
      nextEmployeeId: () => _nextEmployeeId,
      incNextEmployeeId: () => { _nextEmployeeId += 1; },
      nextPermissionScopeId: () => _nextPermissionScopeId,
      incNextPermissionScopeId: () => { _nextPermissionScopeId += 1; },
      nextCategoryId: () => _nextCategoryId,
      incNextCategoryId: () => { _nextCategoryId += 1; },
      nextWarehouseId: () => _nextWarehouseId,
      incNextWarehouseId: () => { _nextWarehouseId += 1; },
      nextAdjustmentId: () => _nextAdjustmentId,
      incNextAdjustmentId: () => { _nextAdjustmentId += 1; },
      nextTransferId: () => _nextTransferId,
      incNextTransferId: () => { _nextTransferId += 1; },
      nextReturnId: () => _nextReturnId,
      incNextReturnId: () => { _nextReturnId += 1; },
      nextCostLayerId: () => _nextCostLayerId,
      incNextCostLayerId: () => { _nextCostLayerId += 1; },
      nextReceivableId: () => _nextReceivableId,
      incNextReceivableId: () => { _nextReceivableId += 1; },
      nextPayableId: () => _nextPayableId,
      incNextPayableId: () => { _nextPayableId += 1; },
      nextPaymentId: () => _nextPaymentId,
      incNextPaymentId: () => { _nextPaymentId += 1; }
    };

    // ── Shared helpers (passed into sub-modules via ctx) ─────────────────────
    function findProduct(id) {
      return products.find((product) => product.id === Number(id)) || null;
    }

    function findPartner(id) {
      return partners.find((partner) => partner.id === Number(id)) || null;
    }

    function findWarehouse(id) {
      return warehouses.find((warehouse) => warehouse.id === Number(id)) || null;
    }

    function defaultWarehouseId() {
      const active = warehouses.filter((warehouse) => warehouse.active).sort((a, b) => a.id - b.id)[0];
      const first = active || warehouses.slice().sort((a, b) => a.id - b.id)[0] || defaultWarehouse();
      return first.id;
    }

    function resolveActiveWarehouse(id) {
      const warehouseId = Number(id);
      const warehouse = warehouseId ? findWarehouse(warehouseId) : findWarehouse(defaultWarehouseId());
      return warehouse && warehouse.active ? warehouse : null;
    }

    function stockForProduct(productId, warehouseId) {
      return reports.stockForProduct(reportState(), productId, warehouseId);
    }

    function setProductsCost(productId, cost) {
      products = products.map((item) =>
        item.id === productId ? Object.assign({}, item, { cost }) : item
      );
    }

    function isDocumentEffective(row) {
      return !row || !row.status || row.status === "confirmed" || row.status === "amended" || row.status === "voidRequested";
    }

    function isVoidedDocument(row) {
      return row && (row.status === "voided" || row.status === "reversed");
    }

    function createVoidInfo(options) {
      const now = new Date().toISOString();
      const reason = normalizeText(options && options.reason) || "未填寫作廢原因";
      const user = normalizeText(options && options.user) || "本機使用者";
      return { status: "voided", voidReason: reason, voidedAt: now, voidedBy: user };
    }

    function sameDocument(row, documentNo, id) {
      if (!row) return false;
      if (documentNo) return row.documentNo === documentNo;
      return row.id === Number(id);
    }

    function appendNote(note, addition) {
      const current = normalizeText(note);
      return current ? `${current}; ${addition}` : addition;
    }

    function mergeDocumentNos(current, additions) {
      return Array.from(new Set(normalizeDocumentNoList(current).concat(normalizeDocumentNoList(additions))));
    }

    function normalizeDocumentStatus(status) {
      const value = normalizeText(status);
      return ["draft", "submitted", "approved", "rejected", "confirmed", "amended", "voidRequested", "voided", "reversed"]
        .includes(value) ? value : "confirmed";
    }

    function transitionDocumentRows(rows, documentNo, id, action, options) {
      const lines = rows.filter((item) => sameDocument(item, documentNo, id));
      if (!lines.length) return false;
      if (lines.some((line) => isVoidedDocument(line))) return { error: "DOCUMENT_CLOSED" };
      const currentStatus = normalizeDocumentStatus(lines[0].status);
      const audit = approvalAudit(action, options);
      let nextStatus = "";
      if (action === "submit" && (currentStatus === "draft" || currentStatus === "rejected")) {
        nextStatus = "submitted";
      } else if (action === "approve" && currentStatus === "submitted") {
        nextStatus = "approved";
      } else if (action === "reject" && (currentStatus === "submitted" || currentStatus === "approved")) {
        nextStatus = "rejected";
      } else if (action === "confirm" && currentStatus === "approved") {
        nextStatus = "confirmed";
      } else if (action === "requestVoid" && (currentStatus === "confirmed" || currentStatus === "amended")) {
        nextStatus = "voidRequested";
      } else if (action === "cancelVoid" && currentStatus === "voidRequested") {
        nextStatus = "confirmed";
      } else {
        return { error: "INVALID_APPROVAL_TRANSITION" };
      }
      const updatedLines = lines.map((line) => Object.assign({}, line, audit, { status: nextStatus }));
      return {
        documentNo,
        lines: updatedLines,
        rows: rows.map((row) => {
          const updated = updatedLines.find((line) => line.id === row.id);
          return updated || row;
        })
      };
    }

    function updateDocumentOwnerRows(rows, documentNo, id, input) {
      const lines = rows.filter((item) => sameDocument(item, documentNo, id));
      if (!lines.length) return false;
      if (lines.some((line) => isVoidedDocument(line))) return { error: "DOCUMENT_CLOSED" };
      const currentStatus = normalizeDocumentStatus(lines[0].status);
      if (!["draft", "submitted", "approved"].includes(currentStatus)) return { error: "DOCUMENT_CLOSED" };
      const ownerEmployeeId = Number(input && input.ownerEmployeeId) || 0;
      const ownerDepartmentId = Number(input && input.ownerDepartmentId) || 0;
      if (!ownerEmployeeId || !ownerDepartmentId) return null;
      const editedBy = Number(input && input.lastEditedByEmployeeId) || ownerEmployeeId;
      const updatedLines = lines.map((line) => Object.assign({}, line, {
        ownerEmployeeId, ownerDepartmentId, lastEditedByEmployeeId: editedBy
      }));
      return {
        documentNo,
        lines: updatedLines,
        rows: rows.map((row) => {
          const updated = updatedLines.find((line) => line.id === row.id);
          return updated || row;
        })
      };
    }

    function approvalAudit(action, options) {
      const now = new Date().toISOString();
      const user = normalizeText(options && options.user) || "local-user";
      const reason = normalizeText(options && options.reason);
      if (action === "submit") return { submittedBy: user, submittedAt: now };
      if (action === "approve") return { approvedBy: user, approvedAt: now };
      if (action === "reject") return { rejectedBy: user, rejectedAt: now, rejectReason: reason };
      if (action === "confirm") return { confirmedBy: user, confirmedAt: now };
      if (action === "requestVoid") return { voidRequestedBy: user, voidRequestedAt: now, voidRequestReason: reason };
      return {};
    }

    // ── Initialise sub-modules ───────────────────────────────────────────────
    const financeModule = (global.OpenStockFlowStoreFinance || (typeof require !== "undefined" ? require("./inventoryStoreFinance") : {}))
      .createFinanceModule(ctx);

    const masterCtx = Object.assign({}, ctx, {
      findProduct,
      setProductsCost
    });
    const masterModule = (global.OpenStockFlowStoreMaster || (typeof require !== "undefined" ? require("./inventoryStoreMaster") : {}))
      .createMasterModule(masterCtx);

    const txCtx = Object.assign({}, ctx, {
      findProduct,
      findPartner,
      findWarehouse,
      resolveActiveWarehouse,
      stockForProduct,
      setProductsCost,
      addPayable: financeModule.addPayable,
      addReceivable: financeModule.addReceivable,
      reducePayableForReturn: financeModule.reducePayableForReturn,
      reduceReceivableForReturn: financeModule.reduceReceivableForReturn,
      voidPayablesForDocument: financeModule.voidPayablesForDocument,
      voidReceivablesForDocument: financeModule.voidReceivablesForDocument,
      hasReceivableForDocument: financeModule.hasReceivableForDocument,
      hasPayableForDocument: financeModule.hasPayableForDocument,
      isDocumentEffective,
      isVoidedDocument,
      createVoidInfo,
      sameDocument,
      appendNote,
      mergeDocumentNos,
      normalizeDocumentStatus,
      transitionDocumentRows,
      updateDocumentOwnerRows
    });
    const transactionsModule = (global.OpenStockFlowStoreTransactions || (typeof require !== "undefined" ? require("./inventoryStoreTransactions") : {}))
      .createTransactionsModule(txCtx);

    // ── Remaining store-level functions ──────────────────────────────────────
    function recordAuditEvent(input) {
      const event = normalizeAuditEvent(input, _nextAuditId);
      if (!event) return null;
      _nextAuditId += 1;
      auditLogs = [event].concat(auditLogs).slice(0, 1000);
      return copyAuditLog(event);
    }

    function listAuditLogs(options) {
      const filter = Object.assign({ query: "", action: "", riskLevel: "", result: "", month: "", highRiskOnly: false }, options);
      const query = normalizeText(filter.query).toLowerCase();
      return auditLogs
        .filter((event) => !filter.action || event.action === filter.action)
        .filter((event) => !filter.riskLevel || event.riskLevel === filter.riskLevel)
        .filter((event) => !filter.result || event.result === filter.result)
        .filter((event) => !filter.highRiskOnly || event.riskLevel === "high")
        .filter((event) => !filter.month || event.occurredAt.slice(0, 7) === filter.month)
        .filter((event) => {
          if (!query) return true;
          return [
            event.actorName, event.roleAtOperation, event.action,
            event.entityType, event.entityId, event.documentNo,
            event.sourceDocumentNo, event.summary, event.reason,
            event.result, event.riskLevel
          ].some((value) => normalizeText(value).toLowerCase().includes(query))
            || event.relatedDocumentNos.some((value) => normalizeText(value).toLowerCase().includes(query));
        })
        .slice()
        .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt) || b.auditId - a.auditId)
        .map(copyAuditLog);
    }

    function reportState() {
      return {
        products, departments, employees, permissionScopes,
        purchases, sales, adjustments, transfers, returns,
        costLayers, warehouses, receivables, payables, payments,
        auditLogs, preferences
      };
    }

    function snapshot() {
      return {
        products: products.map(copyProductLocal),
        partners: partners.map(copyPartner),
        departments: departments.map(copyDepartment),
        employees: employees.map(copyEmployee),
        permissionScopes: permissionScopes.map(copyPermissionScope),
        productCategories: productCategories.map(copyProductCategory),
        warehouses: warehouses.map(copyWarehouse),
        adjustments: adjustments.map(copyAdjustment),
        transfers: transfers.map(copyTransfer),
        returns: returns.map(copyReturn),
        costLayers: costLayers.map(copyCostLayer),
        receivables: receivables.map(copyReceivable),
        payables: payables.map(copyPayable),
        payments: payments.map(copyPayment),
        auditLogs: auditLogs.map(copyAuditLog),
        preferences: Object.assign({}, preferences),
        purchases: purchases.map(copyPurchase),
        sales: sales.map(copySale)
      };
    }

    function inventoryReport(options) {
      return reports.inventoryReport(reportState(), options);
    }

    function dashboard() {
      return reports.dashboard(reportState());
    }

    function grossProfitRanking(limit) {
      return reports.grossProfitRanking(reportState(), limit);
    }

    function warehouseStockSummary(options) {
      return reports.warehouseStockSummary(reportState(), options);
    }

    function productWarehouseSummary(options) {
      return reports.productWarehouseSummary(reportState(), options);
    }

    function warehouseTransferSummary(options) {
      return reports.warehouseTransferSummary(reportState(), options);
    }

    function reportSummary(options) {
      return reports.reportSummary(reportState(), options);
    }

    function stockMovements(options) {
      return reports.stockMovements(reportState(), options);
    }

    function exportInventoryRows(options) {
      return reports.exportInventoryRows(reportState(), options);
    }

    // ── Return combined API ──────────────────────────────────────────────────
    return Object.assign(
      {},
      masterModule,
      financeModule,
      transactionsModule,
      {
        recordAuditEvent, listAuditLogs,
        snapshot, reportState,
        stockForProduct,
        findProduct, findPartner, findWarehouse,
        defaultWarehouseId, resolveActiveWarehouse,
        isDocumentEffective, isVoidedDocument,
        createVoidInfo, sameDocument, appendNote, mergeDocumentNos,
        normalizeDocumentStatus, transitionDocumentRows, updateDocumentOwnerRows, approvalAudit,
        inventoryReport, dashboard, grossProfitRanking,
        warehouseStockSummary, productWarehouseSummary, warehouseTransferSummary,
        reportSummary, stockMovements, exportInventoryRows
      }
    );
  }

  // ── Module-level helpers ────────────────────────────────────────────────────
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

  function normalizeDocumentNoList(value) {
    if (!Array.isArray(value)) return [];
    return value.map(normalizeText).filter(Boolean);
  }

  function normalizeCostBasis(value) {
    const basis = value && typeof value === "object" ? value : {};
    const unitCost = nonNegativeNumber(basis.unitCost);
    const totalCost = nonNegativeNumber(basis.totalCost);
    const quantity = positiveNumber(basis.quantity);
    if (unitCost === null && totalCost === null) return null;
    return {
      method: normalizeText(basis.method) || "standardCost",
      unitCost: unitCost === null ? 0 : unitCost,
      quantity: quantity === null ? 0 : quantity,
      totalCost: totalCost === null ? (unitCost || 0) * (quantity || 0) : totalCost,
      source: normalizeText(basis.source) || "productCost",
      capturedAt: normalizeText(basis.capturedAt)
    };
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

  function normalizeAuditEvent(input, id) {
    const action = normalizeText(input && input.action);
    const entityType = normalizeText(input && input.entityType);
    if (!["create", "delete", "update", "read", "print", "export", "restore", "access"].includes(action) || !entityType) {
      return null;
    }
    return {
      auditId: id,
      occurredAt: normalizeText(input && input.occurredAt) || new Date().toISOString(),
      actorId: normalizeText(input && input.actorId) || "local-user",
      actorName: normalizeText(input && input.actorName) || "本機使用者",
      actorEmployeeId: Number(input && input.actorEmployeeId) || 0,
      actorDepartmentId: Number(input && input.actorDepartmentId) || 0,
      roleAtOperation: normalizeText(input && input.roleAtOperation) || "owner",
      action,
      entityType,
      entityId: normalizeText(input && input.entityId),
      documentNo: normalizeText(input && input.documentNo),
      sourceDocumentNo: normalizeText(input && input.sourceDocumentNo),
      relatedDocumentNos: normalizeDocumentNoList(input && input.relatedDocumentNos),
      summary: normalizeText(input && input.summary),
      reason: normalizeText(input && input.reason),
      before: normalizeAuditSnapshot(input && input.before),
      after: normalizeAuditSnapshot(input && input.after),
      result: normalizeAuditResult(input && input.result),
      riskLevel: normalizeAuditRisk(input && input.riskLevel)
    };
  }

  function copyAuditLog(event) {
    return {
      auditId: Number(event.auditId),
      occurredAt: normalizeText(event.occurredAt),
      actorId: normalizeText(event.actorId),
      actorName: normalizeText(event.actorName),
      actorEmployeeId: Number(event.actorEmployeeId) || 0,
      actorDepartmentId: Number(event.actorDepartmentId) || 0,
      roleAtOperation: normalizeText(event.roleAtOperation),
      action: normalizeText(event.action),
      entityType: normalizeText(event.entityType),
      entityId: normalizeText(event.entityId),
      documentNo: normalizeText(event.documentNo),
      sourceDocumentNo: normalizeText(event.sourceDocumentNo),
      relatedDocumentNos: normalizeDocumentNoList(event.relatedDocumentNos),
      summary: normalizeText(event.summary),
      reason: normalizeText(event.reason),
      before: normalizeAuditSnapshot(event.before),
      after: normalizeAuditSnapshot(event.after),
      result: normalizeAuditResult(event.result),
      riskLevel: normalizeAuditRisk(event.riskLevel)
    };
  }

  function normalizeAuditSnapshot(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.keys(value).slice(0, 20).reduce((snapshot, key) => {
      const normalizedKey = normalizeText(key);
      const rawValue = value[key];
      if (!normalizedKey) return snapshot;
      if (Array.isArray(rawValue)) {
        snapshot[normalizedKey] = rawValue.map((item) => normalizeText(item)).filter(Boolean).slice(0, 20);
      } else if (rawValue && typeof rawValue === "object") {
        snapshot[normalizedKey] = normalizeText(JSON.stringify(rawValue)).slice(0, 300);
      } else {
        snapshot[normalizedKey] = normalizeText(rawValue).slice(0, 300);
      }
      return snapshot;
    }, {});
  }

  function normalizeAuditResult(result) {
    const value = normalizeText(result);
    return ["success", "denied", "failed"].includes(value) ? value : "success";
  }

  function normalizeAuditRisk(riskLevel) {
    const value = normalizeText(riskLevel);
    return ["low", "medium", "high"].includes(value) ? value : "low";
  }

  function nextId(items) {
    return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
  }

  global.createInventoryStore = createInventoryStore;

  if (typeof module !== "undefined") {
    module.exports = { createInventoryStore };
  }
})(typeof window !== "undefined" ? window : globalThis);
