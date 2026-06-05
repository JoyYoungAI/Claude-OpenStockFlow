import {
  nonNegativeNumber,
  normalizeText
} from "./inventoryUtils.mjs";

function normalizeDepartmentType(type) {
  const value = normalizeText(type);
  return ["sales", "purchasing", "warehouse", "finance", "admin", "audit"].includes(value) ? value : "admin";
}

function normalizeEmployeeRole(role) {
  const value = normalizeText(role);
  return ["owner", "purchasing", "sales", "warehouse", "finance", "auditor"].includes(value) ? value : "owner";
}

function normalizeScopeType(scopeType) {
  const value = normalizeText(scopeType);
  return ["self", "department", "subtree", "assignedEmployees", "all"].includes(value) ? value : "self";
}

function normalizeNumberList(value) {
  if (!Array.isArray(value)) { return []; }
  return Array.from(new Set(value.map((item) => Number(item)).filter(Boolean)));
}

function normalizeTextList(value) {
  if (!Array.isArray(value)) { return []; }
  return Array.from(new Set(value.map(normalizeText).filter(Boolean)));
}

function normalizeProductCategory(input, id) {
  const code = normalizeText(input && input.code).toUpperCase();
  const name = normalizeText(input && input.name);
  const sortOrder = nonNegativeNumber(input && input.sortOrder);
  if (!code || !name || sortOrder === null) { return null; }
  return { id, code, name, sortOrder, note: normalizeText(input && input.note), active: input && input.active === false ? false : true };
}

function copyProductCategory(category) {
  return { id: Number(category.id), code: normalizeText(category.code).toUpperCase(), name: normalizeText(category.name), sortOrder: nonNegativeNumber(category.sortOrder) || 0, note: normalizeText(category.note), active: category.active === false ? false : true };
}

function sameCategory(left, right) {
  return normalizeText(left.code).toUpperCase() === normalizeText(right.code).toUpperCase() || normalizeText(left.name).toLowerCase() === normalizeText(right.name).toLowerCase();
}

function normalizeWarehouse(input, id) {
  const code = normalizeText(input && input.code).toUpperCase();
  const name = normalizeText(input && input.name);
  const type = normalizeText(input && input.type) || "warehouse";
  if (!code || !name) { return null; }
  return { id, code, name, type, note: normalizeText(input && input.note), active: input && input.active === false ? false : true };
}

function copyWarehouse(warehouse) {
  return { id: Number(warehouse.id), code: normalizeText(warehouse.code).toUpperCase(), name: normalizeText(warehouse.name), type: normalizeText(warehouse.type) || "warehouse", note: normalizeText(warehouse.note), active: warehouse.active === false ? false : true };
}

function sameWarehouse(left, right) {
  return normalizeText(left.code).toUpperCase() === normalizeText(right.code).toUpperCase() || normalizeText(left.name).toLowerCase() === normalizeText(right.name).toLowerCase();
}

function normalizePartner(input, id) {
  const role = input && input.role === "customer" ? "customer" : "supplier";
  const name = normalizeText(input && input.name);
  if (!name) { return null; }
  return { id, role, name, contact: normalizeText(input && input.contact), phone: normalizeText(input && input.phone), note: normalizeText(input && input.note), active: input && input.active === false ? false : true };
}

function copyPartner(partner) {
  return { id: Number(partner.id), role: partner.role === "customer" ? "customer" : "supplier", name: normalizeText(partner.name), contact: normalizeText(partner.contact), phone: normalizeText(partner.phone), note: normalizeText(partner.note), active: partner.active === false ? false : true };
}

function samePartner(left, right) {
  return left.role === right.role && normalizeText(left.name).toLowerCase() === normalizeText(right.name).toLowerCase();
}

function normalizeDepartment(input, id) {
  const code = normalizeText(input && input.code).toUpperCase();
  const name = normalizeText(input && input.name);
  const type = normalizeDepartmentType(input && input.type);
  if (!code || !name) { return null; }
  return { id, code, name, type, parentDepartmentId: Number(input && input.parentDepartmentId) || 0, managerEmployeeId: Number(input && input.managerEmployeeId) || 0, active: input && input.active === false ? false : true, note: normalizeText(input && input.note) };
}

function copyDepartment(department) {
  return { id: Number(department.id), code: normalizeText(department.code).toUpperCase(), name: normalizeText(department.name), type: normalizeDepartmentType(department.type), parentDepartmentId: Number(department.parentDepartmentId) || 0, managerEmployeeId: Number(department.managerEmployeeId) || 0, active: department.active === false ? false : true, note: normalizeText(department.note) };
}

