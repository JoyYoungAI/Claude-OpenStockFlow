(function (global) {
  function createMasterModule(ctx) {
    const {
      getProducts, setProducts,
      getPartners, setPartners,
      getDepartments, setDepartments,
      getEmployees, setEmployees,
      getPermissionScopes, setPermissionScopes,
      getProductCategories, setProductCategories,
      getWarehouses, setWarehouses,
      getPreferences, setPreferences,
      nextProductId, incNextProductId,
      nextPartnerId, incNextPartnerId,
      nextDepartmentId, incNextDepartmentId,
      nextEmployeeId, incNextEmployeeId,
      nextPermissionScopeId, incNextPermissionScopeId,
      nextCategoryId, incNextCategoryId,
      nextWarehouseId, incNextWarehouseId
    } = ctx;

    const models = global.OpenStockFlowModels || (typeof require !== "undefined" ? require("./inventoryModels") : {});
    const {
      normalizeProductCategory, copyProductCategory, sameCategory,
      normalizeWarehouse, copyWarehouse, sameWarehouse,
      normalizePartner, copyPartner, samePartner,
      normalizeDepartment, copyDepartment, sameDepartment,
      normalizeEmployee, copyEmployee, sameEmployee,
      normalizePermissionScope, copyPermissionScope,
      normalizePreferences, defaultPreferences
    } = models;

    function normalizeText(value) {
      return String(value || "").trim();
    }

    function sameSku(left, right) {
      return normalizeText(left).toUpperCase() === normalizeText(right).toUpperCase();
    }

    function normalizeProduct(input, id) {
      const utils = global.OpenStockFlowUtils || (typeof require !== "undefined" ? require("./inventoryUtils") : {});
      const { nonNegativeNumber } = utils;
      const sku = normalizeText(input && input.sku).toUpperCase();
      const name = normalizeText(input && input.name);
      const category = normalizeText(input && input.category) || "未分類";
      const unit = normalizeText(input && input.unit) || "件";
      const cost = nonNegativeNumber(input && input.cost);
      const price = nonNegativeNumber(input && input.price);
      const safetyStock = nonNegativeNumber(input && input.safetyStock);
      if (!sku || !name || cost === null || price === null || safetyStock === null) {
        return null;
      }
      return {
        id, sku, name, category, unit, cost, price, safetyStock,
        active: input && input.active === false ? false : true
      };
    }

    function copyProduct(product) {
      const utils = global.OpenStockFlowUtils || (typeof require !== "undefined" ? require("./inventoryUtils") : {});
      const { nonNegativeNumber } = utils;
      return {
        id: Number(product.id),
        sku: normalizeText(product.sku).toUpperCase(),
        name: normalizeText(product.name),
        category: normalizeText(product.category) || "未分類",
        unit: normalizeText(product.unit) || "件",
        cost: nonNegativeNumber(product.cost) || 0,
        price: nonNegativeNumber(product.price) || 0,
        safetyStock: nonNegativeNumber(product.safetyStock) || 0,
        active: product.active === false ? false : true
      };
    }

    function findProduct(id) {
      return getProducts().find((product) => product.id === Number(id)) || null;
    }

    function addProduct(input) {
      const product = normalizeProduct(input, nextProductId());
      if (!product || getProducts().some((item) => sameSku(item.sku, product.sku))) {
        return null;
      }
      incNextProductId();
      setProducts([product].concat(getProducts()));
      return copyProduct(product);
    }

    function updateProduct(id, input) {
      const existing = findProduct(id);
      if (!existing) {
        return null;
      }
      const product = normalizeProduct(Object.assign({}, input, { active: existing.active }), existing.id);
      if (!product) {
        return null;
      }
      if (getProducts().some((item) => item.id !== existing.id && sameSku(item.sku, product.sku))) {
        return { error: "DUPLICATE_SKU" };
      }
      setProducts(getProducts().map((item) => item.id === existing.id ? product : item));
      return copyProduct(product);
    }

    function deactivateProduct(id) {
      let updated = null;
      setProducts(getProducts().map((product) => {
        if (product.id !== id) return product;
        updated = Object.assign({}, product, { active: false });
        return updated;
      }));
      return updated ? copyProduct(updated) : null;
    }

    function addProductCategory(input) {
      const category = normalizeProductCategory(input, nextCategoryId());
      if (!category || getProductCategories().some((item) => sameCategory(item, category))) {
        return null;
      }
      incNextCategoryId();
      setProductCategories([category].concat(getProductCategories()));
      return copyProductCategory(category);
    }

    function deactivateProductCategory(id) {
      let updated = null;
      setProductCategories(getProductCategories().map((category) => {
        if (category.id !== Number(id)) return category;
        updated = Object.assign({}, category, { active: false });
        return updated;
      }));
      return updated ? copyProductCategory(updated) : null;
    }

    function addWarehouse(input) {
      const warehouse = normalizeWarehouse(input, nextWarehouseId());
      if (!warehouse || getWarehouses().some((item) => sameWarehouse(item, warehouse))) {
        return null;
      }
      incNextWarehouseId();
      setWarehouses([warehouse].concat(getWarehouses()));
      return copyWarehouse(warehouse);
    }

    function deactivateWarehouse(id) {
      let updated = null;
      setWarehouses(getWarehouses().map((warehouse) => {
        if (warehouse.id !== Number(id)) return warehouse;
        updated = Object.assign({}, warehouse, { active: false });
        return updated;
      }));
      return updated ? copyWarehouse(updated) : null;
    }

    function addPartner(input) {
      const partner = normalizePartner(input, nextPartnerId());
      if (!partner || getPartners().some((item) => samePartner(item, partner))) {
        return null;
      }
      incNextPartnerId();
      setPartners([partner].concat(getPartners()));
      return copyPartner(partner);
    }

    function updatePartner(id, input) {
      const existing = getPartners().find((p) => p.id === Number(id)) || null;
      if (!existing) {
        return null;
      }
      const partner = normalizePartner(Object.assign({}, input, { active: existing.active }), existing.id);
      if (!partner) {
        return null;
      }
      if (getPartners().some((item) => item.id !== existing.id && samePartner(item, partner))) {
        return { error: "DUPLICATE_PARTNER" };
      }
      setPartners(getPartners().map((item) => item.id === existing.id ? partner : item));
      return copyPartner(partner);
    }

    function deactivatePartner(id) {
      let updated = null;
      setPartners(getPartners().map((partner) => {
        if (partner.id !== Number(id)) return partner;
        updated = Object.assign({}, partner, { active: false });
        return updated;
      }));
      return updated ? copyPartner(updated) : null;
    }

    function addDepartment(input) {
      const department = normalizeDepartment(input, nextDepartmentId());
      if (!department || getDepartments().some((item) => sameDepartment(item, department))) {
        return null;
      }
      incNextDepartmentId();
      setDepartments([department].concat(getDepartments()));
      return copyDepartment(department);
    }

    function deactivateDepartment(id) {
      let updated = null;
      setDepartments(getDepartments().map((department) => {
        if (department.id !== Number(id)) return department;
        updated = Object.assign({}, department, { active: false });
        return updated;
      }));
      return updated ? copyDepartment(updated) : null;
    }

    function addEmployee(input) {
      const employee = normalizeEmployee(input, nextEmployeeId());
      const department = getDepartments().find((item) => item.id === (employee && employee.departmentId));
      if (!employee || !department || !department.active || getEmployees().some((item) => sameEmployee(item, employee))) {
        return null;
      }
      incNextEmployeeId();
      setEmployees([employee].concat(getEmployees()));
      return copyEmployee(employee);
    }

    function deactivateEmployee(id) {
      let updated = null;
      setEmployees(getEmployees().map((employee) => {
        if (employee.id !== Number(id)) return employee;
        updated = Object.assign({}, employee, { active: false, canLogin: false });
        return updated;
      }));
      return updated ? copyEmployee(updated) : null;
    }

    function addPermissionScope(input) {
      const scope = normalizePermissionScope(input, nextPermissionScopeId());
      if (!scope || !getEmployees().some((employee) => employee.id === scope.employeeId)) {
        return null;
      }
      incNextPermissionScopeId();
      setPermissionScopes([scope].concat(getPermissionScopes()));
      return copyPermissionScope(scope);
    }

    function listProducts(options) {
      const utils = global.OpenStockFlowUtils || (typeof require !== "undefined" ? require("./inventoryUtils") : {});
      const { normalizeText: nt } = utils;
      const filter = Object.assign({ query: "", category: "", activeOnly: false }, options);
      const query = (nt || normalizeText)(filter.query).toLowerCase();
      return getProducts()
        .filter((product) => !filter.activeOnly || product.active)
        .filter((product) => !filter.category || product.category === filter.category)
        .filter((product) => {
          if (!query) return true;
          return [product.sku, product.name, product.category]
            .some((value) => normalizeText(value).toLowerCase().includes(query));
        })
        .slice()
        .sort((a, b) => a.sku.localeCompare(b.sku))
        .map(copyProduct);
    }

    function listPartners(options) {
      const filter = Object.assign({ query: "", role: "", activeOnly: false }, options);
      const query = normalizeText(filter.query).toLowerCase();
      return getPartners()
        .filter((partner) => !filter.activeOnly || partner.active)
        .filter((partner) => !filter.role || partner.role === filter.role)
        .filter((partner) => {
          if (!query) return true;
          return [partner.name, partner.contact, partner.phone, partner.note]
            .some((value) => normalizeText(value).toLowerCase().includes(query));
        })
        .slice()
        .sort((a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name))
        .map(copyPartner);
    }

    function listDepartments(options) {
      const filter = Object.assign({ query: "", activeOnly: false }, options);
      const query = normalizeText(filter.query).toLowerCase();
      return getDepartments()
        .filter((department) => !filter.activeOnly || department.active)
        .filter((department) => {
          if (!query) return true;
          return [department.code, department.name, department.type, department.note]
            .some((value) => normalizeText(value).toLowerCase().includes(query));
        })
        .slice()
        .sort((a, b) => a.code.localeCompare(b.code))
        .map(copyDepartment);
    }

    function listEmployees(options) {
      const filter = Object.assign({ query: "", role: "", departmentId: 0, activeOnly: false }, options);
      const query = normalizeText(filter.query).toLowerCase();
      return getEmployees()
        .filter((employee) => !filter.activeOnly || employee.active)
        .filter((employee) => !filter.role || employee.role === filter.role)
        .filter((employee) => !filter.departmentId || employee.departmentId === Number(filter.departmentId))
        .filter((employee) => {
          if (!query) return true;
          const department = getDepartments().find((item) => item.id === employee.departmentId);
          return [
            employee.employeeNo, employee.name, employee.role,
            department && department.code, department && department.name, employee.note
          ].some((value) => normalizeText(value).toLowerCase().includes(query));
        })
        .slice()
        .sort((a, b) => a.employeeNo.localeCompare(b.employeeNo))
        .map(copyEmployee);
    }

    function listPermissionScopes(options) {
      const filter = Object.assign({ employeeId: 0, activeOnly: false }, options);
      return getPermissionScopes()
        .filter((scope) => !filter.employeeId || scope.employeeId === Number(filter.employeeId))
        .filter((scope) => !filter.activeOnly || scope.active)
        .slice()
        .sort((a, b) => a.employeeId - b.employeeId || a.id - b.id)
        .map(copyPermissionScope);
    }

    function listProductCategories(options) {
      const filter = Object.assign({ query: "", activeOnly: false }, options);
      const query = normalizeText(filter.query).toLowerCase();
      return getProductCategories()
        .filter((category) => !filter.activeOnly || category.active)
        .filter((category) => {
          if (!query) return true;
          return [category.code, category.name, category.note]
            .some((value) => normalizeText(value).toLowerCase().includes(query));
        })
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
        .map(copyProductCategory);
    }

    function listWarehouses(options) {
      const filter = Object.assign({ query: "", activeOnly: false }, options);
      const query = normalizeText(filter.query).toLowerCase();
      return getWarehouses()
        .filter((warehouse) => !filter.activeOnly || warehouse.active)
        .filter((warehouse) => {
          if (!query) return true;
          return [warehouse.code, warehouse.name, warehouse.type, warehouse.note]
            .some((value) => normalizeText(value).toLowerCase().includes(query));
        })
        .slice()
        .sort((a, b) => a.code.localeCompare(b.code))
        .map(copyWarehouse);
    }

    function updatePreferences(input) {
      const prefs = normalizePreferences(input);
      setPreferences(prefs);
      return Object.assign({}, prefs);
    }

    function getPreferencesSnapshot() {
      return Object.assign({}, getPreferences());
    }

    function categories() {
      const categoryNames = getProductCategories()
        .filter((category) => category.active)
        .map((category) => category.name)
        .concat(getProducts().map((product) => product.category));
      return Array.from(new Set(categoryNames)).filter(Boolean).sort((a, b) => a.localeCompare(b));
    }

    return {
      addProduct, updateProduct, deactivateProduct,
      addProductCategory, deactivateProductCategory,
      addWarehouse, deactivateWarehouse,
      addPartner, updatePartner, deactivatePartner,
      addDepartment, deactivateDepartment,
      addEmployee, deactivateEmployee,
      addPermissionScope,
      listProducts, listPartners, listDepartments, listEmployees,
      listPermissionScopes, listProductCategories, listWarehouses,
      updatePreferences, getPreferences: getPreferencesSnapshot, categories,
      // expose internals needed by transactions module
      findProduct,
      copyProduct,
      setProductsCost: function (productId, cost) {
        setProducts(getProducts().map((item) =>
          item.id === productId ? Object.assign({}, item, { cost }) : item
        ));
      }
    };
  }

  global.OpenStockFlowStoreMaster = { createMasterModule };

  if (typeof module !== "undefined") {
    module.exports = global.OpenStockFlowStoreMaster;
  }
})(typeof window !== "undefined" ? window : globalThis);
