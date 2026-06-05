import assert from "node:assert/strict";
import { createRequire } from "node:module";

import inventoryUtils, {
  nextDocumentNo,
  nextId,
  nonNegativeNumber,
  normalizeDate,
  normalizeOrderItems,
  normalizeText,
  positiveNumber
} from "./esm/inventoryUtils.mjs";
import inventoryModelsMaster, {
  copyDepartment,
  copyEmployee,
  copyPartner,
  copyPermissionScope,
  copyProduct,
  copyProductCategory,
  copyWarehouse,
  normalizeDepartment,
  normalizeDepartmentType,
  normalizeEmployee,
  normalizeEmployeeRole,
  normalizePartner,
  normalizePermissionScope,
  normalizeProduct,
  normalizeProductCategory,
  normalizeWarehouse,
  sameCategory,
  sameDepartment,
  sameEmployee,
  samePartner,
  sameSku,
  sameWarehouse
} from "./esm/inventoryModelsMaster.mjs";
import inventoryModelsFinance, {
  copyPayable,
  copyPayment,
  copyReceivable,
  financeStatus,
  normalizeFinanceStatus,
  normalizePayable,
  normalizePayment,
  normalizeReceivable,
  remainingBalance
} from "./esm/inventoryModelsFinance.mjs";
import inventoryModels, {
  copyAdjustment,
  copyDocumentHeader,
  copyPurchase,
  copyPurchaseDoc,
  copyPurchaseLine,
  copyReturn,
  copySale,
  copySaleDoc,
  copySaleLine,
  copyTransfer,
  defaultPreferences,
  defaultWarehouse,
  ensureWarehouseOnRow,
  flatPurchaseToDoc,
  flatSaleToDoc,
  groupFlatPurchasesToDocs,
  groupFlatSalesToDocs,
  loadPurchaseDocs,
  loadSaleDocs,
  purchaseDocTotal,
  saleDocTotal,
  isVoidedDocument,
  normalizeAdjustment,
  normalizeDocumentNoList,
  normalizeDocumentStatus,
  normalizePreferences,
  normalizePurchase,
  normalizeReturn,
  normalizeSale,
  normalizeTransfer
} from "./esm/inventoryModels.mjs";
import inventoryReports, {
  dashboard,
  exportInventoryRows,
  grossProfitRanking,
  inventoryReport,
  productWarehouseSummary,
  reportSummary,
  stockForProduct,
  stockMovements,
  warehouseStockSummary,
  warehouseTransferSummary
} from "./esm/inventoryReports.mjs";
import inventoryStoreMaster, {
  createMasterModule as createEsmMasterModule
} from "./esm/inventoryStoreMaster.mjs";
import inventoryStoreFinance, {
  createFinanceModule as createEsmFinanceModule
} from "./esm/inventoryStoreFinance.mjs";
import inventoryStoreTransactions, {
  createTransactionsModule as createEsmTransactionsModule
} from "./esm/inventoryStoreTransactions.mjs";
import inventoryStore, {
  createInventoryStore as createEsmInventoryStore
} from "./esm/inventoryStore.mjs";
import {
  assertNamedMatchesDefault,
  runFinanceScenario,
  runInventoryStoreScenario,
  runMasterScenario,
  runTransactionsScenario
} from "./esmTestHelpers.mjs";

const require = createRequire(import.meta.url);
const cjsUtils = require("./core/inventoryUtils.js");
const cjsModelsMaster = require("./core/inventoryModelsMaster.js");
const cjsModelsFinance = require("./core/inventoryModelsFinance.js");
const cjsModels = require("./core/inventoryModels.js");
const cjsReports = require("./core/inventoryReports.js");
const cjsStoreMaster = require("./core/inventoryStoreMaster.js");
const cjsStoreFinance = require("./core/inventoryStoreFinance.js");
const cjsStoreTransactions = require("./core/inventoryStoreTransactions.js");
const cjsStore = require("./core/inventoryStore.js");

