const assert = require("node:assert/strict");
const { createInventoryStore } = require("./core/inventoryStore");
const { createInventoryAccess } = require("./services/inventoryAccess");

let accessUser = { role: "sales", employeeId: 2, departmentId: 2 };
const accessControl = createInventoryAccess({
  getCurrentUser: () => accessUser,
  listPermissionScopes: (employeeId) => employeeId === 3
    ? [{ employeeId: 3, scopeType: "department", departmentIds: [2], employeeIds: [], actions: ["createSalesReturn", "rejectSale", "reassignSaleOwner"], active: true }]
    : []
});
assert.equal(accessControl.canPerform("createSale", {
  targetDocument: { ownerEmployeeId: 2, ownerDepartmentId: 2 }
}), true);
assert.equal(accessControl.canPerform("createSale", {
  targetDocument: { ownerEmployeeId: 4, ownerDepartmentId: 3 }
}), false);
accessUser = { role: "sales", employeeId: 3, departmentId: 2 };
assert.equal(accessControl.canPerform("rejectSale", {
  targetDocument: { ownerEmployeeId: 3, ownerDepartmentId: 2 }
}), false);
assert.equal(accessControl.canPerform("rejectSale", {
  targetDocument: { ownerEmployeeId: 2, ownerDepartmentId: 2 }
}), true);
assert.equal(accessControl.canPerform("reassignSaleOwner", {
  targetDocument: { ownerEmployeeId: 2, ownerDepartmentId: 2 }
}), true);
assert.equal(accessControl.canPerform("createSalesReturn", {
  targetDocument: { ownerEmployeeId: 2, ownerDepartmentId: 2 }
}), true);
assert.equal(accessControl.canPerform("createSalesReturn", {
  targetDocument: { ownerEmployeeId: 4, ownerDepartmentId: 3 }
}), false);

const store = createInventoryStore({
  products: [
    { id: 1, sku: "A001", name: "Coffee Beans", category: "Food", unit: "bag", cost: 250, price: 420, safetyStock: 5, active: true }
  ],
  purchases: [],
  sales: []
});

assert.equal(store.addProduct({ sku: "A001", name: "Duplicate", category: "Food", unit: "bag", cost: 1, price: 2, safetyStock: 0 }), null);
assert.equal(store.addProduct({ sku: "B002", name: "Tea", category: "Drink", unit: "box", cost: 120, price: 260, safetyStock: 3 }).sku, "B002");
assert.equal(store.addProduct({ sku: "", name: "Bad", category: "Other", unit: "pc", cost: 1, price: 2, safetyStock: 0 }), null);
assert.equal(store.addProductCategory({ code: "FOOD", name: "Food", sortOrder: 10, note: "Main" }).name, "Food");
assert.equal(store.addProductCategory({ code: "FOOD", name: "Food Again", sortOrder: 20 }), null);
assert.equal(store.addProductCategory({ code: "DRINK", name: "Drink", sortOrder: 20 }).code, "DRINK");
assert.equal(store.listProductCategories({ activeOnly: true }).length, 2);
assert.equal(store.categories().includes("Drink"), true);
assert.equal(store.deactivateProductCategory(2).active, false);
assert.equal(store.listProductCategories({ activeOnly: true }).length, 1);
assert.equal(store.addWarehouse({ code: "BACK", name: "Back Warehouse", type: "warehouse", note: "Default" }).name, "Back Warehouse");
assert.equal(store.addWarehouse({ code: "BACK", name: "Duplicate Warehouse", type: "store" }), null);
assert.equal(store.addWarehouse({ code: "STORE", name: "Storefront", type: "store" }).type, "store");
assert.equal(store.listWarehouses({ activeOnly: true }).length, 3);
assert.equal(store.listWarehouses({ query: "store" }).length, 1);
assert.equal(store.deactivateWarehouse(2).active, false);
assert.equal(store.listWarehouses({ activeOnly: true }).length, 2);
assert.equal(store.addDepartment({ code: "SALES", name: "Sales", type: "sales", note: "Front line" }).name, "Sales");
assert.equal(store.addDepartment({ code: "SALES", name: "Sales Duplicate", type: "sales" }), null);
assert.equal(store.addDepartment({ code: "PUR", name: "Purchasing", type: "purchasing" }).type, "purchasing");
assert.equal(store.listDepartments({ activeOnly: true }).length, 2);
assert.equal(store.listDepartments({ query: "front" }).length, 1);
assert.equal(store.addEmployee({ employeeNo: "S001", name: "Ming", departmentId: 1, role: "sales", note: "Rep" }).name, "Ming");
assert.equal(store.addEmployee({ employeeNo: "S001", name: "Duplicate", departmentId: 1, role: "sales" }), null);
assert.equal(store.addEmployee({ employeeNo: "P001", name: "Purchasing Lead", departmentId: 2, role: "purchasing" }).role, "purchasing");
assert.equal(store.addEmployee({ employeeNo: "X001", name: "Missing Department", departmentId: 999, role: "sales" }), null);
assert.equal(store.listEmployees({ activeOnly: true }).length, 2);
assert.equal(store.listEmployees({ query: "sales" }).length, 1);
assert.equal(store.addPermissionScope({ employeeId: 1, scopeType: "department", departmentIds: [1], actions: ["updateSale"], note: "Sales supervisor" }).scopeType, "department");
assert.equal(store.addPermissionScope({ employeeId: 999, scopeType: "department", departmentIds: [1] }), null);
assert.equal(store.listPermissionScopes({ employeeId: 1, activeOnly: true }).length, 1);
assert.equal(store.deactivateDepartment(2).active, false);
assert.equal(store.deactivateEmployee(2).canLogin, false);
assert.equal(store.updateProduct(2, { sku: "B002", name: "Tea Box", category: "Drink", unit: "box", cost: 130, price: 280, safetyStock: 4 }).name, "Tea Box");
assert.equal(store.updateProduct(2, { sku: "A001", name: "Bad SKU", category: "Drink", unit: "box", cost: 130, price: 280, safetyStock: 4 }).error, "DUPLICATE_SKU");
assert.equal(store.updateProduct(999, { sku: "X", name: "Missing", category: "Other", unit: "pc", cost: 1, price: 2, safetyStock: 0 }), null);
assert.equal(store.addPartner({ role: "supplier", name: "Vendor", contact: "Ann", phone: "100", note: "Main" }).name, "Vendor");
assert.equal(store.addPartner({ role: "customer", name: "Retail", contact: "Ben", phone: "200", note: "Shop" }).role, "customer");
assert.equal(store.addPartner({ role: "supplier", name: "Vendor" }), null);
assert.equal(store.updatePartner(1, { role: "supplier", name: "Vendor Prime", contact: "Ann", phone: "101", note: "Updated" }).name, "Vendor Prime");
assert.equal(store.listPartners({ role: "supplier", query: "prime" }).length, 1);
assert.equal(store.deactivatePartner(1).active, false);
assert.equal(store.listPartners({ role: "supplier", activeOnly: true }).length, 0);

