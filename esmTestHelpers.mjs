function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function scrubVolatile(value) {
  if (Array.isArray(value)) {
    return value.map(scrubVolatile);
  }
  if (!value || typeof value !== "object") {
    return value;
  }
  return Object.keys(value).reduce((result, key) => {
    if ([
      "createdAt",
      "capturedAt",
      "occurredAt",
      "submittedAt",
      "approvedAt",
      "rejectedAt",
      "confirmedAt",
      "voidRequestedAt",
      "voidedAt"
    ].includes(key)) {
      result[key] = key;
      return result;
    }
    result[key] = scrubVolatile(value[key]);
    return result;
  }, {});
}

function assertNamedMatchesDefault(assert, namedExports, defaultExport) {
  assert.deepEqual(Object.keys(namedExports).sort(), Object.keys(defaultExport).sort());
}

function createMasterHarness(createMasterModule, defaultPreferences) {
  const state = {
    products: [
      { id: 1, sku: "A001", name: "Coffee", category: "Food", unit: "bag", cost: 100, price: 160, safetyStock: 2, active: true }
    ],
    partners: [],
    departments: [],
    employees: [],
    permissionScopes: [],
    productCategories: [],
    warehouses: [],
    preferences: defaultPreferences(),
    nextProductId: 2,
    nextPartnerId: 1,
    nextDepartmentId: 1,
    nextEmployeeId: 1,
    nextPermissionScopeId: 1,
    nextCategoryId: 1,
    nextWarehouseId: 1
  };
  const ctx = {
    getProducts: () => state.products,
    setProducts: (value) => { state.products = value; },
    getPartners: () => state.partners,
    setPartners: (value) => { state.partners = value; },
    getDepartments: () => state.departments,
    setDepartments: (value) => { state.departments = value; },
    getEmployees: () => state.employees,
    setEmployees: (value) => { state.employees = value; },
    getPermissionScopes: () => state.permissionScopes,
    setPermissionScopes: (value) => { state.permissionScopes = value; },
    getProductCategories: () => state.productCategories,
    setProductCategories: (value) => { state.productCategories = value; },
    getWarehouses: () => state.warehouses,
    setWarehouses: (value) => { state.warehouses = value; },
    getPreferences: () => state.preferences,
    setPreferences: (value) => { state.preferences = value; },
    nextProductId: () => state.nextProductId,
    incNextProductId: () => { state.nextProductId += 1; },
    nextPartnerId: () => state.nextPartnerId,
    incNextPartnerId: () => { state.nextPartnerId += 1; },
    nextDepartmentId: () => state.nextDepartmentId,
    incNextDepartmentId: () => { state.nextDepartmentId += 1; },
    nextEmployeeId: () => state.nextEmployeeId,
    incNextEmployeeId: () => { state.nextEmployeeId += 1; },
    nextPermissionScopeId: () => state.nextPermissionScopeId,
    incNextPermissionScopeId: () => { state.nextPermissionScopeId += 1; },
    nextCategoryId: () => state.nextCategoryId,
    incNextCategoryId: () => { state.nextCategoryId += 1; },
    nextWarehouseId: () => state.nextWarehouseId,
    incNextWarehouseId: () => { state.nextWarehouseId += 1; }
  };
  return { api: createMasterModule(ctx), state };
}