const utilsExportedNames = [
  "nextDocumentNo",
  "nextId",
  "nonNegativeNumber",
  "normalizeDate",
  "normalizeOrderItems",
  "normalizeText",
  "positiveNumber"
];
const masterExportedNames = [
  "copyDepartment",
  "copyEmployee",
  "copyPartner",
  "copyPermissionScope",
  "copyProduct",
  "copyProductCategory",
  "copyWarehouse",
  "normalizeDepartment",
  "normalizeDepartmentType",
  "normalizeEmployee",
  "normalizeEmployeeRole",
  "normalizePartner",
  "normalizePermissionScope",
  "normalizeProduct",
  "normalizeProductCategory",
  "normalizeWarehouse",
  "sameCategory",
  "sameDepartment",
  "sameEmployee",
  "samePartner",
  "sameSku",
  "sameWarehouse"
];
const financeExportedNames = [
  "copyPayable",
  "copyPayment",
  "copyReceivable",
  "financeStatus",
  "normalizeFinanceStatus",
  "normalizePayable",
  "normalizePayment",
  "normalizeReceivable",
  "remainingBalance"
];
const combinedOwnExportedNames = [
  "copyAdjustment",
  "copyDocumentHeader",
  "copyPurchase",
  "copyPurchaseDoc",
  "copyPurchaseLine",
  "copyReturn",
  "copySale",
  "copySaleDoc",
  "copySaleLine",
  "copyTransfer",
  "defaultPreferences",
  "defaultWarehouse",
  "ensureWarehouseOnRow",
  "flatPurchaseToDoc",
  "flatSaleToDoc",
  "groupFlatPurchasesToDocs",
  "groupFlatSalesToDocs",
  "loadPurchaseDocs",
  "loadSaleDocs",
  "purchaseDocTotal",
  "saleDocTotal",
  "isVoidedDocument",
  "normalizeAdjustment",
  "normalizeDocumentNoList",
  "normalizeDocumentStatus",
  "normalizePreferences",
  "normalizePurchase",
  "normalizeReturn",
  "normalizeSale",
  "normalizeTransfer"
];
const combinedExportedNames = [
  ...masterExportedNames,
  ...financeExportedNames,
  ...combinedOwnExportedNames
].sort();
const reportsExportedNames = [
  "dashboard",
  "exportInventoryRows",
  "grossProfitRanking",
  "inventoryReport",
  "productWarehouseSummary",
  "reportSummary",
  "stockForProduct",
  "stockMovements",
  "warehouseStockSummary",
  "warehouseTransferSummary"
];
const storeMasterExportedNames = [
  "createMasterModule"
];
const storeFinanceExportedNames = [
  "createFinanceModule"
];
const storeTransactionsExportedNames = [
  "createTransactionsModule"
];
const storeExportedNames = [
  "createInventoryStore"
];

assert.deepEqual(Object.keys(inventoryUtils).sort(), utilsExportedNames);
assert.deepEqual(Object.keys(inventoryModelsMaster).sort(), masterExportedNames);
assert.deepEqual(Object.keys(inventoryModelsFinance).sort(), financeExportedNames);
assert.deepEqual(Object.keys(inventoryModels).sort(), combinedExportedNames);
assert.deepEqual(Object.keys(inventoryReports).sort(), reportsExportedNames);
assert.deepEqual(Object.keys(inventoryStoreMaster).sort(), storeMasterExportedNames);
assert.deepEqual(Object.keys(inventoryStoreFinance).sort(), storeFinanceExportedNames);
assert.deepEqual(Object.keys(inventoryStoreTransactions).sort(), storeTransactionsExportedNames);
assert.deepEqual(Object.keys(inventoryStore).sort(), storeExportedNames);
const combinedNamedExports = {
  copyAdjustment,
  copyDepartment,
  copyDocumentHeader,
  copyEmployee,
  copyPartner,
  copyPayable,
  copyPayment,
  copyPermissionScope,
  copyProduct,
  copyProductCategory,
  copyPurchase,
  copyPurchaseDoc,
  copyPurchaseLine,
  copyReceivable,
  copyReturn,
  copySale,
  copySaleDoc,
  copySaleLine,
  copyTransfer,
  copyWarehouse,
  defaultPreferences,
  defaultWarehouse,
  ensureWarehouseOnRow,
  financeStatus,
  flatPurchaseToDoc,
  flatSaleToDoc,
  groupFlatPurchasesToDocs,
  groupFlatSalesToDocs,
  loadPurchaseDocs,
  loadSaleDocs,
  purchaseDocTotal,
  saleDocTotal,
  isVoidedDocument,
  remainingBalance,
  normalizeAdjustment,
  normalizeDepartment,
  normalizeDepartmentType,
  normalizeDocumentNoList,
  normalizeDocumentStatus,
  normalizeEmployee,
  normalizeEmployeeRole,
  normalizeFinanceStatus,
  normalizePartner,
  normalizePayable,
  normalizePayment,
  normalizePermissionScope,
  normalizePreferences,
  normalizeProduct,
  normalizeProductCategory,
  normalizePurchase,
  normalizeReceivable,
  normalizeReturn,
  normalizeSale,
  normalizeTransfer,
  normalizeWarehouse,
  sameCategory,
  sameDepartment,
  sameEmployee,
  samePartner,
  sameSku,
  sameWarehouse
};
assertNamedMatchesDefault(assert, combinedNamedExports, inventoryModels);