assert.equal(store.addPurchase({ productId: 1, quantity: 10, unitCost: 260, supplier: "Vendor", date: "2026-05-10", note: "PO-1", ownerEmployeeId: 1, ownerDepartmentId: 1, createdByEmployeeId: 1 }).lines[0].quantity, 10);
assert.equal(store.listPurchases({ query: "vendor" })[0].ownerEmployeeId, 1);
assert.equal(store.listPurchases({ query: "vendor" })[0].ownerDepartmentId, 1);
assert.equal(store.inventoryReport().find((item) => item.productId === 1).onHand, 10);
assert.equal(store.listPurchases({ query: "vendor", month: "2026-05" }).length, 1);
assert.equal(store.listPurchases({ query: "vendor", month: "2026-04" }).length, 0);
assert.equal(store.addPurchase({ productId: 1, quantity: 0, unitCost: 260, supplier: "Vendor", date: "2026-05-10" }), null);
assert.equal(store.addPurchase({ productId: 1, quantity: 1, unitCost: -1, supplier: "Vendor", date: "2026-05-10" }), null);
assert.equal(store.addPurchase({ productId: 1, quantity: 1, unitCost: 260, supplier: "Vendor", date: "bad-date" }), null);
assert.equal(store.addPurchase({ productId: 999, quantity: 1, unitCost: 260, supplier: "Vendor", date: "2026-05-10" }), null);

assert.equal(store.addSale({ productId: 1, quantity: 4, unitPrice: 450, customer: "Retail", date: "2026-05-11", note: "SO-1", ownerEmployeeId: 1, ownerDepartmentId: 1, createdByEmployeeId: 1 }).lines[0].quantity, 4);
assert.equal(store.listSales({ query: "retail" })[0].ownerEmployeeId, 1);
assert.equal(store.listSales({ query: "retail" })[0].ownerDepartmentId, 1);
assert.equal(store.inventoryReport().find((item) => item.productId === 1).onHand, 6);
assert.equal(store.addSale({ productId: 1, quantity: 99, unitPrice: 450, customer: "Retail", date: "2026-05-12" }).error, "INSUFFICIENT_STOCK");
assert.equal(store.addSale({ productId: 1, quantity: 0, unitPrice: 450, customer: "Retail", date: "2026-05-12" }), null);
assert.equal(store.addSale({ productId: 1, quantity: 1, unitPrice: -1, customer: "Retail", date: "2026-05-12" }), null);
assert.equal(store.addSale({ productId: 1, quantity: 1, unitPrice: 450, customer: "Retail", date: "bad-date" }), null);
assert.equal(store.listSales({ query: "retail", month: "2026-05" }).length, 1);
assert.equal(store.listSales({ query: "retail", month: "2026-04" }).length, 0);
assert.equal(store.reportSummary({ month: "2026-05" }).salesRevenue, 1800);
assert.equal(store.reportSummary({ month: "2026-05" }).purchaseCost, 2600);
assert.equal(store.reportSummary({ month: "2026-05" }).salesQuantity, 4);
assert.equal(store.stockMovements({ month: "2026-05" }).length, 2);
assert.equal(store.stockMovements({ query: "vendor" })[0].type, "purchase");
assert.equal(store.stockMovements({ query: "retail" }).some((item) => item.quantity < 0), true);

const stock = store.inventoryReport().find((item) => item.productId === 1);
assert.equal(stock.purchased, 10);
assert.equal(stock.sold, 4);
assert.equal(stock.revenue, 1800);
assert.equal(stock.grossProfit, 760);
assert.equal(stock.lowStock, false);

store.addSale({ productId: 1, quantity: 1, unitPrice: 450, customer: "Retail", date: "2026-05-13" });
assert.equal(store.inventoryReport({ lowStockOnly: true }).some((item) => item.productId === 1), true);
assert.equal(store.exportInventoryRows().some((row) => row.sku === "A001" && row.lowStock === "yes"), true);
assert.equal(store.inventoryReport({ sort: "lowStockFirst" })[0].lowStock, true);
assert.equal(store.inventoryReport({ sort: "grossProfitDesc" })[0].productId, 1);