function runMasterScenario(createMasterModule, options) {
  const { defaultPreferences, preferencesInput } = options;
  const { api, state } = createMasterHarness(createMasterModule, defaultPreferences);
  const outputs = [];
  const call = (name, fn) => {
    outputs.push({ name, value: fn() });
  };

  call("addProduct-defaults", () => api.addProduct({ sku: " b002 ", name: " Tea ", category: "", unit: "", cost: "60", price: "100", safetyStock: "5" }));
  call("addProduct-duplicate", () => api.addProduct({ sku: "B002", name: "Duplicate", cost: "1", price: "2", safetyStock: "0" }));
  call("updateProduct", () => api.updateProduct(2, { sku: "B002", name: "Tea Box", category: "Drink", unit: "box", cost: "65", price: "110", safetyStock: "4" }));
  call("updateProduct-duplicate", () => api.updateProduct(2, { sku: "A001", name: "Bad", category: "Drink", unit: "box", cost: "65", price: "110", safetyStock: "4" }));
  call("setProductsCost", () => { api.setProductsCost(2, 70); return api.findProduct(2); });
  call("copyProduct", () => api.copyProduct({ id: "9", sku: " c003 ", name: " Cocoa ", category: "", unit: "", cost: "20", price: "30", safetyStock: "" }));
  call("deactivateProduct", () => api.deactivateProduct(2));
  call("addProductCategory", () => api.addProductCategory({ code: " drink ", name: " Drink ", sortOrder: "2", note: " shelf " }));
  call("addProductCategory-duplicate", () => api.addProductCategory({ code: "DRINK", name: "Other", sortOrder: "3" }));
  call("deactivateProductCategory", () => api.deactivateProductCategory(1));
  call("addWarehouse", () => api.addWarehouse({ code: " main ", name: " Main Warehouse ", type: "", note: " default " }));
  call("addWarehouse-duplicate", () => api.addWarehouse({ code: "MAIN", name: "Other", type: "store" }));
  call("addWarehouse-second", () => api.addWarehouse({ code: " br ", name: " Branch ", type: "store", note: " retail " }));
  call("deactivateWarehouse", () => api.deactivateWarehouse(2));
  call("addPartner-supplier", () => api.addPartner({ role: "supplier", name: " Vendor ", contact: " Ann ", phone: "100", note: "Main" }));
  call("addPartner-customer", () => api.addPartner({ role: "customer", name: " Retail ", contact: " Ben ", phone: "200", note: "Shop" }));
  call("updatePartner", () => api.updatePartner(1, { role: "supplier", name: " Vendor Prime ", contact: " Ann ", phone: "101", note: "Updated" }));
  call("updatePartner-duplicate", () => api.updatePartner(1, { role: "customer", name: "Retail" }));
  call("deactivatePartner", () => api.deactivatePartner(1));
  call("addDepartment", () => api.addDepartment({ code: " sales ", name: " Sales ", type: "sales", note: " front " }));
  call("addDepartment-duplicate", () => api.addDepartment({ code: "SALES", name: "Sales Duplicate", type: "sales" }));
  call("addDepartment-second", () => api.addDepartment({ code: " pur ", name: " Purchasing ", type: "purchasing", note: " buy " }));
  call("addEmployee", () => api.addEmployee({ employeeNo: " s001 ", name: " Ming ", departmentId: "1", role: "sales", note: "rep" }));
  call("addEmployee-missing-dept", () => api.addEmployee({ employeeNo: " x001 ", name: " Missing ", departmentId: "999", role: "sales" }));
  call("addEmployee-second", () => api.addEmployee({ employeeNo: " p001 ", name: " Buyer ", departmentId: "2", role: "purchasing", note: "lead" }));
  call("addPermissionScope", () => api.addPermissionScope({ employeeId: "1", scopeType: "department", departmentIds: [1, "2", 2], actions: [" updateSale ", "approveSale"] }));
  call("addPermissionScope-missing-employee", () => api.addPermissionScope({ employeeId: "999", scopeType: "department", departmentIds: [1], actions: ["updateSale"] }));
  call("deactivateDepartment", () => api.deactivateDepartment(2));
  call("deactivateEmployee", () => api.deactivateEmployee(2));
  call("listProducts", () => api.listProducts({ query: "tea", activeOnly: false }));
  call("listProducts-activeOnly", () => api.listProducts({ activeOnly: true }));
  call("listProductCategories", () => api.listProductCategories({ activeOnly: true }));
  call("listWarehouses", () => api.listWarehouses({ query: "main" }));
  call("listPartners", () => api.listPartners({ role: "supplier", query: "prime" }));
  call("listDepartments", () => api.listDepartments({ query: "sales" }));
  call("listEmployees", () => api.listEmployees({ query: "sales" }));
  call("listPermissionScopes", () => api.listPermissionScopes({ employeeId: 1, activeOnly: true }));
  call("categories", () => api.categories());
  call("updatePreferences", () => api.updatePreferences(preferencesInput));
  call("getPreferences", () => api.getPreferences());

  return {
    outputs,
    state: clone(state)
  };
}

function createFinanceHarness(createFinanceModule) {
  const state = {
    receivables: [],
    payables: [],
    payments: [],
    nextReceivableId: 1,
    nextPayableId: 1,
    nextPaymentId: 1
  };
  const ctx = {
    getReceivables: () => state.receivables,
    setReceivables: (value) => { state.receivables = value; },
    getPayables: () => state.payables,
    setPayables: (value) => { state.payables = value; },
    getPayments: () => state.payments,
    setPayments: (value) => { state.payments = value; },
    nextReceivableId: () => state.nextReceivableId,
    incNextReceivableId: () => { state.nextReceivableId += 1; },
    nextPayableId: () => state.nextPayableId,
    incNextPayableId: () => { state.nextPayableId += 1; },
    nextPaymentId: () => state.nextPaymentId,
    incNextPaymentId: () => { state.nextPaymentId += 1; }
  };
  return { api: createFinanceModule(ctx), state };
}