const rows = [
  { id: 2, documentNo: "PO-202606-001" },
  { id: 8, documentNo: "PO-202606-004" },
  { id: "not-a-number", documentNo: "SO-202606-009" }
];
const items = [
  { productId: 1, quantity: "2", unitPrice: "150" },
  { productId: 0, quantity: "2", unitPrice: "150" },
  { productId: 2, quantity: "-1", unitPrice: "30" },
  { productId: 3, quantity: "1", unitPrice: "" }
];

assert.equal(nextId(rows), cjsUtils.nextId(rows));
assert.equal(normalizeText("  Coffee  "), cjsUtils.normalizeText("  Coffee  "));
assert.equal(positiveNumber("12.5"), cjsUtils.positiveNumber("12.5"));
assert.equal(positiveNumber("0"), cjsUtils.positiveNumber("0"));
assert.equal(nonNegativeNumber("0"), cjsUtils.nonNegativeNumber("0"));
assert.equal(nonNegativeNumber("-1"), cjsUtils.nonNegativeNumber("-1"));
assert.equal(normalizeDate("2026-06-03"), cjsUtils.normalizeDate("2026-06-03"));
assert.equal(normalizeDate("2026/06/03"), cjsUtils.normalizeDate("2026/06/03"));
assert.deepEqual(normalizeOrderItems(items, "unitPrice"), cjsUtils.normalizeOrderItems(items, "unitPrice"));
assert.equal(nextDocumentNo("PO", "2026-06-03", rows), cjsUtils.nextDocumentNo("PO", "2026-06-03", rows));

const productInput = { sku: " a-001 ", name: " Coffee Beans ", category: "", unit: "", cost: "120", price: "180", safetyStock: "5" };
const categoryInput = { code: " food ", name: " Food ", sortOrder: "2", note: " shelf " };
const warehouseInput = { code: " main ", name: " Main Warehouse ", type: "", note: " default " };
const partnerInput = { role: "customer", name: " Retail ", contact: " Amy ", phone: "123", note: " vip " };
const departmentInput = { code: " sales ", name: " Sales ", type: "sales", parentDepartmentId: "1", managerEmployeeId: "2", note: " front " };
const employeeInput = { employeeNo: " e001 ", name: " Ada ", departmentId: "3", role: "sales", managerEmployeeId: "2", note: " lead " };
const scopeInput = { employeeId: "7", scopeType: "department", departmentIds: [1, "2", 2, 0], employeeIds: [3, "4", 4], actions: [" createSale ", "createSale", "approveSale"] };