const dashboard = store.dashboard();
assert.equal(dashboard.activeProducts, 2);
assert.equal(dashboard.lowStockCount >= 1, true);
assert.equal(store.grossProfitRanking(1)[0].product.sku, "A001");
assert.equal(store.removeSale(2), true);
assert.equal(store.inventoryReport().find((item) => item.productId === 1).onHand, 6);
assert.equal(store.snapshot().sales.find((item) => item.id === 2).status, "voided");
assert.equal(store.snapshot().sales.find((item) => item.id === 2).voidReason.length > 0, true);
assert.equal(store.removePurchase(1).error, "NEGATIVE_STOCK");
assert.equal(store.removeSale(1), true);
assert.equal(store.removePurchase(1, { reason: "Wrong receiving", user: "Tester" }), true);
assert.equal(store.inventoryReport().find((item) => item.productId === 1).onHand, 0);
assert.equal(store.snapshot().purchases.length, 1);
assert.equal(store.snapshot().purchases[0].status, "voided");
assert.equal(store.snapshot().purchases[0].voidReason, "Wrong receiving");
assert.equal(store.snapshot().purchases[0].voidedBy, "Tester");
assert.equal(store.listPurchases().length, 0);
assert.equal(store.listPurchases({ includeVoided: true }).length, 1);
assert.equal(store.listSales().length, 0);
assert.equal(store.listSales({ includeVoided: true }).length, 2);
const purchaseReversal = store.createVoidReversal("purchase", 1, { user: "Tester" });
assert.match(purchaseReversal.documentNo, /^PRTN-/);
assert.equal(store.snapshot().purchases[0].status, "reversed");
assert.equal(store.snapshot().purchases[0].reversalDocumentNo, purchaseReversal.documentNo);
assert.equal(store.findVoidReversal("purchase", 1).sourceLineId, 1);
const saleReversal = store.createVoidReversal("sale", 1, { user: "Tester" });
assert.match(saleReversal.documentNo, /^SRTN-/);
assert.equal(store.snapshot().sales.find((item) => item.id === 1).status, "reversed");
assert.equal(store.snapshot().sales.find((item) => item.id === 1).reversalDocumentNo, saleReversal.documentNo);
assert.equal(store.inventoryReport().find((item) => item.productId === 1).onHand, 0);
assert.equal(store.removeSale(999), false);
assert.equal(store.removePurchase(999), false);
assert.equal(store.snapshot().productCategories.length, 2);
assert.equal(store.snapshot().warehouses.length, 3);
assert.equal(store.snapshot().departments.length, 2);
assert.equal(store.snapshot().employees.length, 2);
assert.equal(store.snapshot().permissionScopes.length, 1);
const auditEvent = store.recordAuditEvent({
  action: "create",
  entityType: "purchase",
  documentNo: "PO-AUDIT-001",
  summary: "Audit test",
  actorName: "Tester",
  actorEmployeeId: 1,
  actorDepartmentId: 1,
  roleAtOperation: "owner",
  riskLevel: "high"
});
assert.equal(auditEvent.auditId, 1);
assert.equal(auditEvent.actorEmployeeId, 1);
assert.equal(auditEvent.actorDepartmentId, 1);
assert.equal(store.listAuditLogs({ highRiskOnly: true }).length, 1);
assert.equal(store.listAuditLogs({ query: "PO-AUDIT-001" })[0].summary, "Audit test");

const orderStore = createInventoryStore({
  products: [
    { id: 1, sku: "A001", name: "Coffee Beans", category: "Food", unit: "bag", cost: 250, price: 420, safetyStock: 5, active: true },
    { id: 2, sku: "B002", name: "Tea Box", category: "Drink", unit: "box", cost: 120, price: 260, safetyStock: 3, active: true }
  ],
  purchases: [],
  sales: []
});
const purchaseOrder = orderStore.addPurchaseOrder({
  supplier: "Vendor Prime",
  date: "2026-05-14",
  note: "PO batch",
  ownerEmployeeId: 4,
  ownerDepartmentId: 3,
  createdByEmployeeId: 4,
  items: [
    { productId: 1, quantity: 2, unitCost: 270 },
    { productId: 2, quantity: 3, unitCost: 140 }
  ]
});
assert.equal(purchaseOrder.documentNo, "PO-202605-001");
assert.equal(purchaseOrder.lines.length, 2);
assert.equal(purchaseOrder.lines.reduce((s, l) => s + l.quantity * l.unitCost, 0), 960);
assert.equal(purchaseOrder.ownerEmployeeId === 4 && purchaseOrder.ownerDepartmentId === 3, true);
assert.equal(orderStore.listPurchases({ query: "PO-202605-001" }).length, 1);

const saleOrder = orderStore.addSaleOrder({
  customer: "Retail",
  date: "2026-05-15",
  note: "SO batch",
  ownerEmployeeId: 2,
  ownerDepartmentId: 2,
  createdByEmployeeId: 2,
  items: [
    { productId: 1, quantity: 1, unitPrice: 460 },
    { productId: 2, quantity: 2, unitPrice: 290 }
  ]
});
assert.equal(saleOrder.documentNo, "SO-202605-001");
assert.equal(saleOrder.lines.length, 2);
assert.equal(saleOrder.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0), 1040);
assert.equal(saleOrder.ownerEmployeeId === 2 && saleOrder.ownerDepartmentId === 2, true);
assert.equal(orderStore.listSales({ query: "SO-202605-001" }).length, 1);
assert.equal(orderStore.addSaleOrder({ customer: "Retail", date: "2026-05-16", items: [{ productId: 2, quantity: 99, unitPrice: 290 }] }).error, "INSUFFICIENT_STOCK");
assert.equal(orderStore.addPurchaseOrder({ warehouseId: 999, supplier: "Vendor Prime", date: "2026-05-16", items: [{ productId: 1, quantity: 1, unitCost: 270 }] }), null);
assert.equal(orderStore.addSaleOrder({ warehouseId: 999, customer: "Retail", date: "2026-05-16", items: [{ productId: 1, quantity: 1, unitPrice: 460 }] }), null);
assert.equal(orderStore.addPurchaseOrder({ supplier: "Vendor Prime", date: "2026-05-16", items: [{ productId: 1, quantity: 0, unitCost: 270 }] }), null);