function runFinanceScenario(createFinanceModule) {
  const { api, state } = createFinanceHarness(createFinanceModule);
  const outputs = [];
  const call = (name, fn) => {
    outputs.push({ name, value: fn() });
  };

  call("addReceivable", () => api.addReceivable({
    sourceType: "sale",
    sourceDocumentNo: " SO-1 ",
    customer: " Retail ",
    amount: "1000",
    paidAmount: "100",
    dueDate: "2026-06-20",
    status: "partial",
    note: " invoice ",
    relatedDocumentNos: [" SO-1 "]
  }));
  call("addReceivable-second", () => api.addReceivable({
    sourceType: "sale",
    sourceDocumentNo: " SO-2 ",
    customer: " Direct ",
    amount: "300",
    paidAmount: "0",
    dueDate: "2026-07-05",
    status: "open",
    note: " second "
  }));
  call("addReceivable-invalid", () => api.addReceivable({
    sourceDocumentNo: "BAD",
    customer: "Bad",
    amount: "0",
    paidAmount: "0",
    dueDate: "2026-06-20"
  }));
  call("addPayable", () => api.addPayable({
    sourceType: "purchase",
    sourceDocumentNo: " PO-1 ",
    supplier: " Vendor ",
    amount: "800",
    paidAmount: "200",
    dueDate: "2026-06-18",
    status: "partial",
    note: " bill ",
    relatedDocumentNos: [" PO-1 "]
  }));
  call("addPayable-invalid", () => api.addPayable({
    sourceDocumentNo: "BAD",
    supplier: "Bad",
    amount: "100",
    paidAmount: "150",
    dueDate: "2026-06-18"
  }));
  call("addPayment-invalid-direction", () => api.addPayment({
    direction: "in",
    targetType: "payable",
    targetId: "1",
    amount: "100",
    method: "Cash",
    date: "2026-06-21"
  }));
  call("addPayment-payable", () => api.addPayment({
    direction: "out",
    targetType: "payable",
    targetId: "1",
    amount: "300",
    method: "Bank",
    date: "2026-06-21",
    note: " settlement "
  }));
  call("addPayment-exceeds", () => api.addPayment({
    direction: "out",
    targetType: "payable",
    targetId: "1",
    amount: "400",
    method: "Bank",
    date: "2026-06-22"
  }));
  call("addPayment-receivable", () => api.addPayment({
    direction: "in",
    targetType: "receivable",
    targetId: "1",
    amount: "500",
    method: "Cash",
    date: "2026-06-23",
    note: " customer pay "
  }));
  call("applyPaymentToTarget", () => {
    api.applyPaymentToTarget({ targetType: "receivable", targetId: 2, amount: 100 });
    return api.listReceivables({ query: "SO-2" })[0];
  });
  call("listReceivables", () => api.listReceivables({ query: "retail", month: "2026-06" }));
  call("listPayables", () => api.listPayables({ status: "partial", month: "2026-06" }));
  call("listPayments", () => api.listPayments({ query: "PO-1", month: "2026-06" }));
  call("financeSummary-before-return", () => api.financeSummary({ month: "2026-06" }));
  call("hasReceivableForDocument-before", () => api.hasReceivableForDocument("SO-1"));
  call("hasPayableForDocument-before", () => api.hasPayableForDocument("PO-1"));
  call("reduceReceivableForReturn", () => {
    api.reduceReceivableForReturn({
      sourceDocumentNo: "SO-1",
      documentNo: "SRTN-1",
      quantity: 2,
      unitPrice: 100
    });
    return api.listReceivables({ query: "SO-1" })[0];
  });
  call("reducePayableForReturn", () => {
    api.reducePayableForReturn({
      sourceDocumentNo: "PO-1",
      documentNo: "PRTN-1",
      quantity: 3,
      unitPrice: 50
    });
    return api.listPayables({ query: "PO-1" })[0];
  });
  call("voidReceivablesForDocument", () => {
    api.voidReceivablesForDocument("SO-1", {
      voidReason: "Customer cancelled",
      voidedAt: "2026-06-24T10:00:00Z",
      voidedBy: "Tester"
    });
    return api.listReceivables({ status: "voided" })[0];
  });
  call("voidPayablesForDocument", () => {
    api.voidPayablesForDocument("PO-1", {
      voidReason: "Vendor cancelled",
      voidedAt: "2026-06-24T11:00:00Z",
      voidedBy: "Tester"
    });
    return api.listPayables({ status: "voided" })[0];
  });
  call("addPayment-voided-target", () => api.addPayment({
    direction: "in",
    targetType: "receivable",
    targetId: "1",
    amount: "100",
    method: "Cash",
    date: "2026-06-25"
  }));
  call("financeSummary-after-void", () => api.financeSummary({ month: "2026-06" }));

  return {
    outputs,
    state: clone(state)
  };
}