assert.deepEqual(normalizeProduct(productInput, 1), cjsModelsMaster.normalizeProduct(productInput, 1));
assert.deepEqual(copyProduct(normalizeProduct(productInput, 1)), cjsModelsMaster.copyProduct(cjsModelsMaster.normalizeProduct(productInput, 1)));
assert.deepEqual(normalizeProductCategory(categoryInput, 2), cjsModelsMaster.normalizeProductCategory(categoryInput, 2));
assert.deepEqual(copyProductCategory(normalizeProductCategory(categoryInput, 2)), cjsModelsMaster.copyProductCategory(cjsModelsMaster.normalizeProductCategory(categoryInput, 2)));
assert.deepEqual(normalizeWarehouse(warehouseInput, 3), cjsModelsMaster.normalizeWarehouse(warehouseInput, 3));
assert.deepEqual(copyWarehouse(normalizeWarehouse(warehouseInput, 3)), cjsModelsMaster.copyWarehouse(cjsModelsMaster.normalizeWarehouse(warehouseInput, 3)));
assert.deepEqual(normalizePartner(partnerInput, 4), cjsModelsMaster.normalizePartner(partnerInput, 4));
assert.deepEqual(copyPartner(normalizePartner(partnerInput, 4)), cjsModelsMaster.copyPartner(cjsModelsMaster.normalizePartner(partnerInput, 4)));
assert.deepEqual(normalizeDepartment(departmentInput, 5), cjsModelsMaster.normalizeDepartment(departmentInput, 5));
assert.deepEqual(copyDepartment(normalizeDepartment(departmentInput, 5)), cjsModelsMaster.copyDepartment(cjsModelsMaster.normalizeDepartment(departmentInput, 5)));
assert.deepEqual(normalizeEmployee(employeeInput, 6), cjsModelsMaster.normalizeEmployee(employeeInput, 6));
assert.deepEqual(copyEmployee(normalizeEmployee(employeeInput, 6)), cjsModelsMaster.copyEmployee(cjsModelsMaster.normalizeEmployee(employeeInput, 6)));
assert.deepEqual(normalizePermissionScope(scopeInput, 7), cjsModelsMaster.normalizePermissionScope(scopeInput, 7));
assert.deepEqual(copyPermissionScope(normalizePermissionScope(scopeInput, 7)), cjsModelsMaster.copyPermissionScope(cjsModelsMaster.normalizePermissionScope(scopeInput, 7)));

assert.equal(normalizeDepartmentType("unknown"), cjsModelsMaster.normalizeDepartmentType("unknown"));
assert.equal(normalizeEmployeeRole("unknown"), cjsModelsMaster.normalizeEmployeeRole("unknown"));
assert.equal(sameSku(" a-001 ", "A-001"), cjsModelsMaster.sameSku(" a-001 ", "A-001"));
assert.equal(sameCategory({ code: "food", name: "Food" }, { code: "FOOD", name: "Other" }), cjsModelsMaster.sameCategory({ code: "food", name: "Food" }, { code: "FOOD", name: "Other" }));
assert.equal(sameWarehouse({ code: "main", name: "Main" }, { code: "MAIN", name: "Other" }), cjsModelsMaster.sameWarehouse({ code: "main", name: "Main" }, { code: "MAIN", name: "Other" }));
assert.equal(samePartner({ role: "customer", name: "Retail" }, { role: "customer", name: " retail " }), cjsModelsMaster.samePartner({ role: "customer", name: "Retail" }, { role: "customer", name: " retail " }));
assert.equal(sameDepartment({ code: "sales", name: "Sales" }, { code: "SALES", name: "Other" }), cjsModelsMaster.sameDepartment({ code: "sales", name: "Sales" }, { code: "SALES", name: "Other" }));
assert.equal(sameEmployee({ employeeNo: "e001" }, { employeeNo: " E001 " }), cjsModelsMaster.sameEmployee({ employeeNo: "e001" }, { employeeNo: " E001 " }));

const receivableInput = {
  sourceType: "",
  sourceDocumentNo: " SO-202606-001 ",
  customer: " Retail ",
  amount: "1200",
  paidAmount: "300",
  dueDate: "2026-06-20",
  status: "open",
  note: " first bill ",
  relatedDocumentNos: [" SO-202606-001 ", "", "SRTN-202606-001"]
};
const payableInput = {
  sourceType: "",
  sourceDocumentNo: " PO-202606-001 ",
  supplier: " Vendor ",
  amount: "900",
  paidAmount: "900",
  dueDate: "2026-06-18",
  status: "partial",
  note: " paid ",
  relatedDocumentNos: ["PO-202606-001", " PRTN-202606-001 "]
};
const voidedReceivableInput = Object.assign({}, receivableInput, {
  paidAmount: "0",
  status: "voided",
  voidReason: " duplicate ",
  voidedAt: "2026-06-21T10:00:00Z",
  voidedBy: " auditor "
});
const paymentInput = {
  direction: "out",
  targetType: "payable",
  targetId: "9",
  amount: "450",
  method: " transfer ",
  date: "2026-06-19",
  note: " settlement "
};