const financeStore = createInventoryStore({
  products: [
    { id: 1, sku: "A001", name: "Coffee Beans", category: "Food", unit: "bag", cost: 250, price: 420, safetyStock: 5, active: true }
  ],
  purchases: [],
  sales: []
});
financeStore.addPurchaseOrder({
  supplier: "Vendor Prime",
  date: "2026-05-20",
  dueDate: "2026-06-05",
  createPayable: true,
  items: [{ productId: 1, quantity: 4, unitCost: 250 }]
});
financeStore.addSaleOrder({
  customer: "Retail",
  date: "2026-05-21",
  dueDate: "2026-06-10",
  createReceivable: true,
  items: [{ productId: 1, quantity: 2, unitPrice: 450 }]
});
assert.equal(financeStore.listPayables({ query: "Vendor" })[0].amount, 1000);
assert.equal(financeStore.listReceivables({ status: "open" })[0].amount, 900);
assert.equal(financeStore.addPayment({ direction: "out", targetType: "payable", targetId: 1, amount: 400, method: "Bank", date: "2026-05-22" }).amount, 400);
assert.equal(financeStore.listPayables({ status: "partial" })[0].paidAmount, 400);
assert.equal(financeStore.addPayment({ direction: "out", targetType: "payable", targetId: 1, amount: 700, method: "Bank", date: "2026-05-23" }).error, "PAYMENT_EXCEEDS_BALANCE");
assert.equal(financeStore.addPayment({ direction: "in", targetType: "payable", targetId: 1, amount: 100, method: "Cash", date: "2026-05-23" }).error, "INVALID_PAYMENT_DIRECTION");
assert.equal(financeStore.addPayment({ direction: "in", targetType: "receivable", targetId: 1, amount: 900, method: "Cash", date: "2026-05-24" }).amount, 900);
assert.equal(financeStore.listReceivables({ status: "paid" })[0].paidAmount, 900);
assert.equal(financeStore.listPayments({ query: "SO-202605-001" }).length, 1);
assert.equal(financeStore.financeSummary({ month: "2026-05" }).cashIn, 900);
assert.equal(financeStore.financeSummary({ month: "2026-05" }).cashOut, 400);
assert.equal(financeStore.snapshot().payments.length, 2);
assert.equal(financeStore.updatePreferences({
  locale: "en-US",
  interfaceLanguage: "zh-Hant",
  quantityDecimals: 2,
  moneyDecimals: 2,
  thousandsSeparator: ",",
  decimalSeparator: ".",
  currencyCode: "USD",
  currencySymbol: "US$",
  currencyPosition: "suffix",
  reportTitle: "Monthly Finance",
  reportHeaderText: "HQ",
  reportFooterText: "Internal",
  showPrintDate: false
}).moneyDecimals, 2);
assert.equal(financeStore.getPreferences().locale, "en-US");
assert.equal(financeStore.getPreferences().currencyPosition, "suffix");
assert.equal(financeStore.getPreferences().reportTitle, "Monthly Finance");
assert.equal(financeStore.snapshot().preferences.showPrintDate, false);

const voidFinanceStore = createInventoryStore({
  products: [
    { id: 1, sku: "A001", name: "Coffee Beans", category: "Food", unit: "bag", cost: 250, price: 420, safetyStock: 5, active: true }
  ],
  purchases: [],
  sales: []
});
voidFinanceStore.addPurchaseOrder({
  supplier: "Vendor Prime",
  date: "2026-05-25",
  dueDate: "2026-06-05",
  createPayable: true,
  items: [{ productId: 1, quantity: 2, unitCost: 250 }]
});
voidFinanceStore.addSaleOrder({
  customer: "Retail",
  date: "2026-05-26",
  dueDate: "2026-06-10",
  createReceivable: true,
  items: [{ productId: 1, quantity: 1, unitPrice: 450 }]
});
assert.equal(voidFinanceStore.removeSale(1, { reason: "Customer cancelled", user: "Tester" }), true);
assert.equal(voidFinanceStore.listReceivables({ status: "voided" })[0].voidReason, "Customer cancelled");
assert.equal(voidFinanceStore.addPayment({ direction: "in", targetType: "receivable", targetId: 1, amount: 100, method: "Cash", date: "2026-05-27" }), null);
assert.equal(voidFinanceStore.removePurchase(1, { reason: "Receiving cancelled", user: "Tester" }), true);
assert.equal(voidFinanceStore.listPayables({ status: "voided" })[0].voidedBy, "Tester");
assert.equal(voidFinanceStore.financeSummary({ month: "2026-06" }).receivableBalance, 0);

const approvalStore = createInventoryStore({
  products: [
    { id: 1, sku: "A001", name: "Coffee Beans", category: "Food", unit: "bag", cost: 250, price: 420, safetyStock: 5, active: true }
  ],
  purchases: [],
  sales: []
});
const draftPurchase = approvalStore.addPurchaseOrder({
  supplier: "Vendor Prime",
  date: "2026-05-28",
  dueDate: "2026-06-15",
  createPayable: true,
  status: "draft",
  createdBy: "Buyer",
  items: [{ productId: 1, quantity: 5, unitCost: 240 }]
});
assert.equal(draftPurchase.documentNo, "PO-202605-001");
assert.equal(approvalStore.updatePurchaseOwner(1, { ownerEmployeeId: 5, ownerDepartmentId: 3, lastEditedByEmployeeId: 5 })[0].ownerEmployeeId, 5);
assert.equal(approvalStore.inventoryReport().find((item) => item.productId === 1).onHand, 0);
assert.equal(approvalStore.listPayables().length, 0);
assert.equal(approvalStore.transitionPurchase(1, "submit", { user: "Buyer" })[0].status, "submitted");
assert.equal(approvalStore.transitionPurchase(1, "approve", { user: "Owner" })[0].status, "approved");
assert.equal(approvalStore.transitionPurchase(1, "confirm", { user: "Owner" })[0].status, "confirmed");
assert.equal(approvalStore.inventoryReport().find((item) => item.productId === 1).onHand, 5);
assert.equal(approvalStore.listPayables()[0].amount, 1200);

const draftSale = approvalStore.addSaleOrder({
  customer: "Retail",
  date: "2026-05-29",
  dueDate: "2026-06-20",
  createReceivable: true,
  status: "draft",
  createdBy: "Sales",
  items: [{ productId: 1, quantity: 2, unitPrice: 450 }]
});
assert.equal(draftSale.documentNo, "SO-202605-001");
assert.equal(approvalStore.updateSaleOwner(1, { ownerEmployeeId: 3, ownerDepartmentId: 2, lastEditedByEmployeeId: 3 })[0].ownerDepartmentId, 2);
assert.equal(approvalStore.inventoryReport().find((item) => item.productId === 1).onHand, 5);
assert.equal(approvalStore.transitionSale(1, "submit", { user: "Sales" })[0].status, "submitted");
assert.equal(approvalStore.transitionSale(1, "reject", { user: "Owner", reason: "Missing customer PO" })[0].rejectReason, "Missing customer PO");
assert.equal(approvalStore.transitionSale(1, "submit", { user: "Sales" })[0].status, "submitted");
assert.equal(approvalStore.transitionSale(1, "approve", { user: "Owner" })[0].status, "approved");
assert.equal(approvalStore.transitionSale(1, "confirm", { user: "Owner" })[0].status, "confirmed");
assert.equal(approvalStore.inventoryReport().find((item) => item.productId === 1).onHand, 3);
assert.equal(approvalStore.listReceivables()[0].amount, 900);
assert.equal(approvalStore.transitionSale(1, "requestVoid", { user: "Sales", reason: "Customer requested cancellation" })[0].status, "voidRequested");
assert.equal(approvalStore.updateSaleOwner(1, { ownerEmployeeId: 2, ownerDepartmentId: 2, lastEditedByEmployeeId: 2 }).error, "DOCUMENT_CLOSED");
assert.equal(approvalStore.inventoryReport().find((item) => item.productId === 1).onHand, 3);