function createTransactionsHarness(createTransactionsModule) {
  const state = {
    products: [
      { id: 1, sku: "A001", name: "Coffee", category: "Food", unit: "bag", cost: 100, price: 160, safetyStock: 2, active: true },
      { id: 2, sku: "B001", name: "Tea", category: "Drink", unit: "box", cost: 60, price: 100, safetyStock: 1, active: true }
    ],
    partners: [
      { id: 1, role: "supplier", name: "Vendor Prime", contact: "", phone: "", note: "", active: true },
      { id: 2, role: "customer", name: "Retail Gold", contact: "", phone: "", note: "", active: true }
    ],
    warehouses: [
      { id: 1, code: "MAIN", name: "Main Warehouse", type: "warehouse", note: "", active: true },
      { id: 2, code: "BR", name: "Branch", type: "warehouse", note: "", active: true }
    ],
    purchases: [],
    sales: [],
    adjustments: [],
    transfers: [],
    returns: [],
    costLayers: [],
    receivables: [],
    payables: [],
    nextPurchaseId: 1,
    nextSaleId: 1,
    nextAdjustmentId: 1,
    nextTransferId: 1,
    nextReturnId: 1,
    nextCostLayerId: 1,
    nextReceivableId: 1,
    nextPayableId: 1
  };
  const normalizeText = (value) => String(value || "").trim();
  const normalizeDocumentNoList = (value) => Array.isArray(value) ? value.map(normalizeText).filter(Boolean) : [];
  const mergeDocumentNos = (current, additions) => Array.from(new Set(normalizeDocumentNoList(current).concat(normalizeDocumentNoList(additions))));
  const financeStatus = (amount, paidAmount) => paidAmount <= 0 ? "open" : (paidAmount >= amount ? "paid" : "partial");
  const isDocumentEffective = (row) => !row || !row.status || row.status === "confirmed" || row.status === "amended" || row.status === "voidRequested";
  const isVoidedDocument = (row) => row && (row.status === "voided" || row.status === "reversed");
  const sameDocument = (row, documentNo, id) => {
    if (!row) return false;
    if (documentNo) return row.documentNo === documentNo;
    return row.id === Number(id);
  };
  const expandDocLines = (docs, warehouseIdFilter) => docs
    .filter(isDocumentEffective)
    .flatMap((doc) => {
      if (Array.isArray(doc.lines)) {
        return doc.lines.map((line) => ({ productId: line.productId, warehouseId: doc.warehouseId, quantity: line.quantity }));
      }
      return [{ productId: doc.productId, warehouseId: doc.warehouseId, quantity: doc.quantity }];
    })
    .filter((item) => (!warehouseIdFilter || item.warehouseId === Number(warehouseIdFilter)));
  const stockForProduct = (productId, warehouseId) => {
    const purchased = expandDocLines(state.purchases, warehouseId)
      .filter((item) => item.productId === Number(productId))
      .reduce((sum, item) => sum + item.quantity, 0);
    const sold = expandDocLines(state.sales, warehouseId)
      .filter((item) => item.productId === Number(productId))
      .reduce((sum, item) => sum + item.quantity, 0);
    const salesReturned = state.returns
      .filter(isDocumentEffective)
      .filter((item) => item.documentType === "salesReturn" && item.productId === Number(productId) && (!warehouseId || item.warehouseId === Number(warehouseId)))
      .reduce((sum, item) => sum + item.quantity, 0);
    const purchaseReturned = state.returns
      .filter(isDocumentEffective)
      .filter((item) => item.documentType === "purchaseReturn" && item.productId === Number(productId) && (!warehouseId || item.warehouseId === Number(warehouseId)))
      .reduce((sum, item) => sum + item.quantity, 0);
    const adjusted = state.adjustments
      .filter(isDocumentEffective)
      .filter((item) => item.productId === Number(productId) && (!warehouseId || item.warehouseId === Number(warehouseId)))
      .reduce((sum, item) => sum + item.quantity, 0);
    const transferredIn = state.transfers
      .filter(isDocumentEffective)
      .filter((item) => item.productId === Number(productId) && (!warehouseId || item.toWarehouseId === Number(warehouseId)))
      .reduce((sum, item) => sum + item.quantity, 0);
    const transferredOut = state.transfers
      .filter(isDocumentEffective)
      .filter((item) => item.productId === Number(productId) && (!warehouseId || item.fromWarehouseId === Number(warehouseId)))
      .reduce((sum, item) => sum + item.quantity, 0);
    return { onHand: purchased - purchaseReturned + adjusted + transferredIn - transferredOut - (sold - salesReturned) };
  };
  const transitionDocumentRows = (rows, documentNo, id, action, options) => {
    const lines = rows.filter((item) => sameDocument(item, documentNo, id));
    if (!lines.length) return false;
    if (lines.some((line) => isVoidedDocument(line))) return { error: "DOCUMENT_CLOSED" };
    const currentStatus = normalizeText(lines[0].status) || "confirmed";
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
    const user = normalizeText(options && options.user) || "local-user";
    const reason = normalizeText(options && options.reason);
    const audit = action === "submit" ? { submittedBy: user, submittedAt: "2026-06-01T00:00:00Z" }
      : action === "approve" ? { approvedBy: user, approvedAt: "2026-06-01T00:00:00Z" }
        : action === "reject" ? { rejectedBy: user, rejectedAt: "2026-06-01T00:00:00Z", rejectReason: reason }
          : action === "confirm" ? { confirmedBy: user, confirmedAt: "2026-06-01T00:00:00Z" }
            : action === "requestVoid" ? { voidRequestedBy: user, voidRequestedAt: "2026-06-01T00:00:00Z", voidRequestReason: reason }
              : {};
    const updatedLines = lines.map((line) => Object.assign({}, line, audit, { status: nextStatus }));
    return {
      documentNo,
      lines: updatedLines,
      rows: rows.map((row) => updatedLines.find((line) => line.id === row.id) || row)
    };
  };
  const updateDocumentOwnerRows = (rows, documentNo, id, input) => {
    const lines = rows.filter((item) => sameDocument(item, documentNo, id));
    if (!lines.length) return false;
    if (lines.some((line) => isVoidedDocument(line))) return { error: "DOCUMENT_CLOSED" };
    const ownerEmployeeId = Number(input && input.ownerEmployeeId) || 0;
    const ownerDepartmentId = Number(input && input.ownerDepartmentId) || 0;
    if (!ownerEmployeeId || !ownerDepartmentId) return null;
    const editedBy = Number(input && input.lastEditedByEmployeeId) || ownerEmployeeId;
    const updatedLines = lines.map((line) => Object.assign({}, line, { ownerEmployeeId, ownerDepartmentId, lastEditedByEmployeeId: editedBy }));
    return {
      documentNo,
      lines: updatedLines,
      rows: rows.map((row) => updatedLines.find((line) => line.id === row.id) || row)
    };
  };
  const addPayable = (input) => {
    const payable = {
      id: state.nextPayableId,
      sourceType: normalizeText(input && input.sourceType) || "purchase",
      sourceDocumentNo: normalizeText(input && input.sourceDocumentNo),
      supplier: normalizeText(input && input.supplier),
      amount: Number(input && input.amount) || 0,
      paidAmount: Number(input && input.paidAmount) || 0,
      dueDate: normalizeText(input && input.dueDate),
      status: "open",
      note: normalizeText(input && input.note),
      relatedDocumentNos: []
    };
    state.nextPayableId += 1;
    state.payables = [payable].concat(state.payables);
    return clone(payable);
  };
  const addReceivable = (input) => {
    const receivable = {
      id: state.nextReceivableId,
      sourceType: normalizeText(input && input.sourceType) || "sale",
      sourceDocumentNo: normalizeText(input && input.sourceDocumentNo),
      customer: normalizeText(input && input.customer),
      amount: Number(input && input.amount) || 0,
      paidAmount: Number(input && input.paidAmount) || 0,
      dueDate: normalizeText(input && input.dueDate),
      status: "open",
      note: normalizeText(input && input.note),
      relatedDocumentNos: []
    };
    state.nextReceivableId += 1;
    state.receivables = [receivable].concat(state.receivables);
    return clone(receivable);
  };
  const reduceFinanceForReturn = (rows, sourceDocumentNo, amount, documentNo) => rows.map((row) => {
    if (row.sourceDocumentNo !== sourceDocumentNo || row.status === "voided") return row;
    const nextAmount = Math.max(0, row.amount - amount);
    const nextPaidAmount = Math.min(row.paidAmount, nextAmount);
    return Object.assign({}, row, {
      amount: nextAmount,
      paidAmount: nextPaidAmount,
      status: financeStatus(nextAmount, nextPaidAmount),
      note: `${row.note}; Return ${documentNo}`,
      relatedDocumentNos: mergeDocumentNos(row.relatedDocumentNos, [sourceDocumentNo, documentNo])
    });
  });
  const ctx = {
    getPurchases: () => state.purchases,
    setPurchases: (value) => { state.purchases = value; },
    getSales: () => state.sales,
    setSales: (value) => { state.sales = value; },
    getAdjustments: () => state.adjustments,
    setAdjustments: (value) => { state.adjustments = value; },
    getTransfers: () => state.transfers,
    setTransfers: (value) => { state.transfers = value; },
    getReturns: () => state.returns,
    setReturns: (value) => { state.returns = value; },
    getCostLayers: () => state.costLayers,
    setCostLayers: (value) => { state.costLayers = value; },
    nextPurchaseId: () => state.nextPurchaseId,
    incNextPurchaseId: () => { state.nextPurchaseId += 1; },
    nextSaleId: () => state.nextSaleId,
    incNextSaleId: () => { state.nextSaleId += 1; },
    nextAdjustmentId: () => state.nextAdjustmentId,
    incNextAdjustmentId: () => { state.nextAdjustmentId += 1; },
    nextTransferId: () => state.nextTransferId,
    incNextTransferId: () => { state.nextTransferId += 1; },
    nextReturnId: () => state.nextReturnId,
    incNextReturnId: () => { state.nextReturnId += 1; },
    nextCostLayerId: () => state.nextCostLayerId,
    incNextCostLayerId: () => { state.nextCostLayerId += 1; },
    findProduct: (id) => state.products.find((product) => product.id === Number(id)) || null,
    findPartner: (id) => state.partners.find((partner) => partner.id === Number(id)) || null,
    findWarehouse: (id) => state.warehouses.find((warehouse) => warehouse.id === Number(id)) || null,
    resolveActiveWarehouse: (id) => {
      const warehouse = Number(id)
        ? state.warehouses.find((item) => item.id === Number(id))
        : state.warehouses.find((item) => item.active);
      return warehouse && warehouse.active ? warehouse : null;
    },
    stockForProduct,
    setProductsCost: (productId, cost) => {
      state.products = state.products.map((item) => item.id === productId ? Object.assign({}, item, { cost }) : item);
    },
    addPayable,
    addReceivable,
    reducePayableForReturn: (returnRow) => {
      state.payables = reduceFinanceForReturn(state.payables, returnRow.sourceDocumentNo, returnRow.quantity * returnRow.unitPrice, returnRow.documentNo);
    },
    reduceReceivableForReturn: (returnRow) => {
      state.receivables = reduceFinanceForReturn(state.receivables, returnRow.sourceDocumentNo, returnRow.quantity * returnRow.unitPrice, returnRow.documentNo);
    },
    voidPayablesForDocument: (documentNo, voidInfo) => {
      state.payables = state.payables.map((item) => item.sourceDocumentNo === documentNo
        ? Object.assign({}, item, voidInfo, { relatedDocumentNos: mergeDocumentNos(item.relatedDocumentNos, [documentNo]) })
        : item);
    },
    voidReceivablesForDocument: (documentNo, voidInfo) => {
      state.receivables = state.receivables.map((item) => item.sourceDocumentNo === documentNo
        ? Object.assign({}, item, voidInfo, { relatedDocumentNos: mergeDocumentNos(item.relatedDocumentNos, [documentNo]) })
        : item);
    },
    hasReceivableForDocument: (documentNo) => state.receivables.some((item) => item.sourceDocumentNo === documentNo),
    hasPayableForDocument: (documentNo) => state.payables.some((item) => item.sourceDocumentNo === documentNo),
    isDocumentEffective,
    isVoidedDocument,
    createVoidInfo: (options) => ({
      status: "voided",
      voidReason: normalizeText(options && options.reason) || "未填寫作廢原因",
      voidedAt: "2026-06-30T00:00:00Z",
      voidedBy: normalizeText(options && options.user) || "本機使用者"
    }),
    sameDocument,
    appendNote: (note, addition) => normalizeText(note) ? `${normalizeText(note)}; ${addition}` : addition,
    mergeDocumentNos,
    normalizeDocumentStatus: (status) => {
      const value = normalizeText(status);
      return ["draft", "submitted", "approved", "rejected", "confirmed", "amended", "voidRequested", "voided", "reversed"].includes(value) ? value : "confirmed";
    },
    transitionDocumentRows,
    updateDocumentOwnerRows
  };
  return { api: createTransactionsModule(ctx), state };
}