assert.equal(financeStatus(1200, 0), cjsModelsFinance.financeStatus(1200, 0));
assert.equal(financeStatus(1200, 300), cjsModelsFinance.financeStatus(1200, 300));
assert.equal(financeStatus(1200, 1200), cjsModelsFinance.financeStatus(1200, 1200));
assert.equal(normalizeFinanceStatus("voided", 1200, 0), cjsModelsFinance.normalizeFinanceStatus("voided", 1200, 0));
assert.equal(normalizeFinanceStatus("partial", 1200, 0), cjsModelsFinance.normalizeFinanceStatus("partial", 1200, 0));
assert.deepEqual(normalizeReceivable(receivableInput, 8), cjsModelsFinance.normalizeReceivable(receivableInput, 8));
assert.deepEqual(copyReceivable(normalizeReceivable(receivableInput, 8)), cjsModelsFinance.copyReceivable(cjsModelsFinance.normalizeReceivable(receivableInput, 8)));
assert.deepEqual(normalizeReceivable(voidedReceivableInput, 9), cjsModelsFinance.normalizeReceivable(voidedReceivableInput, 9));
assert.deepEqual(normalizePayable(payableInput, 10), cjsModelsFinance.normalizePayable(payableInput, 10));
assert.deepEqual(copyPayable(normalizePayable(payableInput, 10)), cjsModelsFinance.copyPayable(cjsModelsFinance.normalizePayable(payableInput, 10)));
assert.deepEqual(normalizePayment(paymentInput, 11), cjsModelsFinance.normalizePayment(paymentInput, 11));
assert.deepEqual(copyPayment(normalizePayment(paymentInput, 11)), cjsModelsFinance.copyPayment(cjsModelsFinance.normalizePayment(paymentInput, 11)));
assert.equal(normalizeReceivable(Object.assign({}, receivableInput, { paidAmount: "1300" }), 12), cjsModelsFinance.normalizeReceivable(Object.assign({}, receivableInput, { paidAmount: "1300" }), 12));
assert.equal(normalizePayable(Object.assign({}, payableInput, { dueDate: "2026/06/18" }), 13), cjsModelsFinance.normalizePayable(Object.assign({}, payableInput, { dueDate: "2026/06/18" }), 13));
assert.equal(normalizePayment(Object.assign({}, paymentInput, { targetId: "0" }), 14), cjsModelsFinance.normalizePayment(Object.assign({}, paymentInput, { targetId: "0" }), 14));