const returnStore = createInventoryStore({
  products: [
    { id: 1, sku: "A001", name: "Coffee Beans", category: "Food", unit: "bag", cost: 250, price: 420, safetyStock: 5, active: true }
  ],
  purchases: [],
  sales: []
});
returnStore.addPurchaseOrder({
  supplier: "Vendor Prime",
  date: "2026-05-30",
  dueDate: "2026-06-15",
  createPayable: true,
  items: [{ productId: 1, quantity: 10, unitCost: 250 }]
});
returnStore.addSaleOrder({
  customer: "Retail",
  date: "2026-05-31",
  dueDate: "2026-06-20",
  createReceivable: true,
  items: [{ productId: 1, quantity: 4, unitPrice: 450 }]
});
assert.equal(returnStore.inventoryReport().find((item) => item.productId === 1).onHand, 6);
const salesReturn = returnStore.addSalesReturn({ sourceLineId: 1, quantity: 1, reason: "Customer return", date: "2026-06-01", user: "Sales" });
assert.equal(salesReturn.documentNo, "SRTN-202606-001");
assert.equal(returnStore.inventoryReport().find((item) => item.productId === 1).onHand, 7);
assert.equal(returnStore.listReceivables()[0].amount, 1350);
assert.equal(returnStore.addSalesReturn({ sourceLineId: 1, quantity: 4, reason: "Too many", date: "2026-06-01" }).error, "RETURN_QUANTITY_EXCEEDS_SOURCE");
const purchaseReturn = returnStore.addPurchaseReturn({ sourceLineId: 1, quantity: 2, reason: "Vendor return", date: "2026-06-02", user: "Buyer" });
assert.equal(purchaseReturn.documentNo, "PRTN-202606-001");
assert.equal(returnStore.inventoryReport().find((item) => item.productId === 1).onHand, 5);
assert.equal(returnStore.listPayables()[0].amount, 2000);
assert.equal(returnStore.addPurchaseReturn({ sourceLineId: 1, quantity: 99, reason: "Too many", date: "2026-06-02" }).error, "RETURN_QUANTITY_EXCEEDS_SOURCE");
assert.equal(returnStore.listReturns({ documentType: "salesReturn" }).length, 1);
assert.equal(returnStore.stockMovements({ query: "SRTN-202606-001" })[0].type, "salesReturn");
const juneReturnSummary = returnStore.reportSummary({ month: "2026-06" });
assert.equal(juneReturnSummary.salesRevenue, -450);
assert.equal(juneReturnSummary.purchaseCost, -500);
assert.equal(juneReturnSummary.grossProfit, -200);

const costingStore = createInventoryStore({
  products: [
    { id: 1, sku: "A001", name: "Coffee Beans", category: "Food", unit: "bag", cost: 100, price: 220, safetyStock: 5, active: true }
  ],
  purchases: [],
  sales: []
});
costingStore.addPurchaseOrder({
  supplier: "Vendor Prime",
  date: "2026-06-03",
  items: [{ productId: 1, quantity: 5, unitCost: 100 }]
});
const firstCostLayer = costingStore.listCostLayers()[0];
assert.equal(firstCostLayer.method, "standardCost");
assert.equal(firstCostLayer.unitCost, 100);
const firstCostedSale = costingStore.addSaleOrder({
  customer: "Retail",
  date: "2026-06-04",
  items: [{ productId: 1, quantity: 2, unitPrice: 220 }]
});
assert.equal(firstCostedSale.lines[0].costBasis.method, "standardCost");
assert.equal(firstCostedSale.lines[0].costBasis.unitCost, 100);
assert.equal(costingStore.reportSummary({ month: "2026-06" }).grossProfit, 240);
costingStore.addPurchaseOrder({
  supplier: "Vendor Prime",
  date: "2026-06-05",
  items: [{ productId: 1, quantity: 2, unitCost: 180 }]
});
assert.equal(costingStore.listProducts().find((item) => item.id === 1).cost, 180);
assert.equal(costingStore.reportSummary({ month: "2026-06" }).grossProfit, 240);
assert.equal(costingStore.snapshot().sales[0].lines[0].costBasis.unitCost, 100);
assert.equal(costingStore.snapshot().costLayers.length, 2);