function runTransactionsScenario(createTransactionsModule) {
  const { api, state } = createTransactionsHarness(createTransactionsModule);
  const outputs = [];
  const call = (name, fn) => {
    outputs.push({ name, value: scrubVolatile(fn()) });
  };

  call("addPurchase", () => api.addPurchase({
    productId: 1,
    warehouseId: 1,
    supplierId: 1,
    quantity: 10,
    unitCost: 120,
    supplier: "Manual",
    date: "2026-06-01",
    documentNo: "PUR-1",
    createPayable: true,
    dueDate: "2026-06-20",
    note: "single"
  }));
  call("addSale", () => api.addSale({
    productId: 1,
    warehouseId: 1,
    customerId: 2,
    quantity: 3,
    unitPrice: 200,
    customer: "Manual Customer",
    date: "2026-06-02",
    documentNo: "SAL-1",
    createReceivable: true,
    dueDate: "2026-06-25",
    note: "single sale"
  }));
  call("addSale-insufficient", () => api.addSale({
    productId: 1,
    warehouseId: 1,
    quantity: 99,
    unitPrice: 200,
    customer: "Retail",
    date: "2026-06-02"
  }));
  call("addPurchaseOrder-draft", () => api.addPurchaseOrder({
    supplierId: 1,
    warehouseId: 1,
    date: "2026-06-03",
    status: "draft",
    createPayable: true,
    ownerEmployeeId: 10,
    ownerDepartmentId: 20,
    items: [{ productId: 2, quantity: 5, unitCost: 70 }]
  }));
  call("transitionPurchase-submit", () => api.transitionPurchase(2, "submit", { user: "Buyer" }));
  call("transitionPurchase-approve", () => api.transitionPurchase(2, "approve", { user: "Lead" }));
  call("transitionPurchase-confirm", () => api.transitionPurchase(2, "confirm", { user: "Warehouse" }));
  call("updatePurchaseOwner", () => api.updatePurchaseOwner(2, { ownerEmployeeId: 11, ownerDepartmentId: 21, lastEditedByEmployeeId: 12 }));
  call("addSaleOrder", () => api.addSaleOrder({
    customerId: 2,
    warehouseId: 1,
    date: "2026-06-04",
    createReceivable: true,
    ownerEmployeeId: 30,
    ownerDepartmentId: 40,
    items: [{ productId: 2, quantity: 2, unitPrice: 150 }]
  }));
  call("transitionSale-invalid", () => api.transitionSale(2, "confirm", { user: "Sales" }));
  call("updateSaleOwner", () => api.updateSaleOwner(2, { ownerEmployeeId: 31, ownerDepartmentId: 41, lastEditedByEmployeeId: 32 }));
  call("addSalesReturn", () => api.addSalesReturn({ sourceLineId: 1, quantity: 1, reason: "Customer return", date: "2026-06-05", user: "Sales" }));
  call("addSalesReturn-too-many", () => api.addSalesReturn({ sourceLineId: 1, quantity: 99, reason: "Too many", date: "2026-06-05" }));
  call("addPurchaseReturn", () => api.addPurchaseReturn({ sourceLineId: 1, quantity: 2, reason: "Vendor return", date: "2026-06-06", user: "Buyer" }));
  call("addPurchaseReturn-too-many", () => api.addPurchaseReturn({ sourceLineId: 1, quantity: 99, reason: "Too many", date: "2026-06-06" }));
  call("addStockAdjustment", () => api.addStockAdjustment({ productId: 1, warehouseId: 1, quantity: 2, reason: "Found", date: "2026-06-07" }));
  call("addStockCount", () => api.addStockCount({ productId: 1, warehouseId: 1, countedQuantity: 10, reason: "", date: "2026-06-08", note: "count" }));
  call("addStockCount-no-diff", () => api.addStockCount({ productId: 1, warehouseId: 1, countedQuantity: 10, reason: "Same", date: "2026-06-08" }));
  call("addTransferOrder", () => api.addTransferOrder({ fromWarehouseId: 1, toWarehouseId: 2, date: "2026-06-09", items: [{ productId: 1, quantity: 2 }], note: "move" }));
  call("addTransferOrder-insufficient", () => api.addTransferOrder({ fromWarehouseId: 1, toWarehouseId: 2, date: "2026-06-09", items: [{ productId: 1, quantity: 99 }] }));
  call("removeSale", () => api.removeSale(1, { reason: "Customer cancelled", user: "Tester" }));
  call("addPayment-voided-receivable-linked", () => state.receivables.find((item) => item.sourceDocumentNo === "SAL-1"));
  call("createVoidReversal-sale", () => api.createVoidReversal("sale", 1, { user: "Tester" }));
  call("findVoidReversal-sale", () => api.findVoidReversal("sale", 1));
  call("removePurchase-negative", () => api.removePurchase(1, { reason: "Too early", user: "Tester" }));
  call("listPurchases", () => api.listPurchases({ query: "Vendor", includeVoided: true }));
  call("listSales", () => api.listSales({ query: "Retail", includeVoided: true }));
  call("listAdjustments", () => api.listAdjustments({ month: "2026-06" }));
  call("listTransfers", () => api.listTransfers({ query: "BR" }));
  call("listReturns", () => api.listReturns({ month: "2026-06" }));
  call("listCostLayers", () => api.listCostLayers({ productId: 1 }));

  return {
    outputs,
    state: scrubVolatile(clone(state))
  };
}