const purchaseInput = {
  productId: "1",
  warehouseId: "2",
  supplierId: "4",
  quantity: "10",
  unitCost: "125.5",
  supplier: " Supplier A ",
  date: "2026-06-03",
  note: " replenishment ",
  documentNo: " PO-202606-005 ",
  status: "submitted",
  createPayable: true,
  dueDate: "2026-06-30",
  createdBy: " buyer ",
  ownerEmployeeId: "6",
  ownerDepartmentId: "3",
  createdByEmployeeId: "6",
  lastEditedByEmployeeId: "7",
  submittedBy: "buyer",
  submittedAt: "2026-06-03T09:00:00Z",
  approvedBy: "manager",
  approvedAt: "2026-06-03T10:00:00Z",
  rejectedBy: "",
  rejectedAt: "",
  rejectReason: "",
  confirmedBy: "warehouse",
  confirmedAt: "2026-06-03T11:00:00Z",
  voidRequestedBy: "",
  voidRequestedAt: "",
  voidRequestReason: "",
  receivedQuantity: "8"
};
const saleInput = {
  productId: "1",
  warehouseId: "2",
  customerId: "5",
  quantity: "3",
  unitPrice: "220",
  customer: " Retail B ",
  date: "2026-06-04",
  note: " delivery ",
  documentNo: " SO-202606-006 ",
  status: "approved",
  costBasis: { method: "", unitCost: "120", quantity: "3", totalCost: "", source: "", capturedAt: "2026-06-04T08:00:00Z" },
  createReceivable: true,
  dueDate: "2026-07-04",
  createdBy: " sales ",
  ownerEmployeeId: "8",
  ownerDepartmentId: "2",
  createdByEmployeeId: "8",
  lastEditedByEmployeeId: "9",
  submittedBy: "sales",
  submittedAt: "2026-06-04T09:00:00Z",
  approvedBy: "lead",
  approvedAt: "2026-06-04T10:00:00Z",
  rejectedBy: "",
  rejectedAt: "",
  rejectReason: "",
  confirmedBy: "warehouse",
  confirmedAt: "2026-06-04T11:00:00Z",
  voidRequestedBy: "",
  voidRequestedAt: "",
  voidRequestReason: "",
  shippedQuantity: "2",
  commissionStatus: " pending "
};
const adjustmentInput = {
  productId: "1",
  warehouseId: "2",
  quantity: "-2.4",
  reason: "",
  date: "2026-06-05",
  note: " count variance ",
  documentNo: " ADJ-202606-001 ",
  status: "draft",
  createdBy: " auditor ",
  createdByEmployeeId: "10"
};
const transferInput = {
  productId: "1",
  fromWarehouseId: "2",
  toWarehouseId: "3",
  quantity: "4",
  date: "2026-06-06",
  note: " branch replenishment ",
  documentNo: " TRF-202606-001 ",
  status: "confirmed",
  createdBy: " warehouse ",
  createdByEmployeeId: "11"
};
const returnInput = {
  documentType: "salesReturn",
  documentNo: " SRTN-202606-001 ",
  sourceDocumentNo: " SO-202606-006 ",
  sourceLineId: "2",
  productId: "1",
  warehouseId: "2",
  quantity: "1",
  unitAmount: "220",
  costBasis: { totalCost: "120", quantity: "1" },
  reason: " damaged ",
  date: "2026-06-07",
  inspectionStatus: "",
  createdBy: " service ",
  confirmedBy: " warehouse ",
  relatedDocumentNos: [" SO-202606-006 ", "", " RMA-1 "],
  status: "amended"
};
const preferencesInput = {
  locale: " en-US ",
  interfaceLanguage: "en",
  quantityDecimals: "8",
  moneyDecimals: "2.2",
  thousandsSeparator: " ",
  decimalSeparator: ",",
  currencyCode: " USD ",
  currencySymbol: " US$ ",
  currencyPosition: "suffix",
  reportTitle: " Monthly Report ",
  reportHeaderText: " Header ",
  reportFooterText: " Footer ",
  showPrintDate: false,
  dateFormat: "DD/MM/YYYY"
};

assert.deepEqual(normalizePurchase(purchaseInput, 15), cjsModels.normalizePurchase(purchaseInput, 15));
assert.deepEqual(copyPurchase(normalizePurchase(purchaseInput, 15)), cjsModels.copyPurchase(cjsModels.normalizePurchase(purchaseInput, 15)));
assert.deepEqual(inventoryModels.normalizePurchase(purchaseInput, 15), cjsModels.normalizePurchase(purchaseInput, 15));
assert.equal(normalizePurchase(Object.assign({}, purchaseInput, { quantity: "0" }), 16), cjsModels.normalizePurchase(Object.assign({}, purchaseInput, { quantity: "0" }), 16));

assert.deepEqual(normalizeSale(saleInput, 17), cjsModels.normalizeSale(saleInput, 17));
assert.deepEqual(copySale(normalizeSale(saleInput, 17)), cjsModels.copySale(cjsModels.normalizeSale(saleInput, 17)));
assert.deepEqual(inventoryModels.normalizeSale(saleInput, 17), cjsModels.normalizeSale(saleInput, 17));
assert.equal(normalizeSale(Object.assign({}, saleInput, { unitPrice: "-1" }), 18), cjsModels.normalizeSale(Object.assign({}, saleInput, { unitPrice: "-1" }), 18));