function sameDepartment(left, right) {
  return normalizeText(left.code).toUpperCase() === normalizeText(right.code).toUpperCase() || normalizeText(left.name).toLowerCase() === normalizeText(right.name).toLowerCase();
}

function normalizeEmployee(input, id) {
  const employeeNo = normalizeText(input && input.employeeNo).toUpperCase();
  const name = normalizeText(input && input.name);
  const departmentId = Number(input && input.departmentId);
  const role = normalizeEmployeeRole(input && input.role);
  if (!employeeNo || !name || !departmentId) { return null; }
  return { id, employeeNo, name, departmentId, role, managerEmployeeId: Number(input && input.managerEmployeeId) || 0, active: input && input.active === false ? false : true, canLogin: input && input.canLogin === false ? false : true, note: normalizeText(input && input.note) };
}

function copyEmployee(employee) {
  return { id: Number(employee.id), employeeNo: normalizeText(employee.employeeNo).toUpperCase(), name: normalizeText(employee.name), departmentId: Number(employee.departmentId) || 0, role: normalizeEmployeeRole(employee.role), managerEmployeeId: Number(employee.managerEmployeeId) || 0, active: employee.active === false ? false : true, canLogin: employee.canLogin === false ? false : true, note: normalizeText(employee.note) };
}

function sameEmployee(left, right) {
  return normalizeText(left.employeeNo).toUpperCase() === normalizeText(right.employeeNo).toUpperCase();
}

function normalizePermissionScope(input, id) {
  const employeeId = Number(input && input.employeeId);
  const scopeType = normalizeScopeType(input && input.scopeType);
  const actions = normalizeTextList(input && input.actions);
  if (!employeeId || !actions.length) { return null; }
  return { id, employeeId, scopeType, departmentIds: normalizeNumberList(input && input.departmentIds), employeeIds: normalizeNumberList(input && input.employeeIds), actions, active: input && input.active === false ? false : true };
}

function copyPermissionScope(scope) {
  return { id: Number(scope.id), employeeId: Number(scope.employeeId) || 0, scopeType: normalizeScopeType(scope.scopeType), departmentIds: normalizeNumberList(scope.departmentIds), employeeIds: normalizeNumberList(scope.employeeIds), actions: normalizeTextList(scope.actions), active: scope.active === false ? false : true };
}

function normalizeProduct(input, id) {
  const sku = normalizeText(input && input.sku).toUpperCase();
  const name = normalizeText(input && input.name);
  const categoryId = Number(input && input.categoryId) || 0;
  const unit = normalizeText(input && input.unit) || "件";
  const cost = nonNegativeNumber(input && input.cost);
  const price = nonNegativeNumber(input && input.price);
  const safetyStock = nonNegativeNumber(input && input.safetyStock);
  if (!sku || !name || cost === null || price === null || safetyStock === null) { return null; }
  return { id, sku, name, categoryId, unit, cost, price, safetyStock, active: input && input.active === false ? false : true };
}

function copyProduct(product) {
  return { id: Number(product.id), sku: normalizeText(product.sku).toUpperCase(), name: normalizeText(product.name), categoryId: Number(product.categoryId) || 0, unit: normalizeText(product.unit) || "件", cost: nonNegativeNumber(product.cost) || 0, price: nonNegativeNumber(product.price) || 0, safetyStock: nonNegativeNumber(product.safetyStock) || 0, active: product.active === false ? false : true };
}

function sameSku(left, right) {
  return normalizeText(left).toUpperCase() === normalizeText(right).toUpperCase();
}

const inventoryModelsMaster = {
  normalizeProductCategory, copyProductCategory, sameCategory,
  normalizeWarehouse, copyWarehouse, sameWarehouse,
  normalizePartner, copyPartner, samePartner,
  normalizeDepartment, copyDepartment, sameDepartment,
  normalizeEmployee, copyEmployee, sameEmployee,
  normalizePermissionScope, copyPermissionScope,
  normalizeProduct, copyProduct, sameSku,
  normalizeDepartmentType, normalizeEmployeeRole
};

export {
  normalizeProductCategory, copyProductCategory, sameCategory,
  normalizeWarehouse, copyWarehouse, sameWarehouse,
  normalizePartner, copyPartner, samePartner,
  normalizeDepartment, copyDepartment, sameDepartment,
  normalizeEmployee, copyEmployee, sameEmployee,
  normalizePermissionScope, copyPermissionScope,
  normalizeProduct, copyProduct, sameSku,
  normalizeDepartmentType, normalizeEmployeeRole
};

export default inventoryModelsMaster;