const warehouseStore = createInventoryStore({
  products: [
    { id: 1, sku: "A001", name: "Coffee Beans", category: "Food", unit: "bag", cost: 250, price: 420, safetyStock: 5, active: true }
  ],
  warehouses: [
    { id: 1, code: "MAIN", name: "Main Warehouse", type: "warehouse", note: "", active: true },
    { id: 2, code: "STORE", name: "Storefront", type: "store", note: "", active: true }
  ],
  purchases: [],
  sales: [],
  adjustments: []
});
warehouseStore.addPurchase({ productId: 1, warehouseId: 1, quantity: 10, unitCost: 250, supplier: "Vendor", date: "2026-05-10" });
warehouseStore.addPurchase({ productId: 1, warehouseId: 2, quantity: 5, unitCost: 250, supplier: "Vendor", date: "2026-05-10" });
assert.equal(warehouseStore.inventoryReport({ warehouseId: 1 }).find((item) => item.productId === 1).onHand, 10);
assert.equal(warehouseStore.inventoryReport({ warehouseId: 2 }).find((item) => item.productId === 1).onHand, 5);
assert.equal(warehouseStore.addSale({ productId: 1, warehouseId: 2, quantity: 3, unitPrice: 450, customer: "Retail", date: "2026-05-11" }).lines[0].quantity, 3);
assert.equal(warehouseStore.inventoryReport({ warehouseId: 2 }).find((item) => item.productId === 1).onHand, 2);
assert.equal(warehouseStore.inventoryReport({ warehouseId: 1 }).find((item) => item.productId === 1).onHand, 10);
assert.equal(warehouseStore.addSale({ productId: 1, warehouseId: 2, quantity: 99, unitPrice: 450, customer: "Retail", date: "2026-05-12" }).error, "INSUFFICIENT_STOCK");
assert.equal(warehouseStore.addStockCount({ productId: 1, warehouseId: 1, countedQuantity: 8, reason: "Count", date: "2026-05-13" }).quantity, -2);
assert.equal(warehouseStore.inventoryReport({ warehouseId: 1 }).find((item) => item.productId === 1).onHand, 8);
assert.equal(warehouseStore.addPurchase({ productId: 1, warehouseId: 999, quantity: 1, unitCost: 250, supplier: "Vendor", date: "2026-05-10" }), null);
assert.equal(warehouseStore.addSale({ productId: 1, warehouseId: 999, quantity: 1, unitPrice: 450, customer: "Retail", date: "2026-05-11" }), null);
assert.equal(warehouseStore.addStockCount({ productId: 1, warehouseId: 999, countedQuantity: 1, reason: "Count", date: "2026-05-13" }), null);
const transferOrder = warehouseStore.addTransferOrder({
  fromWarehouseId: 1,
  toWarehouseId: 2,
  date: "2026-05-14",
  note: "Move to store",
  items: [{ productId: 1, quantity: 3 }]
});
assert.equal(transferOrder.documentNo, "TRF-202605-001");
assert.equal(transferOrder.lines.length, 1);
assert.equal(transferOrder.totalQuantity, 3);
assert.equal(warehouseStore.inventoryReport({ warehouseId: 1 }).find((item) => item.productId === 1).onHand, 5);
assert.equal(warehouseStore.inventoryReport({ warehouseId: 2 }).find((item) => item.productId === 1).onHand, 5);
assert.equal(warehouseStore.addTransferOrder({ fromWarehouseId: 1, toWarehouseId: 2, date: "2026-05-14", items: [{ productId: 1, quantity: 99 }] }).error, "INSUFFICIENT_STOCK");
assert.equal(warehouseStore.addTransferOrder({ fromWarehouseId: 1, toWarehouseId: 1, date: "2026-05-14", items: [{ productId: 1, quantity: 1 }] }), null);
assert.equal(warehouseStore.listTransfers({ query: "TRF-202605-001" }).length, 1);
assert.equal(warehouseStore.stockMovements({ query: "TRF-202605-001" }).length, 2);
const transferSummary = warehouseStore.warehouseTransferSummary({ month: "2026-05" });
assert.equal(transferSummary.find((item) => item.warehouse.code === "MAIN").transferredOut, 3);
assert.equal(transferSummary.find((item) => item.warehouse.code === "STORE").transferredIn, 3);
assert.equal(transferSummary.find((item) => item.warehouse.code === "STORE").netTransfer, 3);
assert.equal(warehouseStore.listSales({ query: "store" }).length, 1);
assert.equal(warehouseStore.stockMovements({ query: "STORE" }).some((item) => item.warehouseName === "Storefront"), true);
assert.equal(warehouseStore.exportInventoryRows().some((row) => row.warehouse.includes("STORE")), true);
const warehouseSummary = warehouseStore.warehouseStockSummary();
assert.equal(warehouseSummary.find((item) => item.warehouse.code === "MAIN").onHand, 5);
assert.equal(warehouseSummary.find((item) => item.warehouse.code === "STORE").onHand, 5);
assert.equal(warehouseStore.warehouseStockSummary({ warehouseId: 2 }).length, 1);
const productDistribution = warehouseStore.productWarehouseSummary().find((item) => item.productId === 1);
assert.equal(productDistribution.totalOnHand, 10);
assert.equal(productDistribution.warehouses.length, 2);
assert.equal(warehouseStore.exportInventoryRows({ warehouseId: 2 }).every((row) => row.warehouse.includes("STORE")), true);

const inactiveWarehouseStore = createInventoryStore({
  products: [
    { id: 1, sku: "A001", name: "Coffee Beans", category: "Food", unit: "bag", cost: 250, price: 420, safetyStock: 5, active: true }
  ],
  warehouses: [
    { id: 1, code: "MAIN", name: "Main Warehouse", type: "warehouse", note: "", active: true },
    { id: 2, code: "OLD", name: "Closed Warehouse", type: "warehouse", note: "", active: false }
  ],
  purchases: [],
  sales: [],
  adjustments: []
});
assert.equal(inactiveWarehouseStore.addPurchase({ productId: 1, warehouseId: 2, quantity: 1, unitCost: 250, supplier: "Vendor", date: "2026-05-10" }), null);
assert.equal(inactiveWarehouseStore.addSale({ productId: 1, warehouseId: 2, quantity: 1, unitPrice: 450, customer: "Retail", date: "2026-05-11" }), null);
assert.equal(inactiveWarehouseStore.addStockCount({ productId: 1, warehouseId: 2, countedQuantity: 1, reason: "Count", date: "2026-05-13" }), null);