assert.deepEqual(normalizeAdjustment(adjustmentInput, 19), cjsModels.normalizeAdjustment(adjustmentInput, 19));
assert.deepEqual(copyAdjustment(normalizeAdjustment(adjustmentInput, 19)), cjsModels.copyAdjustment(cjsModels.normalizeAdjustment(adjustmentInput, 19)));
assert.deepEqual(inventoryModels.normalizeAdjustment(adjustmentInput, 19), cjsModels.normalizeAdjustment(adjustmentInput, 19));
assert.equal(normalizeAdjustment(Object.assign({}, adjustmentInput, { quantity: "0" }), 20), cjsModels.normalizeAdjustment(Object.assign({}, adjustmentInput, { quantity: "0" }), 20));

assert.deepEqual(normalizeTransfer(transferInput, 21), cjsModels.normalizeTransfer(transferInput, 21));
assert.deepEqual(copyTransfer(normalizeTransfer(transferInput, 21)), cjsModels.copyTransfer(cjsModels.normalizeTransfer(transferInput, 21)));
assert.deepEqual(inventoryModels.normalizeTransfer(transferInput, 21), cjsModels.normalizeTransfer(transferInput, 21));
assert.equal(normalizeTransfer(Object.assign({}, transferInput, { toWarehouseId: "2" }), 22), cjsModels.normalizeTransfer(Object.assign({}, transferInput, { toWarehouseId: "2" }), 22));

assert.deepEqual(normalizeReturn(returnInput, 23), cjsModels.normalizeReturn(returnInput, 23));
assert.deepEqual(copyReturn(normalizeReturn(returnInput, 23)), cjsModels.copyReturn(cjsModels.normalizeReturn(returnInput, 23)));
assert.deepEqual(inventoryModels.normalizeReturn(returnInput, 23), cjsModels.normalizeReturn(returnInput, 23));
assert.equal(normalizeReturn(Object.assign({}, returnInput, { documentType: "other" }), 24), cjsModels.normalizeReturn(Object.assign({}, returnInput, { documentType: "other" }), 24));

assert.deepEqual(defaultPreferences(), cjsModels.defaultPreferences());
assert.deepEqual(normalizePreferences(preferencesInput), cjsModels.normalizePreferences(preferencesInput));
assert.deepEqual(inventoryModels.normalizePreferences(preferencesInput), cjsModels.normalizePreferences(preferencesInput));
assert.deepEqual(defaultWarehouse(), cjsModels.defaultWarehouse());
assert.deepEqual(ensureWarehouseOnRow({ productId: 1, warehouseId: 0 }, 3), cjsModels.ensureWarehouseOnRow({ productId: 1, warehouseId: 0 }, 3));
assert.equal(normalizeDocumentStatus("unknown"), cjsModels.normalizeDocumentStatus("unknown"));
assert.deepEqual(normalizeDocumentNoList([" A ", "", "B"]), cjsModels.normalizeDocumentNoList([" A ", "", "B"]));