function runInventoryStoreScenario(createInventoryStore) {
  const store = createInventoryStore({
    products: [
      { id: 1, sku: "A001", name: "Coffee", category: "Food", unit: "bag", cost: 100, price: 160, safetyStock: 2, active: true },
      { id: 2, sku: "B001", name: "Tea", category: "Drink", unit: "box", cost: 60, price: 100, safetyStock: 1, active: true }
    ],
    partners: [
      { id: 1, role: "supplier", name: "Vendor Prime", contact: "", phone: "", note: "", active: true },
      { id: 2, role: "customer", name: "Retail Gold", contact: "", phone: "", note: "", active: true }
    ],
    warehouses: [
      { id: 1, code: "MAIN", name: "Main Warehouse", type: "warehouse", note: "", active: true },
      { id: 2, code: "BR", name: "Branch", type: "warehouse", note: "", active: true }
    ],
    purchases: [],
    sales: [],
    adjustments: []
  });
  const outputs = [];
  const call = (name, fn) => {
    outputs.push({ name, value: scrubVolatile(fn()) });
  };

  call("addProduct", () => store.addProduct({ sku: " c001 ", name: " Cocoa ", category: "", unit: "", cost: "40", price: "80", safetyStock: "3" }));
  call("addDepartment", () => store.addDepartment({ code: " sales ", name: " Sales ", type: "sales", note: "front" }));
  call("addEmployee", () => store.addEmployee({ employeeNo: " s001 ", name: " Ming ", departmentId: 1, role: "sales", note: "rep" }));
  call("addPermissionScope", () => store.addPermissionScope({ employeeId: 1, scopeType: "department", departmentIds: [1], actions: ["createSale"] }));
  call("addProductCategory", () => store.addProductCategory({ code: " food ", name: " Food ", sortOrder: 1, note: "main" }));
  call("addWarehouse", () => store.addWarehouse({ code: " overflow ", name: " Overflow ", type: "warehouse", note: "spare" }));
  call("addPartner", () => store.addPartner({ role: "supplier", name: " Backup Vendor ", contact: "Ann", phone: "100", note: "backup" }));
  call("updatePreferences", () => store.updatePreferences({ locale: "en-US", interfaceLanguage: "en", moneyDecimals: 2, currencyPosition: "suffix", reportTitle: "Ops" }));
  call("addPurchaseOrder", () => store.addPurchaseOrder({
    supplierId: 1,
    warehouseId: 1,
    date: "2026-06-01",
    createPayable: true,
    dueDate: "2026-06-20",
    ownerEmployeeId: 1,
    ownerDepartmentId: 1,
    items: [
      { productId: 1, quantity: 10, unitCost: 120 },
      { productId: 2, quantity: 5, unitCost: 70 }
    ]
  }));
  call("addSaleOrder", () => store.addSaleOrder({
    customerId: 2,
    warehouseId: 1,
    date: "2026-06-02",
    createReceivable: true,
    dueDate: "2026-06-25",
    ownerEmployeeId: 1,
    ownerDepartmentId: 1,
    items: [
      { productId: 1, quantity: 3, unitPrice: 200 },
      { productId: 2, quantity: 2, unitPrice: 150 }
    ]
  }));
  call("addPayment-payable", () => store.addPayment({ direction: "out", targetType: "payable", targetId: 1, amount: 400, method: "Bank", date: "2026-06-03" }));
  call("addPayment-receivable", () => store.addPayment({ direction: "in", targetType: "receivable", targetId: 1, amount: 500, method: "Cash", date: "2026-06-04" }));
  call("addSalesReturn", () => store.addSalesReturn({ sourceLineId: 1, quantity: 1, reason: "Customer return", date: "2026-06-05", user: "Sales" }));
  call("addPurchaseReturn", () => store.addPurchaseReturn({ sourceLineId: 1, quantity: 2, reason: "Vendor return", date: "2026-06-06", user: "Buyer" }));
  call("addStockCount", () => store.addStockCount({ productId: 1, warehouseId: 1, countedQuantity: 8, reason: "Count", date: "2026-06-07", note: "shelf" }));
  call("addTransferOrder", () => store.addTransferOrder({ fromWarehouseId: 1, toWarehouseId: 2, date: "2026-06-08", items: [{ productId: 1, quantity: 2 }], note: "move" }));
  call("recordAuditEvent", () => store.recordAuditEvent({
    occurredAt: "2026-06-09T10:00:00Z",
    action: "create",
    entityType: "sale",
    documentNo: "SO-AUDIT",
    summary: "Audit",
    actorName: "Tester",
    riskLevel: "high"
  }));
  call("removeSale", () => store.removeSale(1, { reason: "Customer cancelled", user: "Tester" }));
  call("createVoidReversal", () => store.createVoidReversal("sale", 1, { user: "Tester" }));
  call("listProducts", () => store.listProducts({ query: "coffee" }));
  call("listPurchases", () => store.listPurchases({ includeVoided: true }));
  call("listSales", () => store.listSales({ includeVoided: true }));
  call("listReceivables", () => store.listReceivables({ month: "2026-06" }));
  call("listPayables", () => store.listPayables({ month: "2026-06" }));
  call("listPayments", () => store.listPayments({ month: "2026-06" }));
  call("listReturns", () => store.listReturns({ month: "2026-06" }));
  call("inventoryReport", () => store.inventoryReport({ sort: "sku" }));
  call("dashboard", () => store.dashboard());
  call("grossProfitRanking", () => store.grossProfitRanking(2));
  call("warehouseStockSummary", () => store.warehouseStockSummary({ month: "2026-06" }));
  call("productWarehouseSummary", () => store.productWarehouseSummary());
  call("warehouseTransferSummary", () => store.warehouseTransferSummary({ month: "2026-06" }));
  call("reportSummary", () => store.reportSummary({ month: "2026-06" }));
  call("stockMovements", () => store.stockMovements({ month: "2026-06" }));
  call("exportInventoryRows", () => store.exportInventoryRows());
  call("listAuditLogs", () => store.listAuditLogs({ highRiskOnly: true }));
  call("snapshot", () => store.snapshot());

  return {
    outputs,
    finalSnapshot: scrubVolatile(store.snapshot())
  };
}

export {
  assertNamedMatchesDefault,
  runFinanceScenario,
  runInventoryStoreScenario,
  runMasterScenario,
  runTransactionsScenario
};