const adjustmentStore = createInventoryStore({
  products: [
    { id: 1, sku: "A001", name: "Coffee Beans", category: "Food", unit: "bag", cost: 250, price: 420, safetyStock: 5, active: true }
  ],
  purchases: [
    { id: 1, productId: 1, quantity: 10, unitCost: 250, supplier: "Vendor", date: "2026-05-10", note: "Start" }
  ],
  sales: [
    { id: 1, productId: 1, quantity: 4, unitPrice: 450, customer: "Retail", date: "2026-05-11", note: "Sold" }
  ],
  adjustments: []
});
const stockCount = adjustmentStore.addStockCount({
  productId: 1,
  countedQuantity: 8,
  reason: "Count",
  date: "2026-05-12",
  note: "Shelf count"
});
assert.equal(stockCount.documentNo, "ADJ-202605-001");
assert.equal(stockCount.quantity, 2);
assert.equal(adjustmentStore.inventoryReport().find((item) => item.productId === 1).adjusted, 2);
assert.equal(adjustmentStore.inventoryReport().find((item) => item.productId === 1).onHand, 8);
assert.equal(adjustmentStore.listAdjustments({ query: "shelf", month: "2026-05" }).length, 1);
assert.equal(adjustmentStore.stockMovements({ query: "ADJ-202605-001" })[0].type, "adjustment");
assert.equal(adjustmentStore.addStockCount({ productId: 1, countedQuantity: 8, reason: "Same", date: "2026-05-13" }).error, "NO_DIFFERENCE");
assert.equal(adjustmentStore.exportInventoryRows()[0].adjusted, 2);

// ── Bug fix: 進貨作廢後 product.cost 正確回補 ──────────────────────────────
const costRevertStore = createInventoryStore({
  products: [{ id: 1, sku: "X001", name: "Item", category: "Food", unit: "pc", cost: 100, price: 200, safetyStock: 0, active: true }],
  purchases: [], sales: []
});
const cr1 = costRevertStore.addPurchase({ productId: 1, quantity: 5, unitCost: 200, supplier: "S", date: "2026-01-01" });
assert.equal(costRevertStore.listProducts().find((p) => p.id === 1).cost, 200);
const cr2 = costRevertStore.addPurchase({ productId: 1, quantity: 3, unitCost: 300, supplier: "S", date: "2026-01-02" });
assert.equal(costRevertStore.listProducts().find((p) => p.id === 1).cost, 300);
costRevertStore.removePurchase(cr2.id, { reason: "test", user: "test" });
assert.equal(costRevertStore.listProducts().find((p) => p.id === 1).cost, 200, "cost should revert to previous effective purchase unitCost");
costRevertStore.removePurchase(cr1.id, { reason: "test", user: "test" });
assert.equal(costRevertStore.listProducts().find((p) => p.id === 1).cost, 200, "cost unchanged when no effective purchase remains");

// ── Bug fix: 退貨金額邊界 paidAmount 不超過新 amount ─────────────────────────
const returnBoundaryStore = createInventoryStore({
  products: [{ id: 1, sku: "X001", name: "Item", category: "Food", unit: "pc", cost: 100, price: 200, safetyStock: 0, active: true }],
  purchases: [], sales: []
});
returnBoundaryStore.addPurchaseOrder({
  supplier: "Vendor",
  date: "2026-02-01",
  dueDate: "2026-02-28",
  createPayable: true,
  items: [{ productId: 1, quantity: 10, unitCost: 100 }]
});
returnBoundaryStore.addPayment({ direction: "out", targetType: "payable", targetId: 1, amount: 800, method: "Wire", date: "2026-02-10" });
assert.equal(returnBoundaryStore.listPayables()[0].paidAmount, 800);
returnBoundaryStore.addPurchaseReturn({ sourceLineId: 1, quantity: 5, reason: "Defect", date: "2026-02-15", user: "Buyer" });
const afterReturn = returnBoundaryStore.listPayables()[0];
assert.equal(afterReturn.amount, 500, "payable amount reduced by return");
assert.ok(afterReturn.paidAmount <= afterReturn.amount, "paidAmount must not exceed new amount");
assert.equal(afterReturn.paidAmount, 500, "paidAmount clamped to new amount");
assert.equal(afterReturn.status, "paid", "status reflects fully settled");

// ── Bug fix: costLayers.remainingQuantity 隨銷貨遞減 ──────────────────────────
const layerStore = createInventoryStore({
  products: [{ id: 1, sku: "X001", name: "Item", category: "Food", unit: "pc", cost: 100, price: 200, safetyStock: 0, active: true }],
  purchases: [], sales: []
});
layerStore.addPurchaseOrder({ supplier: "S", date: "2026-03-01", items: [{ productId: 1, quantity: 10, unitCost: 100 }] });
assert.equal(layerStore.listCostLayers()[0].remainingQuantity, 10, "full quantity before any sale");
layerStore.addSaleOrder({ customer: "C", date: "2026-03-02", items: [{ productId: 1, quantity: 3, unitPrice: 200 }] });
assert.equal(layerStore.listCostLayers()[0].remainingQuantity, 7, "remainingQuantity decremented by sale qty");
layerStore.addSaleOrder({ customer: "C", date: "2026-03-03", items: [{ productId: 1, quantity: 7, unitPrice: 200 }] });
assert.equal(layerStore.listCostLayers()[0].remainingQuantity, 0, "layer fully consumed");

// ── supplierId / customerId FK 自動帶入名稱 ──────────────────────────────────
const fkStore = createInventoryStore({
  products: [{ id: 1, sku: "X001", name: "Item", category: "Food", unit: "pc", cost: 100, price: 200, safetyStock: 0, active: true }],
  partners: [
    { id: 1, role: "supplier", name: "優質供應商", contact: "", phone: "", note: "", active: true },
    { id: 2, role: "customer", name: "黃金客戶", contact: "", phone: "", note: "", active: true }
  ],
  purchases: [], sales: []
});
const fkPurchase = fkStore.addPurchase({ productId: 1, quantity: 5, unitCost: 100, supplierId: 1, date: "2026-04-01" });
assert.equal(fkPurchase.supplierName, "優質供應商", "supplier name auto-filled from supplierId");
assert.equal(fkPurchase.supplierId, 1, "supplierId stored on purchase");
const fkSaleOrder = fkStore.addSaleOrder({ customerId: 2, date: "2026-04-02", items: [{ productId: 1, quantity: 2, unitPrice: 200 }] });
assert.equal(fkSaleOrder.customerName, "黃金客戶", "customer name auto-filled from customerId");
assert.equal(fkSaleOrder.customerId, 2, "customerId stored on sale");
const fkPurchaseTextOnly = fkStore.addPurchase({ productId: 1, quantity: 1, unitCost: 100, supplier: "手動輸入商", date: "2026-04-03" });
assert.equal(fkPurchaseTextOnly.supplierName, "手動輸入商", "fallback to text when no supplierId");
assert.equal(fkPurchaseTextOnly.supplierId, 0, "supplierId defaults to 0");

