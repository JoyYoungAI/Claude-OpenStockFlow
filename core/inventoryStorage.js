(function (global) {
  const SCHEMA_VERSION = 13;

  function createInventoryStorage(config) {
    const storageKey = config.storageKey || "stockflow-inventory-state";
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
      const migratedCategories = Array.isArray(rawState.productCategories) && rawState.productCategories.length
        ? rawState.productCategories
        : categoriesFromProducts(rawState.products);
      const migratedProducts = migrateCategoryIdOnProducts(
        Array.isArray(rawState.products) ? rawState.products : [],
        migratedCategories
      );
      const migratedPurchases = migratePurchasesToDocuments(
        withDefaultPurchaseFields(withDefaultStatus(withDefaultWarehouse(rawState.purchases, migratedWarehouseId), "confirmed"))
      );
      const migratedSales = migrateSalesToDocuments(
        withDefaultSaleFields(withDefaultStatus(withDefaultWarehouse(rawState.sales, migratedWarehouseId), "confirmed"))
      );
      const state = {
        products: migratedProducts,
        partners: Array.isArray(rawState.partners) ? rawState.partners : [],
        departments: migratedDepartments,
        employees: migratedEmployees,
        permissionScopes: migratedPermissionScopes,
        productCategories: migratedCategories,
        warehouses: migratedWarehouses,
        purchases: migratedPurchases,
        sales: migratedSales,
        adjustments: withDefaultStatus(withDefaultWarehouse(rawState.adjustments, migratedWarehouseId), "confirmed"),
        transfers: withDefaultStatus(withDefaultTransferWarehouses(rawState.transfers, migratedWarehouseId), "confirmed"),
        returns: withDefaultReturnUnitPrice(withDefaultStatus(withDefaultWarehouse(rawState.returns, migratedWarehouseId), "confirmed")),
        costLayers: (Array.isArray(rawState.costLayers) ? rawState.costLayers : []).map((layer) =>
          layer && !layer.warehouseId ? Object.assign({}, layer, { warehouseId: migratedWarehouseId }) : layer
        ),
        receivables: Array.isArray(rawState.receivables) ? rawState.receivables : [],
        payables: Array.isArray(rawState.payables) ? rawState.payables : [],
        payments: Array.isArray(rawState.payments) ? rawState.payments : [],
        auditLogs: Array.isArray(rawState.auditLogs) ? rawState.auditLogs : [],
        preferences: rawState.preferences || {}
      };

      if (saved.schemaVersion === SCHEMA_VERSION) {
        return {
          state,
          notice: ""
        };
      }

      return {
        state,
        notice: `已將本機資料升級到資料版本 ${SCHEMA_VERSION}。`
      };
    }

    function createStorageEnvelope(state) {
      return {
        schemaVersion: SCHEMA_VERSION,
        appVersion,
        assetVersion,
        savedAt: new Date().toISOString(),
        state
      };
    }

    function validateBackupEnvelope(backup) {
      if (!backup || (!backup.state && !Array.isArray(backup.products))) {
        return { valid: false, message: "這不是 Claude-OpenStockFlow 備份檔。" };
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

      extractTransactionPairs(state.purchases).concat(extractTransactionPairs(state.sales)).forEach((pair) => {
        if (!productIds.has(Number(pair.productId))) {
          errors.push("交易或調整資料指向不存在的商品。");
        }
        if (!warehouseIds.has(Number(pair.warehouseId))) {
          errors.push("交易或調整資料指向不存在的倉庫。");
        }
      });
      state.adjustments.concat(state.returns).forEach((row) => {
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

  function withDefaultStatus(rows, defaultStatus) {
    return rows.map((row) => row.status ? row : Object.assign({}, row, { status: defaultStatus }));
  }

  function withDefaultPurchaseFields(rows) {
    return rows.map((row) => Object.assign({ supplierId: 0, receivedQuantity: 0 }, row));
  }

  function withDefaultSaleFields(rows) {
    return rows.map((row) => Object.assign({ customerId: 0, shippedQuantity: 0, commissionStatus: "" }, row));
  }

  function withDefaultReturnUnitPrice(rows) {
    return rows.map((row) => row.unitPrice !== undefined ? row : Object.assign({}, row, { unitPrice: row.unitAmount || 0 }));
  }

  function withDefaultTransferWarehouses(rows, warehouseId) {
    return (Array.isArray(rows) ? rows : []).map((row) => Object.assign({}, row, {
      fromWarehouseId: Number(row && row.fromWarehouseId) || warehouseId,
      toWarehouseId: Number(row && row.toWarehouseId) || warehouseId
    }));
  }

  // Migrate product.category string → product.categoryId FK
  function migrateCategoryIdOnProducts(products, categories) {
    return products.map((product) => {
      if (Number(product.categoryId)) return product;
      const catName = String(product.category || "").trim();
      if (!catName) return Object.assign({}, product, { categoryId: 0 });
      const found = categories.find((c) =>
        String(c.name || "").trim().toLowerCase() === catName.toLowerCase()
      );
      return Object.assign({}, product, { categoryId: found ? found.id : 0 });
    });
  }

  // Convert flat purchase/sale records to embedded-document format (v12 → v13)
  function migratePurchasesToDocuments(rows) {
    if (!Array.isArray(rows) || !rows.length) return [];
    // Already converted: first item has a lines array
    if (Array.isArray(rows[0] && rows[0].lines)) return rows;
    // Flat records: group by documentNo
    const groups = new Map();
    const order = [];
    rows.forEach((row) => {
      const key = String(row.documentNo || "").trim() || `__solo_${row.id}`;
      if (!groups.has(key)) { groups.set(key, []); order.push(key); }
      groups.get(key).push(row);
    });
    return order.map((key) => {
      const group = groups.get(key).slice().sort((a, b) => Number(a.id) - Number(b.id));
      const first = group[0];
      const doc = {
        id: Number(first.id),
        documentNo: String(first.documentNo || "").trim(),
        date: first.date || "",
        warehouseId: Number(first.warehouseId) || 1,
        supplierId: Number(first.supplierId) || 0,
        supplierName: String(first.supplierName || first.supplier || "").trim(),
        note: String(first.note || "").trim(),
        status: first.status || "confirmed",
        createdBy: String(first.createdBy || "").trim(),
        ownerEmployeeId: Number(first.ownerEmployeeId) || 0,
        ownerDepartmentId: Number(first.ownerDepartmentId) || 0,
        createdByEmployeeId: Number(first.createdByEmployeeId) || 0,
        lastEditedByEmployeeId: Number(first.lastEditedByEmployeeId) || 0,
        submittedBy: String(first.submittedBy || "").trim(), submittedAt: String(first.submittedAt || "").trim(),
        approvedBy: String(first.approvedBy || "").trim(), approvedAt: String(first.approvedAt || "").trim(),
        rejectedBy: String(first.rejectedBy || "").trim(), rejectedAt: String(first.rejectedAt || "").trim(),
        rejectReason: String(first.rejectReason || "").trim(),
        confirmedBy: String(first.confirmedBy || "").trim(), confirmedAt: String(first.confirmedAt || "").trim(),
        voidRequestedBy: String(first.voidRequestedBy || "").trim(),
        voidRequestedAt: String(first.voidRequestedAt || "").trim(),
        voidRequestReason: String(first.voidRequestReason || "").trim(),
        voidReason: String(first.voidReason || "").trim(),
        voidedAt: String(first.voidedAt || "").trim(), voidedBy: String(first.voidedBy || "").trim(),
        sourceDocumentNo: String(first.sourceDocumentNo || "").trim(),
        reversalDocumentNo: String(first.reversalDocumentNo || "").trim(),
        relatedDocumentNos: Array.isArray(first.relatedDocumentNos) ? first.relatedDocumentNos : [],
        createPayable: Boolean(first.createPayable),
        dueDate: String(first.dueDate || "").trim(),
        lines: group.map((row) => ({
          lineId: Number(row.id),
          productId: Number(row.productId),
          quantity: Number(row.quantity) || 0,
          unitCost: Number(row.unitCost) || 0,
          receivedQuantity: Number(row.receivedQuantity) || 0
        }))
      };
      return doc;
    });
  }

  function migrateSalesToDocuments(rows) {
    if (!Array.isArray(rows) || !rows.length) return [];
    if (Array.isArray(rows[0] && rows[0].lines)) return rows;
    const groups = new Map();
    const order = [];
    rows.forEach((row) => {
      const key = String(row.documentNo || "").trim() || `__solo_${row.id}`;
      if (!groups.has(key)) { groups.set(key, []); order.push(key); }
      groups.get(key).push(row);
    });
    return order.map((key) => {
      const group = groups.get(key).slice().sort((a, b) => Number(a.id) - Number(b.id));
      const first = group[0];
      const doc = {
        id: Number(first.id),
        documentNo: String(first.documentNo || "").trim(),
        date: first.date || "",
        warehouseId: Number(first.warehouseId) || 1,
        customerId: Number(first.customerId) || 0,
        customerName: String(first.customerName || first.customer || "").trim(),
        commissionStatus: String(first.commissionStatus || "").trim(),
        note: String(first.note || "").trim(),
        status: first.status || "confirmed",
        createdBy: String(first.createdBy || "").trim(),
        ownerEmployeeId: Number(first.ownerEmployeeId) || 0,
        ownerDepartmentId: Number(first.ownerDepartmentId) || 0,
        createdByEmployeeId: Number(first.createdByEmployeeId) || 0,
        lastEditedByEmployeeId: Number(first.lastEditedByEmployeeId) || 0,
        submittedBy: String(first.submittedBy || "").trim(), submittedAt: String(first.submittedAt || "").trim(),
        approvedBy: String(first.approvedBy || "").trim(), approvedAt: String(first.approvedAt || "").trim(),
        rejectedBy: String(first.rejectedBy || "").trim(), rejectedAt: String(first.rejectedAt || "").trim(),
        rejectReason: String(first.rejectReason || "").trim(),
        confirmedBy: String(first.confirmedBy || "").trim(), confirmedAt: String(first.confirmedAt || "").trim(),
        voidRequestedBy: String(first.voidRequestedBy || "").trim(),
        voidRequestedAt: String(first.voidRequestedAt || "").trim(),
        voidRequestReason: String(first.voidRequestReason || "").trim(),
        voidReason: String(first.voidReason || "").trim(),
        voidedAt: String(first.voidedAt || "").trim(), voidedBy: String(first.voidedBy || "").trim(),
        sourceDocumentNo: String(first.sourceDocumentNo || "").trim(),
        reversalDocumentNo: String(first.reversalDocumentNo || "").trim(),
        relatedDocumentNos: Array.isArray(first.relatedDocumentNos) ? first.relatedDocumentNos : [],
        createReceivable: Boolean(first.createReceivable),
        dueDate: String(first.dueDate || "").trim(),
        lines: group.map((row) => ({
          lineId: Number(row.id),
          productId: Number(row.productId),
          quantity: Number(row.quantity) || 0,
          unitPrice: Number(row.unitPrice) || 0,
          shippedQuantity: Number(row.shippedQuantity) || 0,
          costBasis: row.costBasis || null
        }))
      };
      return doc;
    });
  }

  function extractTransactionPairs(rows) {
    return (Array.isArray(rows) ? rows : []).flatMap((row) => {
      if (Array.isArray(row.lines)) {
        return row.lines.map((line) => ({ productId: line.productId, warehouseId: row.warehouseId }));
      }
      return [{ productId: row.productId, warehouseId: row.warehouseId }];
    });
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

  global.ClaudeOpenStockFlowStorage = {
    createInventoryStorage
  };

  if (typeof module !== "undefined") {
    module.exports = global.ClaudeOpenStockFlowStorage;
  }
})(typeof window !== "undefined" ? window : globalThis);
