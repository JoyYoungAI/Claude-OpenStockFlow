(function (global) {
  const storageKey = "stockflow-inventory-state";
  const dataSchemaVersion = 11;

  function createInventoryStorage(config) {
    const seedState = config.seedState;
    const appVersion = config.appVersion;
    const assetVersion = config.assetVersion;

    function loadState() {
      try {
        const saved = JSON.parse(global.localStorage.getItem(storageKey) || "null");
        if (!saved) {
          return {
            state: seedState,
            notice: ""
          };
        }

        const migrated = migrateState(saved);
        return {
          state: migrated.state,
          notice: migrated.notice
        };
      } catch (error) {
        return {
          state: seedState,
          notice: "本機資料讀取失敗，已改用範例資料。"
        };
      }
    }

    function saveState(state) {
      global.localStorage.setItem(storageKey, JSON.stringify(createStorageEnvelope(state)));
    }

    function migrateState(saved) {
      const rawState = saved && saved.state ? saved.state : saved;

      if (!rawState || !Array.isArray(rawState.products)) {
        return {
          state: seedState,
          notice: "本機資料格式無法辨識，已改用範例資料。"
        };
      }

      const migratedWarehouses = Array.isArray(rawState.warehouses) && rawState.warehouses.length
        ? rawState.warehouses
        : defaultWarehouses();
      const migratedWarehouseId = Number(migratedWarehouses[0] && migratedWarehouses[0].id) || 1;
      const migratedDepartments = Array.isArray(rawState.departments) && rawState.departments.length
        ? rawState.departments
        : (Array.isArray(seedState.departments) ? seedState.departments : []);
      const migratedEmployees = Array.isArray(rawState.employees) && rawState.employees.length
        ? rawState.employees
        : (Array.isArray(seedState.employees) ? seedState.employees : []);
      const migratedPermissionScopes = Array.isArray(rawState.permissionScopes)
        ? rawState.permissionScopes
        : (Array.isArray(seedState.permissionScopes) ? seedState.permissionScopes : []);
      const state = {
        products: Array.isArray(rawState.products) ? rawState.products : [],
        partners: Array.isArray(rawState.partners) ? rawState.partners : [],
        departments: migratedDepartments,
        employees: migratedEmployees,
        permissionScopes: migratedPermissionScopes,
        productCategories: Array.isArray(rawState.productCategories)
          ? rawState.productCategories
          : categoriesFromProducts(rawState.products),
        warehouses: migratedWarehouses,
        purchases: withDefaultWarehouse(rawState.purchases, migratedWarehouseId),
        sales: withDefaultWarehouse(rawState.sales, migratedWarehouseId),
        adjustments: withDefaultWarehouse(rawState.adjustments, migratedWarehouseId),
        transfers: withDefaultTransferWarehouses(rawState.transfers, migratedWarehouseId),
        returns: withDefaultWarehouse(rawState.returns, migratedWarehouseId),
        costLayers: Array.isArray(rawState.costLayers) ? rawState.costLayers : [],
        receivables: Array.isArray(rawState.receivables) ? rawState.receivables : [],
        payables: Array.isArray(rawState.payables) ? rawState.payables : [],
        payments: Array.isArray(rawState.payments) ? rawState.payments : [],
        auditLogs: Array.isArray(rawState.auditLogs) ? rawState.auditLogs : [],
        preferences: rawState.preferences || {}
      };

      if (saved.schemaVersion === dataSchemaVersion) {
        return {
          state,
          notice: ""
        };
      }

      return {
        state,
        notice: `已將本機資料升級到資料版本 ${dataSchemaVersion}。`
      };
    }

    function createStorageEnvelope(state) {
      return {
        schemaVersion: dataSchemaVersion,
        appVersion,
        assetVersion,
        savedAt: new Date().toISOString(),
        state
      };
    }

    function validateBackupEnvelope(backup) {
      if (!backup || (!backup.state && !Array.isArray(backup.products))) {
        return { valid: false, message: "這不是 OpenStockFlow 備份檔。" };
      }

      const migrated = migrateState(backup);
      const state = migrated.state;
      const errors = [];
      const skuSet = new Set();
      const productIds = new Set();
      const warehouseIds = new Set((state.warehouses || []).map((warehouse) => Number(warehouse.id)));
      const departmentIds = new Set((state.departments || []).map((department) => Number(department.id)));
      const employeeIds = new Set((state.employees || []).map((employee) => Number(employee.id)));

      state.products.forEach((product) => {
        const sku = String(product.sku || "").trim().toUpperCase();
        if (!sku || skuSet.has(sku)) {
          errors.push("商品 SKU 空白或重複。");
        }
        skuSet.add(sku);
        productIds.add(Number(product.id));
      });
      state.departments.forEach((department) => {
        if (!String(department.code || "").trim()) {
          errors.push("部門代碼不可空白。");
        }
      });
      state.employees.forEach((employee) => {
        if (!String(employee.employeeNo || "").trim()) {
          errors.push("員工編號不可空白。");
        }
        if (!departmentIds.has(Number(employee.departmentId))) {
          errors.push("員工資料指向不存在的部門。");
        }
      });
      state.permissionScopes.forEach((scope) => {
        if (!employeeIds.has(Number(scope.employeeId))) {
          errors.push("授權範圍指向不存在的員工。");
        }
      });

      state.purchases.concat(state.sales).concat(state.adjustments).concat(state.returns).forEach((row) => {
        if (!productIds.has(Number(row.productId))) {
          errors.push("交易或調整資料指向不存在的商品。");
        }
        if (!warehouseIds.has(Number(row.warehouseId))) {
          errors.push("交易或調整資料指向不存在的倉庫。");
        }
      });
      state.purchases.concat(state.sales).forEach((row) => {
        if (Number(row.ownerEmployeeId) && !employeeIds.has(Number(row.ownerEmployeeId))) {
          errors.push("交易單據指向不存在的負責人。");
        }
        if (Number(row.ownerDepartmentId) && !departmentIds.has(Number(row.ownerDepartmentId))) {
          errors.push("交易單據指向不存在的負責部門。");
        }
      });
      state.transfers.forEach((transfer) => {
        if (!productIds.has(Number(transfer.productId))) {
          errors.push("調撥資料指向不存在的商品。");
        }
        if (!warehouseIds.has(Number(transfer.fromWarehouseId)) || !warehouseIds.has(Number(transfer.toWarehouseId))) {
          errors.push("調撥資料指向不存在的倉庫。");
        }
        if (Number(transfer.fromWarehouseId) === Number(transfer.toWarehouseId)) {
          errors.push("調撥來源與目的倉庫不可相同。");
        }
      });
      state.returns.forEach((returnRow) => {
        if (!String(returnRow.documentNo || "").trim() || !String(returnRow.sourceDocumentNo || "").trim()) {
          errors.push("退貨單必須保留退貨單號與來源單號。");
        }
      });
      state.payments.forEach((payment) => {
        const targetRows = payment && payment.targetType === "payable" ? state.payables : state.receivables;
        if (!targetRows.some((target) => Number(target.id) === Number(payment.targetId))) {
          errors.push("Payment records must point to an existing receivable or payable.");
        }
      });

      if (errors.length) {
        return { valid: false, message: Array.from(new Set(errors)).join(" ") };
      }

      return {
        valid: true,
        state,
        summary: summarizeBackup(backup, state)
      };
    }

    return {
      storageKey,
      loadState,
      saveState,
      migrateState,
      createStorageEnvelope,
      validateBackupEnvelope
    };
  }

  function defaultWarehouses() {
    return [
      { id: 1, code: "MAIN", name: "主倉", type: "warehouse", note: "由舊資料升級建立", active: true }
    ];
  }

  function withDefaultWarehouse(rows, warehouseId) {
    return (Array.isArray(rows) ? rows : []).map((row) => Object.assign({}, row, {
      warehouseId: Number(row && row.warehouseId) || warehouseId
    }));
  }

  function withDefaultTransferWarehouses(rows, warehouseId) {
    return (Array.isArray(rows) ? rows : []).map((row) => Object.assign({}, row, {
      fromWarehouseId: Number(row && row.fromWarehouseId) || warehouseId,
      toWarehouseId: Number(row && row.toWarehouseId) || warehouseId
    }));
  }

  function categoriesFromProducts(products) {
    return Array.from(new Set((Array.isArray(products) ? products : [])
      .map((product) => String(product && product.category || "").trim())
      .filter(Boolean)))
      .sort((a, b) => a.localeCompare(b))
      .map((name, index) => ({
        id: index + 1,
        code: name.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "") || `CAT-${index + 1}`,
        name,
        sortOrder: (index + 1) * 10,
        note: "由既有商品分類升級",
        active: true
      }));
  }

  function summarizeBackup(backup, state) {
    return {
      appVersion: backup && backup.appVersion || "舊版資料",
      schemaVersion: backup && backup.schemaVersion || "舊版",
      savedAt: backup && backup.savedAt || "未記錄",
      productCategories: state.productCategories.length,
      warehouses: state.warehouses.length,
      products: state.products.length,
      partners: state.partners.length,
      departments: state.departments.length,
      employees: state.employees.length,
      permissionScopes: state.permissionScopes.length,
      purchases: state.purchases.length,
      sales: state.sales.length,
      adjustments: state.adjustments.length,
      transfers: state.transfers.length,
      returns: state.returns.length,
      costLayers: state.costLayers.length,
      receivables: state.receivables.length,
      payables: state.payables.length,
      payments: state.payments.length
      ,
      auditLogs: state.auditLogs.length
    };
  }

  global.OpenStockFlowStorage = {
    createInventoryStorage
  };

  if (typeof module !== "undefined") {
    module.exports = global.OpenStockFlowStorage;
  }
})(typeof window !== "undefined" ? window : globalThis);