// ── Models split (master/finance/transaction) 合併 export 完整性 ────────────────
const models = require("./core/inventoryModels");
["normalizeProduct", "copyProduct", "normalizeWarehouse", "normalizePartner", "normalizeEmployee"].forEach((fn) => {
  assert.equal(typeof models[fn], "function", `master model export missing: ${fn}`);
});
["normalizeReceivable", "copyReceivable", "normalizePayable", "normalizePayment", "financeStatus"].forEach((fn) => {
  assert.equal(typeof models[fn], "function", `finance model export missing: ${fn}`);
});
["normalizePurchase", "copyPurchase", "normalizeSale", "normalizeReturn", "normalizeDocumentStatus", "defaultPreferences"].forEach((fn) => {
  assert.equal(typeof models[fn], "function", `transaction/shared model export missing: ${fn}`);
});
["purchaseDocTotal", "saleDocTotal", "isVoidedDocument", "returnableQuantity", "docReturnStatus"].forEach((fn) => {
  assert.equal(typeof models[fn], "function", `document helper missing: ${fn}`);
});
assert.equal(typeof models.remainingBalance, "function", "finance model export missing: remainingBalance");

// ── purchaseDocTotal / saleDocTotal ───────────────────────────────────────────
const docWithLines = { lines: [{ quantity: 3, unitCost: 100 }, { quantity: 2, unitCost: 50 }] };
assert.equal(models.purchaseDocTotal(docWithLines), 400, "purchaseDocTotal: 3*100 + 2*50");
assert.equal(models.purchaseDocTotal({ lines: [] }), 0, "purchaseDocTotal: empty lines");
assert.equal(models.purchaseDocTotal({}), 0, "purchaseDocTotal: no lines field");
const saleDocWithLines = { lines: [{ quantity: 4, unitPrice: 200 }, { quantity: 1, unitPrice: 80 }] };
assert.equal(models.saleDocTotal(saleDocWithLines), 880, "saleDocTotal: 4*200 + 1*80");
assert.equal(models.saleDocTotal({ lines: [] }), 0, "saleDocTotal: empty lines");

// ── isVoidedDocument ─────────────────────────────────────────────────────────
assert.equal(models.isVoidedDocument({ status: "voided" }), true, "isVoidedDocument: voided");
assert.equal(models.isVoidedDocument({ status: "reversed" }), true, "isVoidedDocument: reversed");
assert.equal(models.isVoidedDocument({ status: "confirmed" }), false, "isVoidedDocument: confirmed");
assert.equal(models.isVoidedDocument(null), false, "isVoidedDocument: null-safe");

// ── remainingBalance ──────────────────────────────────────────────────────────
assert.equal(models.remainingBalance({ amount: 1000, paidAmount: 400 }), 600, "remainingBalance: partial");
assert.equal(models.remainingBalance({ amount: 500, paidAmount: 500 }), 0, "remainingBalance: fully paid");
assert.equal(models.remainingBalance({ amount: 200, paidAmount: 0 }), 200, "remainingBalance: unpaid");
assert.equal(models.remainingBalance(null), 0, "remainingBalance: null-safe");

// ── returnableQuantity ────────────────────────────────────────────────────────
const rqLine = { lineId: 10, quantity: 5 };
const rqReturns = [
  { sourceLineId: 10, quantity: 2 },
  { sourceLineId: 10, quantity: 1 }
];
assert.equal(models.returnableQuantity(rqLine, rqReturns), 2, "returnableQuantity: 5-2-1=2");
assert.equal(models.returnableQuantity(rqLine, []), 5, "returnableQuantity: no returns");
assert.equal(models.returnableQuantity(rqLine, [{ sourceLineId: 10, quantity: 5 }]), 0, "returnableQuantity: fully returned");
assert.equal(models.returnableQuantity(null, []), 0, "returnableQuantity: null-safe");

// ── docReturnStatus ───────────────────────────────────────────────────────────
const drsDoc = { lines: [{ lineId: 1, quantity: 3 }, { lineId: 2, quantity: 4 }] };
const drsReturnsNone = [];
const drsReturnsPartial = [{ sourceLineId: 1, quantity: 2 }];
const drsReturnsFull = [{ sourceLineId: 1, quantity: 3 }, { sourceLineId: 2, quantity: 4 }];
assert.equal(models.docReturnStatus(drsDoc, drsReturnsNone).status, "none", "docReturnStatus: none");
assert.equal(models.docReturnStatus(drsDoc, drsReturnsPartial).status, "partial", "docReturnStatus: partial");
assert.equal(models.docReturnStatus(drsDoc, drsReturnsFull).status, "full", "docReturnStatus: full");
assert.equal(models.docReturnStatus(drsDoc, drsReturnsPartial).remaining, 5, "docReturnStatus: remaining=5");
assert.equal(models.docReturnStatus(drsDoc, drsReturnsPartial).totalReturned, 2, "docReturnStatus: totalReturned=2");
assert.equal(models.docReturnStatus(null, []).status, "none", "docReturnStatus: null-safe");

// ── ③ salesReturn/purchaseReturn writes back to source doc relatedDocumentNos ─
{
  const saleDocs = returnStore.listSales({ includeVoided: false });
  const saleDoc = saleDocs.find((d) => d.lines.some((l) => l.lineId === 1));
  assert.ok(Array.isArray(saleDoc.relatedDocumentNos), "sale relatedDocumentNos is array");
  assert.ok(saleDoc.relatedDocumentNos.includes("SRTN-202606-001"), "sale relatedDocumentNos includes return doc");
  const purchaseDocs = returnStore.listPurchases({ includeVoided: false });
  const purchaseDoc = purchaseDocs.find((d) => d.lines.some((l) => l.lineId === 1));
  assert.ok(purchaseDoc.relatedDocumentNos.includes("PRTN-202606-001"), "purchase relatedDocumentNos includes return doc");
}

console.log("All tests passed.");

console.log("inventoryStore tests passed");