const reportState = {
  products: [
    { id: 1, sku: "A-001", name: "Coffee", category: "Food", unit: "bag", cost: 100, price: 160, safetyStock: 2, active: true },
    { id: 2, sku: "B-001", name: "Tea", category: "Food", unit: "box", cost: 60, price: 100, safetyStock: 5, active: false }
  ],
  warehouses: [
    { id: 1, code: "MAIN", name: "Main", type: "warehouse", note: "", active: true },
    { id: 2, code: "BR", name: "Branch", type: "warehouse", note: "", active: true }
  ],
  purchases: [
    { id: 1, productId: 1, warehouseId: 1, quantity: 5, unitCost: 100, supplier: "Vendor", date: "2026-06-01", note: "po", documentNo: "PO-1", status: "confirmed" },
    { id: 2, productId: 2, warehouseId: 2, quantity: 4, unitCost: 60, supplier: "Vendor", date: "2026-05-01", note: "old", documentNo: "PO-OLD", status: "voided" }
  ],
  sales: [
    { id: 1, productId: 1, warehouseId: 1, quantity: 2, unitPrice: 160, customer: "Retail", date: "2026-06-02", note: "so", documentNo: "SO-1", status: "confirmed", costBasis: { unitCost: 100 } },
    { id: 2, productId: 1, warehouseId: 2, quantity: 1, unitPrice: 160, customer: "Retail", date: "2026-06-03", note: "draft", documentNo: "SO-DRAFT", status: "draft", costBasis: { unitCost: 100 } }
  ],
  adjustments: [
    { id: 1, productId: 1, warehouseId: 1, quantity: 1, reason: "Count", date: "2026-06-03", note: "adj", documentNo: "ADJ-1", status: "confirmed" }
  ],
  transfers: [
    { id: 1, productId: 1, fromWarehouseId: 1, toWarehouseId: 2, quantity: 1, date: "2026-06-04", note: "move", documentNo: "TRF-1", status: "confirmed" }
  ],
  returns: [
    { id: 1, documentType: "salesReturn", productId: 1, warehouseId: 1, quantity: 1, unitPrice: 160, costBasis: { unitCost: 100 }, reason: "Return", date: "2026-06-05", documentNo: "SRTN-1", sourceDocumentNo: "SO-1", status: "confirmed" },
    { id: 2, documentType: "purchaseReturn", productId: 1, warehouseId: 1, quantity: 1, unitPrice: 100, reason: "Return", date: "2026-06-06", documentNo: "PRTN-1", sourceDocumentNo: "PO-1", status: "confirmed" }
  ]
};

assert.deepEqual(inventoryReport(reportState, { sort: "sku" }), cjsReports.inventoryReport(reportState, { sort: "sku" }));
assert.deepEqual(inventoryReport(reportState, { query: "main", lowStockOnly: true, sort: "lowStockFirst" }), cjsReports.inventoryReport(reportState, { query: "main", lowStockOnly: true, sort: "lowStockFirst" }));
assert.deepEqual(dashboard(reportState), cjsReports.dashboard(reportState));
assert.deepEqual(grossProfitRanking(reportState, 2), cjsReports.grossProfitRanking(reportState, 2));
assert.deepEqual(warehouseStockSummary(reportState, { month: "2026-06" }), cjsReports.warehouseStockSummary(reportState, { month: "2026-06" }));
assert.deepEqual(productWarehouseSummary(reportState), cjsReports.productWarehouseSummary(reportState));
assert.deepEqual(warehouseTransferSummary(reportState, { month: "2026-06" }), cjsReports.warehouseTransferSummary(reportState, { month: "2026-06" }));
assert.deepEqual(reportSummary(reportState, { month: "2026-06" }), cjsReports.reportSummary(reportState, { month: "2026-06" }));
assert.deepEqual(stockMovements(reportState, { month: "2026-06", query: "return" }), cjsReports.stockMovements(reportState, { month: "2026-06", query: "return" }));
assert.deepEqual(stockMovements(reportState, { month: "2026-06" }), cjsReports.stockMovements(reportState, { month: "2026-06" }));
assert.deepEqual(exportInventoryRows(reportState, { warehouseId: 1 }), cjsReports.exportInventoryRows(reportState, { warehouseId: 1 }));
assert.deepEqual(stockForProduct(reportState, 1, 1), cjsReports.stockForProduct(reportState, 1, 1));
assert.deepEqual(inventoryReports.reportSummary(reportState, { month: "2026-06" }), cjsReports.reportSummary(reportState, { month: "2026-06" }));

assert.deepEqual(
  runMasterScenario(createEsmMasterModule, {
    defaultPreferences: cjsModels.defaultPreferences,
    preferencesInput
  }),
  runMasterScenario(cjsStoreMaster.createMasterModule, {
    defaultPreferences: cjsModels.defaultPreferences,
    preferencesInput
  })
);
assert.deepEqual(
  runFinanceScenario(createEsmFinanceModule),
  runFinanceScenario(cjsStoreFinance.createFinanceModule)
);
assert.deepEqual(
  runTransactionsScenario(createEsmTransactionsModule),
  runTransactionsScenario(cjsStoreTransactions.createTransactionsModule)
);
assert.deepEqual(
  runInventoryStoreScenario(createEsmInventoryStore),
  runInventoryStoreScenario(cjsStore.createInventoryStore)
);

console.log("inventory ESM smoke tests passed");
