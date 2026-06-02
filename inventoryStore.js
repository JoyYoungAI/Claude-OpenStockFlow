(function (global) {
  const models = global.OpenStockFlowModels || (typeof require !== "undefined" ? require("./inventoryModels") : {});
  const reports = global.OpenStockFlowReports || (typeof require !== "undefined" ? require("./inventoryReports") : {});
  const {
    normalizeProductCategory,
    copyProductCategory,
    sameCategory,
    normalizeWarehouse,
    copyWarehouse,
    sameWarehouse,
    normalizePartner,
    copyPartner,
    samePartner,
    normalizeDepartment,
    copyDepartment,
    sameDepartment,
    normalizeEmployee,
    copyEmployee,
    sameEmployee,
    normalizePermissionScope,
    copyPermissionScope,
    normalizePurchase,
    normalizeSale,
    normalizeTransfer,
    copyTransfer,
    normalizeReturn,
    copyReturn,
    normalizeReceivable,
    normalizePayable,
    normalizePayment,
    copyReceivable,
    copyPayable,
    copyPayment,
    financeStatus,
    defaultPreferences,
    normalizePreferences
  } = models;

  function createInventoryStore(initialState) {
    let products = Array.isArray(initialState && initialState.products)
      ? initialState.products.map(copyProduct)
      : [];
    let purchases = Array.isArray(initialState && initialState.purchases)
      ? initialState.purchases.map(copyPurchase)
      : [];
    let sales = Array.isArray(initialState && initialState.sales)
      ? initialState.sales.map(copySale)
      : [];
    let partners = Array.isArray(initialState && initialState.partners)
      ? initialState.partners.map(copyPartner)
      : [];
    let departments = Array.isArray(initialState && initialState.departments)
      ? initialState.departments.map(copyDepartment)
      : [];
    let employees = Array.isArray(initialState && initialState.employees)
      ? initialState.employees.map(copyEmployee)
      : [];
    let permissionScopes = Array.isArray(initialState && initialState.permissionScopes)
      ? initialState.permissionScopes.map(copyPermissionScope)
      : [];
    let productCategories = Array.isArray(initialState && initialState.productCategories)
      ? initialState.productCategories.map(copyProductCategory)
      : [];
    let warehouses = Array.isArray(initialState && initialState.warehouses)
      ? initialState.warehouses.map(copyWarehouse)
      : [];
    if (!warehouses.length) {
      warehouses = [defaultWarehouse()];
    }
    let adjustments = Array.isArray(initialState && initialState.adjustments)
      ? initialState.adjustments.map(copyAdjustment)
      : [];
    let transfers = Array.isArray(initialState && initialState.transfers)
      ? initialState.transfers.map(copyTransfer)
      : [];
    let returns = Array.isArray(initialState && initialState.returns)
      ? initialState.returns.map(copyReturn)
      : [];
    let costLayers = Array.isArray(initialState && initialState.costLayers)
      ? initialState.costLayers.map(copyCostLayer)
      : [];
    let receivables = Array.isArray(initialState && initialState.receivables)
      ? initialState.receivables.map(copyReceivable)
      : [];
    let payables = Array.isArray(initialState && initialState.payables)
      ? initialState.payables.map(copyPayable)
      : [];
    let payments = Array.isArray(initialState && initialState.payments)
      ? initialState.payments.map(copyPayment)
      : [];
    let auditLogs = Array.isArray(initialState && initialState.auditLogs)
      ? initialState.auditLogs.map(copyAuditLog)
      : [];
    let preferences = normalizePreferences
      ? normalizePreferences(initialState && initialState.preferences)
      : defaultPreferences();
    const fallbackWarehouseId = defaultWarehouseId();
    purchases = purchases.map((purchase) => ensureWarehouseOnRow(purchase, fallbackWarehouseId));
    sales = sales.map((sale) => ensureWarehouseOnRow(sale, fallbackWarehouseId));
    adjustments = adjustments.map((adjustment) => ensureWarehouseOnRow(adjustment, fallbackWarehouseId));

    let nextProductId = nextId(products);
    let nextPurchaseId = nextId(purchases);
    let nextSaleId = nextId(sales);
    let nextPartnerId = nextId(partners);
    let nextDepartmentId = nextId(departments);
    let nextEmployeeId = nextId(employees);
    let nextPermissionScopeId = nextId(permissionScopes);
    let nextCategoryId = nextId(productCategories);
    let nextWarehouseId = nextId(warehouses);
    let nextAdjustmentId = nextId(adjustments);
    let nextTransferId = nextId(transfers);
    let nextReturnId = nextId(returns);
    let nextCostLayerId = nextId(costLayers);
    let nextReceivableId = nextId(receivables);
    let nextPayableId = nextId(payables);
    let nextPaymentId = nextId(payments);
    let nextAuditId = nextId(auditLogs);

    function addProduct(input) {
      const product = normalizeProduct(input, nextProductId);

      if (!product || products.some((item) => sameSku(item.sku, product.sku))) {
        return null;
      }

      nextProductId += 1;
      products = [product].concat(products);
      return copyProduct(product);
    }

    function updateProduct(id, input) {
      const existing = findProduct(id);

      if (!existing) {
        return null;
      }

      const product = normalizeProduct(Object.assign({}, input, {
        active: existing.active
      }), existing.id);

      if (!product) {
        return null;
      }

      if (products.some((item) => item.id !== existing.id && sameSku(item.sku, product.sku))) {
        return { error: "DUPLICATE_SKU" };
      }

      products = products.map((item) => item.id === existing.id ? product : item);
      return copyProduct(product);
    }

    function deactivateProduct(id) {
      let updated = null;

      products = products.map((product) => {
        if (product.id !== id) {
          return product;
        }

        updated = Object.assign({}, product, { active: false });
        return updated;
      });

      return updated ? copyProduct(updated) : null;
    }

    function addProductCategory(input) {
      const category = normalizeProductCategory(input, nextCategoryId);

      if (!category || productCategories.some((item) => sameCategory(item, category))) {
        return null;
      }

      nextCategoryId += 1;
      productCategories = [category].concat(productCategories);
      return copyProductCategory(category);
    }

    function deactivateProductCategory(id) {
      let updated = null;

      productCategories = productCategories.map((category) => {
        if (category.id !== Number(id)) {
          return category;
        }

        updated = Object.assign({}, category, { active: false });
        return updated;
      });

      return updated ? copyProductCategory(updated) : null;
    }

    function addWarehouse(input) {
      const warehouse = normalizeWarehouse(input, nextWarehouseId);

      if (!warehouse || warehouses.some((item) => sameWarehouse(item, warehouse))) {
        return null;
      }

      nextWarehouseId += 1;
      warehouses = [warehouse].concat(warehouses);
      return copyWarehouse(warehouse);
    }

    function deactivateWarehouse(id) {
      let updated = null;

      warehouses = warehouses.map((warehouse) => {
        if (warehouse.id !== Number(id)) {
          return warehouse;
        }

        updated = Object.assign({}, warehouse, { active: false });
        return updated;
      });

      return updated ? copyWarehouse(updated) : null;
    }

    function addPartner(input) {
      const partner = normalizePartner(input, nextPartnerId);

      if (!partner || partners.some((item) => samePartner(item, partner))) {
        return null;
      }

      nextPartnerId += 1;
      partners = [partner].concat(partners);
      return copyPartner(partner);
    }

    function updatePartner(id, input) {
      const existing = findPartner(id);

      if (!existing) {
        return null;
      }

      const partner = normalizePartner(Object.assign({}, input, {
        active: existing.active
      }), existing.id);

      if (!partner) {
        return null;
      }

      if (partners.some((item) => item.id !== existing.id && samePartner(item, partner))) {
        return { error: "DUPLICATE_PARTNER" };
      }

      partners = partners.map((item) => item.id === existing.id ? partner : item);
      return copyPartner(partner);
    }

    function deactivatePartner(id) {
      let updated = null;

      partners = partners.map((partner) => {
        if (partner.id !== Number(id)) {
          return partner;
        }

        updated = Object.assign({}, partner, { active: false });
        return updated;
      });

      return updated ? copyPartner(updated) : null;
    }

    function addDepartment(input) {
      const department = normalizeDepartment(input, nextDepartmentId);

      if (!department || departments.some((item) => sameDepartment(item, department))) {
        return null;
      }

      nextDepartmentId += 1;
      departments = [department].concat(departments);
      return copyDepartment(department);
    }

    function deactivateDepartment(id) {
      let updated = null;

      departments = departments.map((department) => {
        if (department.id !== Number(id)) {
          return department;
        }

        updated = Object.assign({}, department, { active: false });
        return updated;
      });

      return updated ? copyDepartment(updated) : null;
    }

    function addEmployee(input) {
      const employee = normalizeEmployee(input, nextEmployeeId);
      const department = departments.find((item) => item.id === (employee && employee.departmentId));

      if (!employee || !department || !department.active || employees.some((item) => sameEmployee(item, employee))) {
        return null;
      }

      nextEmployeeId += 1;
      employees = [employee].concat(employees);
      return copyEmployee(employee);
    }

    function deactivateEmployee(id) {
      let updated = null;

      employees = employees.map((employee) => {
        if (employee.id !== Number(id)) {
          return employee;
        }

        updated = Object.assign({}, employee, { active: false, canLogin: false });
        return updated;
      });

      return updated ? copyEmployee(updated) : null;
    }

    function addPermissionScope(input) {
      const scope = normalizePermissionScope(input, nextPermissionScopeId);
      if (!scope || !employees.some((employee) => employee.id === scope.employeeId)) {
        return null;
      }

      nextPermissionScopeId += 1;
      permissionScopes = [scope].concat(permissionScopes);
      return copyPermissionScope(scope);
    }

    function addReceivable(input) {
      const receivable = normalizeReceivable(input, nextReceivableId);

      if (!receivable) {
        return null;
      }

      nextReceivableId += 1;
      receivables = [receivable].concat(receivables);
      return copyReceivable(receivable);
    }

    function addPayable(input) {
      const payable = normalizePayable(input, nextPayableId);

      if (!payable) {
        return null;
      }

      nextPayableId += 1;
      payables = [payable].concat(payables);
      return copyPayable(payable);
    }

    function addPayment(input) {
      const payment = normalizePayment(input, nextPaymentId);

      if (!payment) {
        return null;
      }

      if (payment.targetType === "receivable" && payment.direction !== "in") {
        return { error: "INVALID_PAYMENT_DIRECTION" };
      }

      if (payment.targetType === "payable" && payment.direction !== "out") {
        return { error: "INVALID_PAYMENT_DIRECTION" };
      }

      const target = payment.targetType === "receivable"
        ? receivables.find((item) => item.id === payment.targetId)
        : payables.find((item) => item.id === payment.targetId);

      if (!target || target.status === "voided") {
        return null;
      }

      const remaining = target.amount - target.paidAmount;
      if (payment.amount > remaining) {
        return { error: "PAYMENT_EXCEEDS_BALANCE" };
      }

      nextPaymentId += 1;
      payments = [payment].concat(payments);
      applyPaymentToTarget(payment);
      return copyPayment(payment);
    }

    function updatePreferences(input) {
      preferences = normalizePreferences(input);
      return Object.assign({}, preferences);
    }

    function getPreferences() {
      return Object.assign({}, preferences);
    }

    function addPurchase(input) {
      const purchase = normalizePurchase(input, nextPurchaseId);
      const product = findProduct(purchase && purchase.productId);
      const warehouse = resolveActiveWarehouse(purchase && purchase.warehouseId);

      if (!purchase || !product || !product.active || !warehouse) {
        return null;
      }

      const saved = Object.assign({}, purchase, { warehouseId: warehouse.id });
      nextPurchaseId += 1;
      purchases = [saved].concat(purchases);
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
      products = products.map((item) => {
        if (item.id !== saved.productId) {
          return item;
        }

        return Object.assign({}, item, { cost: saved.unitCost });
      });

      return copyPurchase(saved);
    }

    function addPurchaseOrder(input) {
      const date = normalizeDate(input && input.date);
      const items = normalizeOrderItems(input && input.items, "unitCost");
      const warehouse = resolveActiveWarehouse(input && input.warehouseId);

      if (!date || !items.length || !warehouse) {
        return null;
      }

      if (items.some((item) => {
        const product = findProduct(item.productId);
        return !product || !product.active;
      })) {
        return null;
      }

      const documentNo = normalizeText(input && input.documentNo) || nextDocumentNo("PO", date, purchases);
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
          id: nextPurchaseId,
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          supplier: normalizeText(input && input.supplier),
          date,
          note: normalizeText(input && input.note),
          documentNo,
          warehouseId: warehouse.id,
          status,
          createPayable,
          dueDate,
          createdBy,
          ownerEmployeeId,
          ownerDepartmentId,
          createdByEmployeeId,
          lastEditedByEmployeeId
        };
        nextPurchaseId += 1;
        return purchase;
      });

      purchases = created.concat(purchases);
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
      const sale = normalizeSale(input, nextSaleId);
      const product = findProduct(sale && sale.productId);
      const warehouse = resolveActiveWarehouse(sale && sale.warehouseId);

      if (!sale || !product || !product.active || !warehouse) {
        return null;
      }

      if (stockForProduct(sale.productId, warehouse.id).onHand < sale.quantity) {
        return { error: "INSUFFICIENT_STOCK" };
      }

      const saved = Object.assign({}, sale, {
        warehouseId: warehouse.id,
        costBasis: createCostBasis(sale.productId, sale.quantity)
      });
      nextSaleId += 1;
      sales = [saved].concat(sales);
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

      if (!date || !items.length || !warehouse) {
        return null;
      }

      if (items.some((item) => {
        const product = findProduct(item.productId);
        return !product || !product.active;
      })) {
        return null;
      }

      const requestedByProduct = new Map();
      items.forEach((item) => {
        requestedByProduct.set(item.productId, (requestedByProduct.get(item.productId) || 0) + item.quantity);
      });

      for (const [productId, quantity] of requestedByProduct.entries()) {
        if (stockForProduct(productId, warehouse.id).onHand < quantity) {
          return { error: "INSUFFICIENT_STOCK" };
        }
      }

      const documentNo = normalizeText(input && input.documentNo) || nextDocumentNo("SO", date, sales);
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
          id: nextSaleId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          customer: normalizeText(input && input.customer),
          date,
          note: normalizeText(input && input.note),
          documentNo,
          warehouseId: warehouse.id,
          status,
          createReceivable,
          dueDate,
          createdBy,
          ownerEmployeeId,
          ownerDepartmentId,
          createdByEmployeeId,
          lastEditedByEmployeeId,
          costBasis: createCostBasis(item.productId, item.quantity)
        };
        nextSaleId += 1;
        return sale;
      });

      sales = created.concat(sales);
      if (isDocumentEffective({ status })) {
        applySaleOrderEffects(documentNo);
      }

      return {
        documentNo,
        lines: created.map(copySale),
        total: created.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
      };
    }

    function removePurchase(id, options) {
      const purchase = purchases.find((item) => item.id === Number(id));

      if (!purchase) {
        return false;
      }

      if (isVoidedDocument(purchase)) {
        return true;
      }

      const currentStock = stockForProduct(purchase.productId, purchase.warehouseId).onHand;
      if (isDocumentEffective(purchase) && currentStock - purchase.quantity < 0) {
        return { error: "NEGATIVE_STOCK" };
      }

      const voidInfo = createVoidInfo(options);
      purchases = purchases.map((item) => item.id === purchase.id ? Object.assign({}, item, voidInfo, {
        sourceDocumentNo: item.sourceDocumentNo || item.documentNo,
        relatedDocumentNos: mergeDocumentNos(item.relatedDocumentNos, [item.documentNo])
      }) : item);
      payables = payables.map((payable) => payable.sourceDocumentNo === purchase.documentNo
        ? Object.assign({}, payable, {
          status: "voided",
          voidReason: voidInfo.voidReason,
          voidedAt: voidInfo.voidedAt,
          voidedBy: voidInfo.voidedBy,
          sourceDocumentNo: payable.sourceDocumentNo || purchase.documentNo,
          relatedDocumentNos: mergeDocumentNos(payable.relatedDocumentNos, [purchase.documentNo])
        })
        : payable);
      const latestEffectivePurchase = purchases.find(
        (p) => p.productId === purchase.productId && isDocumentEffective(p)
      );
      if (latestEffectivePurchase) {
        products = products.map((item) =>
          item.id === purchase.productId
            ? Object.assign({}, item, { cost: latestEffectivePurchase.unitCost })
            : item
        );
      }
      return true;
    }

    function removeSale(id, options) {
      const sale = sales.find((item) => item.id === Number(id));

      if (!sale) {
        return false;
      }

      if (isVoidedDocument(sale)) {
        return true;
      }

      const voidInfo = createVoidInfo(options);
      sales = sales.map((item) => item.id === sale.id ? Object.assign({}, item, voidInfo, {
        sourceDocumentNo: item.sourceDocumentNo || item.documentNo,
        relatedDocumentNos: mergeDocumentNos(item.relatedDocumentNos, [item.documentNo])
      }) : item);
      receivables = receivables.map((receivable) => receivable.sourceDocumentNo === sale.documentNo
        ? Object.assign({}, receivable, {
          status: "voided",
          voidReason: voidInfo.voidReason,
          voidedAt: voidInfo.voidedAt,
          voidedBy: voidInfo.voidedBy,
          sourceDocumentNo: receivable.sourceDocumentNo || sale.documentNo,
          relatedDocumentNos: mergeDocumentNos(receivable.relatedDocumentNos, [sale.documentNo])
        })
        : receivable);
      return true;
    }

    function transitionPurchase(id, action, options) {
      const purchase = purchases.find((item) => item.id === Number(id));
      if (!purchase) {
        return false;
      }

      const result = transitionDocumentRows(purchases, purchase.documentNo, purchase.id, action, options);
      if (!result || result.error) {
        return result;
      }

      purchases = result.rows;
      if (action === "confirm") {
        applyPurchaseOrderEffects(result.documentNo);
      }
      return result.lines.map(copyPurchase);
    }

    function transitionSale(id, action, options) {
      const sale = sales.find((item) => item.id === Number(id));
      if (!sale) {
        return false;
      }

      const documentNo = sale.documentNo || "";
      if (action === "confirm") {
        const lines = sales.filter((item) => sameDocument(item, documentNo, sale.id));
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

      const result = transitionDocumentRows(sales, documentNo, sale.id, action, options);
      if (!result || result.error) {
        return result;
      }

      sales = result.rows;
      if (action === "confirm") {
        const now = new Date().toISOString();
        sales = sales.map((item) => sameDocument(item, result.documentNo, id)
          ? Object.assign({}, item, { costBasis: createCostBasis(item.productId, item.quantity, now) })
          : item);
        applySaleOrderEffects(result.documentNo);
      }
      return result.lines.map(copySale);
    }

    function updatePurchaseOwner(id, input) {
      const purchase = purchases.find((item) => item.id === Number(id));
      if (!purchase) {
        return false;
      }

      const result = updateDocumentOwnerRows(purchases, purchase.documentNo, purchase.id, input);
      if (!result || result.error) {
        return result;
      }

      purchases = result.rows;
      return result.lines.map(copyPurchase);
    }

    function updateSaleOwner(id, input) {
      const sale = sales.find((item) => item.id === Number(id));
      if (!sale) {
        return false;
      }

      const result = updateDocumentOwnerRows(sales, sale.documentNo, sale.id, input);
      if (!result || result.error) {
        return result;
      }

      sales = result.rows;
      return result.lines.map(copySale);
    }

    function addSalesReturn(input) {
      const source = sales.find((item) => item.id === Number(input && input.sourceLineId));
      if (!source || !isDocumentEffective(source)) {
        return null;
      }

      const quantity = positiveNumber(input && input.quantity);
      const returned = returnedQuantityForSource("salesReturn", source.id);
      if (quantity === null || quantity > source.quantity - returned) {
        return { error: "RETURN_QUANTITY_EXCEEDS_SOURCE" };
      }

      const date = normalizeDate(input && input.date) || todayString();
      const returnRow = normalizeReturn({
        documentType: "salesReturn",
        documentNo: nextDocumentNo("SRTN", date, returns),
        sourceDocumentNo: source.documentNo,
        sourceLineId: source.id,
        productId: source.productId,
        warehouseId: source.warehouseId,
        quantity,
        unitAmount: source.unitPrice,
        costBasis: source.costBasis,
        reason: input && input.reason,
        date,
        inspectionStatus: input && input.inspectionStatus,
        createdBy: input && input.user,
        confirmedBy: input && input.user,
        relatedDocumentNos: [source.documentNo],
        status: "confirmed"
      }, nextReturnId);

      if (!returnRow) {
        return null;
      }

      nextReturnId += 1;
      returns = [returnRow].concat(returns);
      reduceReceivableForReturn(returnRow);
      return copyReturn(returnRow);
    }

    function addPurchaseReturn(input) {
      const source = purchases.find((item) => item.id === Number(input && input.sourceLineId));
      if (!source || !isDocumentEffective(source)) {
        return null;
      }

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
        documentNo: nextDocumentNo("PRTN", date, returns),
        sourceDocumentNo: source.documentNo,
        sourceLineId: source.id,
        productId: source.productId,
        warehouseId: source.warehouseId,
        quantity,
        unitAmount: source.unitCost,
        reason: input && input.reason,
        date,
        inspectionStatus: input && input.inspectionStatus,
        createdBy: input && input.user,
        confirmedBy: input && input.user,
        relatedDocumentNos: [source.documentNo],
        status: "confirmed"
      }, nextReturnId);

      if (!returnRow) {
        return null;
      }

      nextReturnId += 1;
      returns = [returnRow].concat(returns);
      reducePayableForReturn(returnRow);
      return copyReturn(returnRow);
    }

    function createVoidReversal(type, id, options) {
      const isPurchase = type === "purchase";
      const source = isPurchase
        ? purchases.find((item) => item.id === Number(id))
        : sales.find((item) => item.id === Number(id));
      if (!source || !isVoidedDocument(source)) {
        return null;
      }

      const existing = findVoidReversal(type, id);
      if (existing) {
        return existing;
      }

      const date = source.voidedAt ? source.voidedAt.slice(0, 10) : todayString();
      const documentType = isPurchase ? "purchaseReturn" : "salesReturn";
      const documentNo = nextDocumentNo(isPurchase ? "PRTN" : "SRTN", date, returns);
      const user = normalizeText(options && options.user) || source.voidedBy || "本機使用者";
      const returnRow = normalizeReturn({
        documentType,
        documentNo,
        sourceDocumentNo: source.documentNo,
        sourceLineId: source.id,
        productId: source.productId,
        warehouseId: source.warehouseId,
        quantity: source.quantity,
        unitAmount: isPurchase ? source.unitCost : source.unitPrice,
        costBasis: source.costBasis,
        reason: `作廢沖銷：${source.voidReason || "未填寫作廢原因"}`,
        date,
        inspectionStatus: "reversal",
        createdBy: user,
        confirmedBy: user,
        relatedDocumentNos: [source.documentNo],
        status: "reversed"
      }, nextReturnId);

      if (!returnRow) {
        return null;
      }

      nextReturnId += 1;
      returns = [returnRow].concat(returns);
      const linkedSource = {
        status: "reversed",
        reversalDocumentNo: documentNo,
        relatedDocumentNos: mergeDocumentNos(source.relatedDocumentNos, [source.documentNo, documentNo])
      };
      if (isPurchase) {
        purchases = purchases.map((item) => item.id === source.id ? Object.assign({}, item, linkedSource) : item);
      } else {
        sales = sales.map((item) => item.id === source.id ? Object.assign({}, item, linkedSource) : item);
      }

      return copyReturn(returnRow);
    }

    function addStockAdjustment(input) {
      const adjustment = normalizeAdjustment(input, nextAdjustmentId);
      const product = findProduct(adjustment && adjustment.productId);
      const warehouse = resolveActiveWarehouse(adjustment && adjustment.warehouseId);

      if (!adjustment || !product || !product.active || !warehouse) {
        return null;
      }

      const saved = Object.assign({}, adjustment, {
        warehouseId: warehouse.id,
        documentNo: adjustment.documentNo || nextDocumentNo("ADJ", adjustment.date, adjustments)
      });
      nextAdjustmentId += 1;
      adjustments = [saved].concat(adjustments);
      return copyAdjustment(saved);
    }

    function addStockCount(input) {
      const productId = Number(input && input.productId);
      const countedQuantity = nonNegativeNumber(input && input.countedQuantity);
      const product = findProduct(productId);
      const warehouse = resolveActiveWarehouse(input && input.warehouseId);

      if (!product || !product.active || countedQuantity === null || !warehouse) {
        return null;
      }

      const diff = countedQuantity - stockForProduct(productId, warehouse.id).onHand;
      if (diff === 0) {
        return { error: "NO_DIFFERENCE" };
      }

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

      if (!date || !items.length || !fromWarehouse || !toWarehouse || fromWarehouse.id === toWarehouse.id) {
        return null;
      }

      if (items.some((item) => {
        const product = findProduct(item.productId);
        return !product || !product.active;
      })) {
        return null;
      }

      const requestedByProduct = new Map();
      items.forEach((item) => {
        requestedByProduct.set(item.productId, (requestedByProduct.get(item.productId) || 0) + item.quantity);
      });

      for (const [productId, quantity] of requestedByProduct.entries()) {
        if (stockForProduct(productId, fromWarehouse.id).onHand < quantity) {
          return { error: "INSUFFICIENT_STOCK" };
        }
      }

      const documentNo = normalizeText(input && input.documentNo) || nextDocumentNo("TRF", date, transfers);
      const created = items.map((item) => {
        const transfer = normalizeTransfer({
          productId: item.productId,
          fromWarehouseId: fromWarehouse.id,
          toWarehouseId: toWarehouse.id,
          quantity: item.quantity,
          date,
          note: input && input.note,
          documentNo
        }, nextTransferId);
        nextTransferId += 1;
        return transfer;
      }).filter(Boolean);

      transfers = created.concat(transfers);

      return {
        documentNo,
        lines: created.map(copyTransfer),
        totalQuantity: created.reduce((sum, item) => sum + item.quantity, 0)
      };
    }

    function listProducts(options) {
      const filter = Object.assign({ query: "", category: "", activeOnly: false }, options);
      const query = normalizeText(filter.query).toLowerCase();

      return products
        .filter((product) => !filter.activeOnly || product.active)
        .filter((product) => !filter.category || product.category === filter.category)
        .filter((product) => {
          if (!query) {
            return true;
          }

          return [product.sku, product.name, product.category]
            .some((value) => normalizeText(value).toLowerCase().includes(query));
        })
        .slice()
        .sort((a, b) => a.sku.localeCompare(b.sku))
        .map(copyProduct);
    }

    function listPurchases(options) {
      const filter = Object.assign({ query: "", month: "", includeVoided: false }, options);
      const query = normalizeText(filter.query).toLowerCase();

      return purchases
        .filter((purchase) => filter.includeVoided || !isVoidedDocument(purchase))
        .filter((purchase) => !filter.month || purchase.date.slice(0, 7) === filter.month)
        .filter((purchase) => {
          if (!query) {
            return true;
          }

          const product = findProduct(purchase.productId);
          const warehouse = findWarehouse(purchase.warehouseId);
          return [
            product && product.sku,
            product && product.name,
            warehouse && warehouse.code,
            warehouse && warehouse.name,
            purchase.documentNo,
            purchase.sourceDocumentNo,
            purchase.reversalDocumentNo,
            purchase.voidReason,
            purchase.voidedBy,
            purchase.supplier,
            purchase.note
          ].some((value) => normalizeText(value).toLowerCase().includes(query));
        })
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
        .map(copyPurchase);
    }

    function listSales(options) {
      const filter = Object.assign({ query: "", month: "", includeVoided: false }, options);
      const query = normalizeText(filter.query).toLowerCase();

      return sales
        .filter((sale) => filter.includeVoided || !isVoidedDocument(sale))
        .filter((sale) => !filter.month || sale.date.slice(0, 7) === filter.month)
        .filter((sale) => {
          if (!query) {
            return true;
          }

          const product = findProduct(sale.productId);
          const warehouse = findWarehouse(sale.warehouseId);
          return [
            product && product.sku,
            product && product.name,
            warehouse && warehouse.code,
            warehouse && warehouse.name,
            sale.documentNo,
            sale.sourceDocumentNo,
            sale.reversalDocumentNo,
            sale.voidReason,
            sale.voidedBy,
            sale.customer,
            sale.note
          ].some((value) => normalizeText(value).toLowerCase().includes(query));
        })
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
        .map(copySale);
    }

    function listPartners(options) {
      const filter = Object.assign({ query: "", role: "", activeOnly: false }, options);
      const query = normalizeText(filter.query).toLowerCase();

      return partners
        .filter((partner) => !filter.activeOnly || partner.active)
        .filter((partner) => !filter.role || partner.role === filter.role)
        .filter((partner) => {
          if (!query) {
            return true;
          }

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

      return departments
        .filter((department) => !filter.activeOnly || department.active)
        .filter((department) => {
          if (!query) {
            return true;
          }

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

      return employees
        .filter((employee) => !filter.activeOnly || employee.active)
        .filter((employee) => !filter.role || employee.role === filter.role)
        .filter((employee) => !filter.departmentId || employee.departmentId === Number(filter.departmentId))
        .filter((employee) => {
          if (!query) {
            return true;
          }

          const department = departments.find((item) => item.id === employee.departmentId);
          return [
            employee.employeeNo,
            employee.name,
            employee.role,
            department && department.code,
            department && department.name,
            employee.note
          ].some((value) => normalizeText(value).toLowerCase().includes(query));
        })
        .slice()
        .sort((a, b) => a.employeeNo.localeCompare(b.employeeNo))
        .map(copyEmployee);
    }

    function listPermissionScopes(options) {
      const filter = Object.assign({ employeeId: 0, activeOnly: false }, options);
      return permissionScopes
        .filter((scope) => !filter.employeeId || scope.employeeId === Number(filter.employeeId))
        .filter((scope) => !filter.activeOnly || scope.active)
        .slice()
        .sort((a, b) => a.employeeId - b.employeeId || a.id - b.id)
        .map(copyPermissionScope);
    }

    function listProductCategories(options) {
      const filter = Object.assign({ query: "", activeOnly: false }, options);
      const query = normalizeText(filter.query).toLowerCase();

      return productCategories
        .filter((category) => !filter.activeOnly || category.active)
        .filter((category) => {
          if (!query) {
            return true;
          }

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

      return warehouses
        .filter((warehouse) => !filter.activeOnly || warehouse.active)
        .filter((warehouse) => {
          if (!query) {
            return true;
          }

          return [warehouse.code, warehouse.name, warehouse.type, warehouse.note]
            .some((value) => normalizeText(value).toLowerCase().includes(query));
        })
        .slice()
        .sort((a, b) => a.code.localeCompare(b.code))
        .map(copyWarehouse);
    }

    function listAdjustments(options) {
      const filter = Object.assign({ query: "", month: "" }, options);
      const query = normalizeText(filter.query).toLowerCase();

      return adjustments
        .filter((adjustment) => !filter.month || adjustment.date.slice(0, 7) === filter.month)
        .filter((adjustment) => {
          if (!query) {
            return true;
          }

          const product = findProduct(adjustment.productId);
          const warehouse = findWarehouse(adjustment.warehouseId);
          return [
            product && product.sku,
            product && product.name,
            warehouse && warehouse.code,
            warehouse && warehouse.name,
            adjustment.documentNo,
            adjustment.reason,
            adjustment.note
          ].some((value) => normalizeText(value).toLowerCase().includes(query));
        })
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
        .map(copyAdjustment);
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

    function listTransfers(options) {
      const filter = Object.assign({ query: "", month: "" }, options);
      const query = normalizeText(filter.query).toLowerCase();

      return transfers
        .filter((transfer) => !filter.month || transfer.date.slice(0, 7) === filter.month)
        .filter((transfer) => {
          if (!query) {
            return true;
          }

          const product = findProduct(transfer.productId);
          const fromWarehouse = findWarehouse(transfer.fromWarehouseId);
          const toWarehouse = findWarehouse(transfer.toWarehouseId);
          return [
            product && product.sku,
            product && product.name,
            fromWarehouse && fromWarehouse.code,
            fromWarehouse && fromWarehouse.name,
            toWarehouse && toWarehouse.code,
            toWarehouse && toWarehouse.name,
            transfer.documentNo,
            transfer.note
          ].some((value) => normalizeText(value).toLowerCase().includes(query));
        })
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
        .map(copyTransfer);
    }

    function listReturns(options) {
      const filter = Object.assign({ query: "", month: "", documentType: "" }, options);
      const query = normalizeText(filter.query).toLowerCase();

      return returns
        .filter((returnRow) => !filter.documentType || returnRow.documentType === filter.documentType)
        .filter((returnRow) => !filter.month || returnRow.date.slice(0, 7) === filter.month)
        .filter((returnRow) => {
          if (!query) {
            return true;
          }

          const product = findProduct(returnRow.productId);
          const warehouse = findWarehouse(returnRow.warehouseId);
          return [
            product && product.sku,
            product && product.name,
            warehouse && warehouse.code,
            warehouse && warehouse.name,
            returnRow.documentNo,
            returnRow.sourceDocumentNo,
            returnRow.reason
          ].some((value) => normalizeText(value).toLowerCase().includes(query));
        })
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
        .map(copyReturn);
    }

    function listCostLayers(options) {
      const filter = Object.assign({ productId: 0, method: "" }, options);
      return costLayers
        .filter((layer) => !filter.productId || layer.productId === Number(filter.productId))
        .filter((layer) => !filter.method || layer.method === filter.method)
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
        .map(copyCostLayer);
    }

    function listReceivables(options) {
      const filter = Object.assign({ query: "", status: "", month: "" }, options);
      const query = normalizeText(filter.query).toLowerCase();

      return receivables
        .filter((receivable) => !filter.status || receivable.status === filter.status)
        .filter((receivable) => !filter.month || receivable.dueDate.slice(0, 7) === filter.month)
        .filter((receivable) => {
          if (!query) {
            return true;
          }

          return [
            receivable.sourceType,
            receivable.sourceDocumentNo,
            receivable.customer,
            receivable.status,
            receivable.note
          ].some((value) => normalizeText(value).toLowerCase().includes(query));
        })
        .slice()
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || b.id - a.id)
        .map(copyReceivable);
    }

    function listPayables(options) {
      const filter = Object.assign({ query: "", status: "", month: "" }, options);
      const query = normalizeText(filter.query).toLowerCase();

      return payables
        .filter((payable) => !filter.status || payable.status === filter.status)
        .filter((payable) => !filter.month || payable.dueDate.slice(0, 7) === filter.month)
        .filter((payable) => {
          if (!query) {
            return true;
          }

          return [
            payable.sourceType,
            payable.sourceDocumentNo,
            payable.supplier,
            payable.status,
            payable.note
          ].some((value) => normalizeText(value).toLowerCase().includes(query));
        })
        .slice()
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || b.id - a.id)
        .map(copyPayable);
    }

    function listPayments(options) {
      const filter = Object.assign({ query: "", direction: "", month: "" }, options);
      const query = normalizeText(filter.query).toLowerCase();

      return payments
        .filter((payment) => !filter.direction || payment.direction === filter.direction)
        .filter((payment) => !filter.month || payment.date.slice(0, 7) === filter.month)
        .filter((payment) => {
          if (!query) {
            return true;
          }

          const target = payment.targetType === "receivable"
            ? receivables.find((item) => item.id === payment.targetId)
            : payables.find((item) => item.id === payment.targetId);
          return [
            payment.direction,
            payment.targetType,
            payment.method,
            payment.note,
            target && target.sourceDocumentNo,
            target && (target.customer || target.supplier)
          ].some((value) => normalizeText(value).toLowerCase().includes(query));
        })
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
        .map(copyPayment);
    }

    function recordAuditEvent(input) {
      const event = normalizeAuditEvent(input, nextAuditId);
      if (!event) {
        return null;
      }

      nextAuditId += 1;
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
          if (!query) {
            return true;
          }

          return [
            event.actorName,
            event.roleAtOperation,
            event.action,
            event.entityType,
            event.entityId,
            event.documentNo,
            event.sourceDocumentNo,
            event.summary,
            event.reason,
            event.result,
            event.riskLevel
          ].some((value) => normalizeText(value).toLowerCase().includes(query))
            || event.relatedDocumentNos.some((value) => normalizeText(value).toLowerCase().includes(query));
        })
        .slice()
        .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt) || b.auditId - a.auditId)
        .map(copyAuditLog);
    }

    function financeSummary(options) {
      const filter = Object.assign({ month: "" }, options);
      const receivableRows = receivables
        .filter((item) => item.status !== "voided")
        .filter((item) => !filter.month || item.dueDate.slice(0, 7) === filter.month);
      const payableRows = payables
        .filter((item) => item.status !== "voided")
        .filter((item) => !filter.month || item.dueDate.slice(0, 7) === filter.month);
      const paymentRows = payments
        .filter((item) => item.status !== "voided")
        .filter((item) => !filter.month || item.date.slice(0, 7) === filter.month);

      return {
        receivableTotal: receivableRows.reduce((sum, item) => sum + item.amount, 0),
        receivablePaid: receivableRows.reduce((sum, item) => sum + item.paidAmount, 0),
        receivableBalance: receivableRows.reduce((sum, item) => sum + item.amount - item.paidAmount, 0),
        payableTotal: payableRows.reduce((sum, item) => sum + item.amount, 0),
        payablePaid: payableRows.reduce((sum, item) => sum + item.paidAmount, 0),
        payableBalance: payableRows.reduce((sum, item) => sum + item.amount - item.paidAmount, 0),
        cashIn: paymentRows.filter((item) => item.direction === "in").reduce((sum, item) => sum + item.amount, 0),
        cashOut: paymentRows.filter((item) => item.direction === "out").reduce((sum, item) => sum + item.amount, 0)
      };
    }

    function categories() {
      const categoryNames = productCategories
        .filter((category) => category.active)
        .map((category) => category.name)
        .concat(products.map((product) => product.category));

      return Array.from(new Set(categoryNames))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));
    }

    function exportInventoryRows(options) {
      return reports.exportInventoryRows(reportState(), options);
    }

    function reportState() {
      return {
        products,
        departments,
        employees,
        permissionScopes,
        purchases,
        sales,
        adjustments,
        transfers,
        returns,
        costLayers,
        warehouses,
        receivables,
        payables,
        payments,
        auditLogs,
        preferences
      };
    }

    function snapshot() {
      return {
        products: products.map(copyProduct),
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

    function stockForProduct(productId, warehouseId) {
      return reports.stockForProduct(reportState(), productId, warehouseId);
    }

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
      const active = warehouses
        .filter((warehouse) => warehouse.active)
        .sort((a, b) => a.id - b.id)[0];
      const first = active || warehouses.slice().sort((a, b) => a.id - b.id)[0] || defaultWarehouse();
      return first.id;
    }

    function resolveActiveWarehouse(id) {
      const warehouseId = Number(id);
      const warehouse = warehouseId ? findWarehouse(warehouseId) : findWarehouse(defaultWarehouseId());
      return warehouse && warehouse.active ? warehouse : null;
    }

    function applyPaymentToTarget(payment) {
      if (payment.targetType === "receivable") {
        receivables = receivables.map((receivable) => {
          if (receivable.id !== payment.targetId) {
            return receivable;
          }

          const paidAmount = receivable.paidAmount + payment.amount;
          return Object.assign({}, receivable, {
            paidAmount,
            status: financeStatus(receivable.amount, paidAmount)
          });
        });
        return;
      }

      payables = payables.map((payable) => {
        if (payable.id !== payment.targetId) {
          return payable;
        }

        const paidAmount = payable.paidAmount + payment.amount;
        return Object.assign({}, payable, {
          paidAmount,
          status: financeStatus(payable.amount, paidAmount)
        });
      });
    }

    function transitionDocumentRows(rows, documentNo, id, action, options) {
      const lines = rows.filter((item) => sameDocument(item, documentNo, id));
      if (!lines.length) {
        return false;
      }

      if (lines.some((line) => isVoidedDocument(line))) {
        return { error: "DOCUMENT_CLOSED" };
      }

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
      if (!lines.length) {
        return false;
      }

      if (lines.some((line) => isVoidedDocument(line))) {
        return { error: "DOCUMENT_CLOSED" };
      }

      const currentStatus = normalizeDocumentStatus(lines[0].status);
      if (!["draft", "submitted", "approved"].includes(currentStatus)) {
        return { error: "DOCUMENT_CLOSED" };
      }

      const ownerEmployeeId = Number(input && input.ownerEmployeeId) || 0;
      const ownerDepartmentId = Number(input && input.ownerDepartmentId) || 0;
      if (!ownerEmployeeId || !ownerDepartmentId) {
        return null;
      }

      const editedBy = Number(input && input.lastEditedByEmployeeId) || ownerEmployeeId;
      const updatedLines = lines.map((line) => Object.assign({}, line, {
        ownerEmployeeId,
        ownerDepartmentId,
        lastEditedByEmployeeId: editedBy
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

      if (action === "submit") {
        return { submittedBy: user, submittedAt: now };
      }

      if (action === "approve") {
        return { approvedBy: user, approvedAt: now };
      }

      if (action === "reject") {
        return { rejectedBy: user, rejectedAt: now, rejectReason: reason };
      }

      if (action === "confirm") {
        return { confirmedBy: user, confirmedAt: now };
      }

      if (action === "requestVoid") {
        return { voidRequestedBy: user, voidRequestedAt: now, voidRequestReason: reason };
      }

      return {};
    }

    function applyPurchaseOrderEffects(documentNo) {
      const lines = purchases.filter((item) => sameDocument(item, documentNo, 0));
      if (!lines.length) {
        return;
      }

      const first = lines[0];
      if (first.createPayable && !payables.some((item) => item.sourceDocumentNo === documentNo)) {
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
      products = products.map((product) => {
        const latestLine = lines.find((item) => item.productId === product.id);
        return latestLine ? Object.assign({}, product, { cost: latestLine.unitCost }) : product;
      });
    }

    function applySaleOrderEffects(documentNo) {
      const lines = sales.filter((item) => sameDocument(item, documentNo, 0));
      if (!lines.length) {
        return;
      }

      const first = lines[0];
      if (first.createReceivable && !receivables.some((item) => item.sourceDocumentNo === documentNo)) {
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

    function reduceReceivableForReturn(returnRow) {
      const amount = returnRow.quantity * returnRow.unitAmount;
      receivables = receivables.map((receivable) => {
        if (receivable.sourceDocumentNo !== returnRow.sourceDocumentNo || receivable.status === "voided") {
          return receivable;
        }

        const nextAmount = Math.max(0, receivable.amount - amount);
        const nextPaidAmount = Math.min(receivable.paidAmount, nextAmount);
        return Object.assign({}, receivable, {
          amount: nextAmount,
          paidAmount: nextPaidAmount,
          status: financeStatus(nextAmount, nextPaidAmount),
          note: appendNote(receivable.note, `Return ${returnRow.documentNo}`),
          relatedDocumentNos: mergeDocumentNos(receivable.relatedDocumentNos, [returnRow.sourceDocumentNo, returnRow.documentNo])
        });
      });
    }

    function reducePayableForReturn(returnRow) {
      const amount = returnRow.quantity * returnRow.unitAmount;
      payables = payables.map((payable) => {
        if (payable.sourceDocumentNo !== returnRow.sourceDocumentNo || payable.status === "voided") {
          return payable;
        }

        const nextAmount = Math.max(0, payable.amount - amount);
        const nextPaidAmount = Math.min(payable.paidAmount, nextAmount);
        return Object.assign({}, payable, {
          amount: nextAmount,
          paidAmount: nextPaidAmount,
          status: financeStatus(nextAmount, nextPaidAmount),
          note: appendNote(payable.note, `Return ${returnRow.documentNo}`),
          relatedDocumentNos: mergeDocumentNos(payable.relatedDocumentNos, [returnRow.sourceDocumentNo, returnRow.documentNo])
        });
      });
    }

    function ensureCostLayer(purchase) {
      if (!purchase || !isDocumentEffective(purchase) || costLayers.some((layer) => layer.sourceLineId === purchase.id && layer.sourceDocumentNo === purchase.documentNo)) {
        return;
      }

      costLayers = [{
        id: nextCostLayerId,
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
      }].concat(costLayers);
      nextCostLayerId += 1;
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
      return returns
        .filter((returnRow) => returnRow.documentType === documentType && returnRow.sourceLineId === Number(sourceLineId) && isDocumentEffective(returnRow))
        .reduce((sum, returnRow) => sum + returnRow.quantity, 0);
    }

    function appendNote(note, addition) {
      const current = normalizeText(note);
      return current ? `${current}; ${addition}` : addition;
    }

    function sameDocument(row, documentNo, id) {
      if (!row) {
        return false;
      }

      if (documentNo) {
        return row.documentNo === documentNo;
      }

      return row.id === Number(id);
    }

    function isDocumentEffective(row) {
      return !row || !row.status || row.status === "confirmed" || row.status === "amended" || row.status === "voidRequested";
    }

    function createVoidInfo(options) {
      const now = new Date().toISOString();
      const reason = normalizeText(options && options.reason) || "未填寫作廢原因";
      const user = normalizeText(options && options.user) || "本機使用者";

      return {
        status: "voided",
        voidReason: reason,
        voidedAt: now,
        voidedBy: user
      };
    }

    function findVoidReversal(type, id) {
      const isPurchase = type === "purchase";
      const documentType = isPurchase ? "purchaseReturn" : "salesReturn";
      const sourceId = Number(id);
      const found = returns.find((returnRow) => {
        return returnRow.documentType === documentType
          && returnRow.sourceLineId === sourceId
          && returnRow.status === "reversed";
      });
      return found ? copyReturn(found) : null;
    }

    return {
      addProduct,
      addPurchase,
      addSale,
      categories,
      dashboard,
      deactivateProduct,
      deactivatePartner,
      addDepartment,
      addEmployee,
      addPermissionScope,
      addPartner,
      addProductCategory,
      addWarehouse,
      addStockAdjustment,
      addStockCount,
      addTransferOrder,
      addReceivable,
      addPayable,
      addPayment,
      recordAuditEvent,
      listAuditLogs,
      updatePreferences,
      getPreferences,
      exportInventoryRows,
      financeSummary,
      grossProfitRanking,
      warehouseStockSummary,
      productWarehouseSummary,
      warehouseTransferSummary,
      inventoryReport,
      listPartners,
      listDepartments,
      listEmployees,
      listPermissionScopes,
      listProductCategories,
      listWarehouses,
      listProducts,
      listPurchases,
      listSales,
      listAdjustments,
      listTransfers,
      listReturns,
      listCostLayers,
      listReceivables,
      listPayables,
      listPayments,
      addPurchaseOrder,
      addSaleOrder,
      updatePurchaseOwner,
      updateSaleOwner,
      addSalesReturn,
      addPurchaseReturn,
      createVoidReversal,
      findVoidReversal,
      reportSummary,
      removePurchase,
      removeSale,
      transitionPurchase,
      transitionSale,
      snapshot,
      stockMovements,
      updatePartner,
      updateProduct,
      deactivateDepartment,
      deactivateEmployee,
      deactivateProductCategory,
      deactivateWarehouse
    };
  }

  function normalizeProduct(input, id) {
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
      id,
      sku,
      name,
      category,
      unit,
      cost,
      price,
      safetyStock,
      active: input && input.active === false ? false : true
    };
  }

  function normalizeAdjustment(input, id) {
    const productId = Number(input && input.productId);
    const quantity = Math.round(Number(input && input.quantity));
    const date = normalizeDate(input && input.date);

    if (!productId || !Number.isFinite(quantity) || quantity === 0 || !date) {
      return null;
    }

    return {
      id,
      productId,
      warehouseId: Number(input && input.warehouseId) || 0,
      quantity,
      reason: normalizeText(input && input.reason) || "調整",
      date,
      note: normalizeText(input && input.note),
      documentNo: normalizeText(input && input.documentNo)
    };
  }

  function copyProduct(product) {
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

  function copyPurchase(purchase) {
    return {
      id: Number(purchase.id),
      productId: Number(purchase.productId),
      warehouseId: Number(purchase.warehouseId) || 0,
      quantity: positiveNumber(purchase.quantity) || 0,
      unitCost: nonNegativeNumber(purchase.unitCost) || 0,
      supplier: normalizeText(purchase.supplier),
      date: normalizeDate(purchase.date),
      note: normalizeText(purchase.note),
      documentNo: normalizeText(purchase.documentNo),
      status: normalizeDocumentStatus(purchase.status),
      createPayable: Boolean(purchase.createPayable),
      dueDate: normalizeDate(purchase.dueDate),
      createdBy: normalizeText(purchase.createdBy),
      ownerEmployeeId: Number(purchase.ownerEmployeeId) || 0,
      ownerDepartmentId: Number(purchase.ownerDepartmentId) || 0,
      createdByEmployeeId: Number(purchase.createdByEmployeeId) || 0,
      lastEditedByEmployeeId: Number(purchase.lastEditedByEmployeeId) || 0,
      submittedBy: normalizeText(purchase.submittedBy),
      submittedAt: normalizeText(purchase.submittedAt),
      approvedBy: normalizeText(purchase.approvedBy),
      approvedAt: normalizeText(purchase.approvedAt),
      rejectedBy: normalizeText(purchase.rejectedBy),
      rejectedAt: normalizeText(purchase.rejectedAt),
      rejectReason: normalizeText(purchase.rejectReason),
      confirmedBy: normalizeText(purchase.confirmedBy),
      confirmedAt: normalizeText(purchase.confirmedAt),
      voidRequestedBy: normalizeText(purchase.voidRequestedBy),
      voidRequestedAt: normalizeText(purchase.voidRequestedAt),
      voidRequestReason: normalizeText(purchase.voidRequestReason),
      voidReason: normalizeText(purchase.voidReason),
      voidedAt: normalizeText(purchase.voidedAt),
      voidedBy: normalizeText(purchase.voidedBy),
      sourceDocumentNo: normalizeText(purchase.sourceDocumentNo),
      reversalDocumentNo: normalizeText(purchase.reversalDocumentNo),
      relatedDocumentNos: normalizeDocumentNoList(purchase.relatedDocumentNos)
    };
  }

  function copySale(sale) {
    return {
      id: Number(sale.id),
      productId: Number(sale.productId),
      warehouseId: Number(sale.warehouseId) || 0,
      quantity: positiveNumber(sale.quantity) || 0,
      unitPrice: nonNegativeNumber(sale.unitPrice) || 0,
      customer: normalizeText(sale.customer),
      date: normalizeDate(sale.date),
      note: normalizeText(sale.note),
      documentNo: normalizeText(sale.documentNo),
      status: normalizeDocumentStatus(sale.status),
      costBasis: normalizeCostBasis(sale.costBasis),
      createReceivable: Boolean(sale.createReceivable),
      dueDate: normalizeDate(sale.dueDate),
      createdBy: normalizeText(sale.createdBy),
      ownerEmployeeId: Number(sale.ownerEmployeeId) || 0,
      ownerDepartmentId: Number(sale.ownerDepartmentId) || 0,
      createdByEmployeeId: Number(sale.createdByEmployeeId) || 0,
      lastEditedByEmployeeId: Number(sale.lastEditedByEmployeeId) || 0,
      submittedBy: normalizeText(sale.submittedBy),
      submittedAt: normalizeText(sale.submittedAt),
      approvedBy: normalizeText(sale.approvedBy),
      approvedAt: normalizeText(sale.approvedAt),
      rejectedBy: normalizeText(sale.rejectedBy),
      rejectedAt: normalizeText(sale.rejectedAt),
      rejectReason: normalizeText(sale.rejectReason),
      confirmedBy: normalizeText(sale.confirmedBy),
      confirmedAt: normalizeText(sale.confirmedAt),
      voidRequestedBy: normalizeText(sale.voidRequestedBy),
      voidRequestedAt: normalizeText(sale.voidRequestedAt),
      voidRequestReason: normalizeText(sale.voidRequestReason),
      voidReason: normalizeText(sale.voidReason),
      voidedAt: normalizeText(sale.voidedAt),
      voidedBy: normalizeText(sale.voidedBy),
      sourceDocumentNo: normalizeText(sale.sourceDocumentNo),
      reversalDocumentNo: normalizeText(sale.reversalDocumentNo),
      relatedDocumentNos: normalizeDocumentNoList(sale.relatedDocumentNos)
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
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return {};
    }

    return Object.keys(value).slice(0, 20).reduce((snapshot, key) => {
      const normalizedKey = normalizeText(key);
      const rawValue = value[key];
      if (!normalizedKey) {
        return snapshot;
      }

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

  function isVoidedDocument(row) {
    return row && (row.status === "voided" || row.status === "reversed");
  }

  function normalizeDocumentStatus(status) {
    const value = normalizeText(status);
    return [
      "draft",
      "submitted",
      "approved",
      "rejected",
      "confirmed",
      "amended",
      "voidRequested",
      "voided",
      "reversed"
    ].includes(value) ? value : "confirmed";
  }

  function normalizeDocumentNoList(value) {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map(normalizeText).filter(Boolean);
  }

  function normalizeCostBasis(value) {
    const basis = value && typeof value === "object" ? value : {};
    const unitCost = nonNegativeNumber(basis.unitCost);
    const totalCost = nonNegativeNumber(basis.totalCost);
    const quantity = positiveNumber(basis.quantity);

    if (unitCost === null && totalCost === null) {
      return null;
    }

    return {
      method: normalizeText(basis.method) || "standardCost",
      unitCost: unitCost === null ? 0 : unitCost,
      quantity: quantity === null ? 0 : quantity,
      totalCost: totalCost === null ? (unitCost || 0) * (quantity || 0) : totalCost,
      source: normalizeText(basis.source) || "productCost",
      capturedAt: normalizeText(basis.capturedAt)
    };
  }

  function mergeDocumentNos(current, additions) {
    return Array.from(new Set(normalizeDocumentNoList(current).concat(normalizeDocumentNoList(additions))));
  }

  function copyAdjustment(adjustment) {
    return {
      id: Number(adjustment.id),
      productId: Number(adjustment.productId),
      warehouseId: Number(adjustment.warehouseId) || 0,
      quantity: Math.round(Number(adjustment.quantity)) || 0,
      reason: normalizeText(adjustment.reason) || "調整",
      date: normalizeDate(adjustment.date),
      note: normalizeText(adjustment.note),
      documentNo: normalizeText(adjustment.documentNo)
    };
  }

  function defaultWarehouse() {
    return {
      id: 1,
      code: "MAIN",
      name: "主倉",
      type: "warehouse",
      note: "預設倉庫",
      active: true
    };
  }

  function ensureWarehouseOnRow(row, warehouseId) {
    return Object.assign({}, row, {
      warehouseId: Number(row && row.warehouseId) || warehouseId
    });
  }

  function nextId(items) {
    return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
  }

  function sameSku(left, right) {
    return normalizeText(left).toUpperCase() === normalizeText(right).toUpperCase();
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
    if (!Array.isArray(items)) {
      return [];
    }

    return items.map((item) => {
      const productId = Number(item && item.productId);
      const quantity = positiveNumber(item && item.quantity);
      const price = nonNegativeNumber(item && item[priceField]);

      if (!productId || quantity === null || price === null) {
        return null;
      }

      return {
        productId,
        quantity,
        [priceField]: price
      };
    }).filter(Boolean);
  }

  function nextDocumentNo(prefix, date, rows) {
    const yyyymm = date.slice(0, 7).replace("-", "");
    const base = `${prefix}-${yyyymm}-`;
    const max = rows.reduce((current, row) => {
      const value = normalizeText(row.documentNo);
      if (!value.startsWith(base)) {
        return current;
      }

      const number = Number(value.slice(base.length));
      return Number.isFinite(number) ? Math.max(current, number) : current;
    }, 0);

    return `${base}${String(max + 1).padStart(3, "0")}`;
  }

  global.createInventoryStore = createInventoryStore;

  if (typeof module !== "undefined") {
    module.exports = { createInventoryStore };
  }
})(typeof window !== "undefined" ? window : globalThis);
