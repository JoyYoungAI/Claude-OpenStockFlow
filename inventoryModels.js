(function (global) {
  const utils = global.OpenStockFlowUtils || (typeof require !== "undefined" ? require("./inventoryUtils") : {});
  const {
    normalizeText,
    positiveNumber,
    nonNegativeNumber,
    normalizeDate
  } = utils;

  function normalizeProductCategory(input, id) {
    const code = normalizeText(input && input.code).toUpperCase();
    const name = normalizeText(input && input.name);
    const sortOrder = nonNegativeNumber(input && input.sortOrder);

    if (!code || !name || sortOrder === null) {
      return null;
    }

    return {
      id,
      code,
      name,
      sortOrder,
      note: normalizeText(input && input.note),
      active: input && input.active === false ? false : true
    };
  }

  function copyProductCategory(category) {
    return {
      id: Number(category.id),
      code: normalizeText(category.code).toUpperCase(),
      name: normalizeText(category.name),
      sortOrder: nonNegativeNumber(category.sortOrder) || 0,
      note: normalizeText(category.note),
      active: category.active === false ? false : true
    };
  }

  function sameCategory(left, right) {
    return normalizeText(left.code).toUpperCase() === normalizeText(right.code).toUpperCase()
      || normalizeText(left.name).toLowerCase() === normalizeText(right.name).toLowerCase();
  }

  function normalizeWarehouse(input, id) {
    const code = normalizeText(input && input.code).toUpperCase();
    const name = normalizeText(input && input.name);
    const type = normalizeText(input && input.type) || "warehouse";

    if (!code || !name) {
      return null;
    }

    return {
      id,
      code,
      name,
      type,
      note: normalizeText(input && input.note),
      active: input && input.active === false ? false : true
    };
  }

  function copyWarehouse(warehouse) {
    return {
      id: Number(warehouse.id),
      code: normalizeText(warehouse.code).toUpperCase(),
      name: normalizeText(warehouse.name),
      type: normalizeText(warehouse.type) || "warehouse",
      note: normalizeText(warehouse.note),
      active: warehouse.active === false ? false : true
    };
  }

  function sameWarehouse(left, right) {
    return normalizeText(left.code).toUpperCase() === normalizeText(right.code).toUpperCase()
      || normalizeText(left.name).toLowerCase() === normalizeText(right.name).toLowerCase();
  }

  function normalizePartner(input, id) {
    const role = input && input.role === "customer" ? "customer" : "supplier";
    const name = normalizeText(input && input.name);

    if (!name) {
      return null;
    }

    return {
      id,
      role,
      name,
      contact: normalizeText(input && input.contact),
      phone: normalizeText(input && input.phone),
      note: normalizeText(input && input.note),
      active: input && input.active === false ? false : true
    };
  }

  function copyPartner(partner) {
    return {
      id: Number(partner.id),
      role: partner.role === "customer" ? "customer" : "supplier",
      name: normalizeText(partner.name),
      contact: normalizeText(partner.contact),
      phone: normalizeText(partner.phone),
      note: normalizeText(partner.note),
      active: partner.active === false ? false : true
    };
  }

  function samePartner(left, right) {
    return left.role === right.role && normalizeText(left.name).toLowerCase() === normalizeText(right.name).toLowerCase();
  }

  function normalizeDepartment(input, id) {
    const code = normalizeText(input && input.code).toUpperCase();
    const name = normalizeText(input && input.name);
    const type = normalizeDepartmentType(input && input.type);

    if (!code || !name) {
      return null;
    }

    return {
      id,
      code,
      name,
      type,
      parentDepartmentId: Number(input && input.parentDepartmentId) || 0,
      managerEmployeeId: Number(input && input.managerEmployeeId) || 0,
      active: input && input.active === false ? false : true,
      note: normalizeText(input && input.note)
    };
  }

  function copyDepartment(department) {
    return {
      id: Number(department.id),
      code: normalizeText(department.code).toUpperCase(),
      name: normalizeText(department.name),
      type: normalizeDepartmentType(department.type),
      parentDepartmentId: Number(department.parentDepartmentId) || 0,
      managerEmployeeId: Number(department.managerEmployeeId) || 0,
      active: department.active === false ? false : true,
      note: normalizeText(department.note)
    };
  }

  function sameDepartment(left, right) {
    return normalizeText(left.code).toUpperCase() === normalizeText(right.code).toUpperCase()
      || normalizeText(left.name).toLowerCase() === normalizeText(right.name).toLowerCase();
  }

  function normalizeEmployee(input, id) {
    const employeeNo = normalizeText(input && input.employeeNo).toUpperCase();
    const name = normalizeText(input && input.name);
    const departmentId = Number(input && input.departmentId);
    const role = normalizeEmployeeRole(input && input.role);

    if (!employeeNo || !name || !departmentId) {
      return null;
    }

    return {
      id,
      employeeNo,
      name,
      departmentId,
      role,
      managerEmployeeId: Number(input && input.managerEmployeeId) || 0,
      active: input && input.active === false ? false : true,
      canLogin: input && input.canLogin === false ? false : true,
      note: normalizeText(input && input.note)
    };
  }

  function copyEmployee(employee) {
    return {
      id: Number(employee.id),
      employeeNo: normalizeText(employee.employeeNo).toUpperCase(),
      name: normalizeText(employee.name),
      departmentId: Number(employee.departmentId) || 0,
      role: normalizeEmployeeRole(employee.role),
      managerEmployeeId: Number(employee.managerEmployeeId) || 0,
      active: employee.active === false ? false : true,
      canLogin: employee.canLogin === false ? false : true,
      note: normalizeText(employee.note)
    };
  }

  function sameEmployee(left, right) {
    return normalizeText(left.employeeNo).toUpperCase() === normalizeText(right.employeeNo).toUpperCase();
  }

  function normalizePermissionScope(input, id) {
    const employeeId = Number(input && input.employeeId);
    const scopeType = normalizeScopeType(input && input.scopeType);
    const actions = normalizeTextList(input && input.actions);

    if (!employeeId || !actions.length) {
      return null;
    }

    return {
      id,
      employeeId,
      scopeType,
      departmentIds: normalizeNumberList(input && input.departmentIds),
      employeeIds: normalizeNumberList(input && input.employeeIds),
      actions,
      active: input && input.active === false ? false : true
    };
  }

  function copyPermissionScope(scope) {
    return {
      id: Number(scope.id),
      employeeId: Number(scope.employeeId) || 0,
      scopeType: normalizeScopeType(scope.scopeType),
      departmentIds: normalizeNumberList(scope.departmentIds),
      employeeIds: normalizeNumberList(scope.employeeIds),
      actions: normalizeTextList(scope.actions),
      active: scope.active === false ? false : true
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

  function normalizePurchase(input, id) {
    const productId = Number(input && input.productId);
    const quantity = positiveNumber(input && input.quantity);
    const unitCost = nonNegativeNumber(input && input.unitCost);
    const date = normalizeDate(input && input.date);

    if (!productId || quantity === null || unitCost === null || !date) {
      return null;
    }

    return {
      id,
      productId,
      warehouseId: Number(input && input.warehouseId) || 0,
      quantity,
      unitCost,
      supplier: normalizeText(input && input.supplier),
      date,
      note: normalizeText(input && input.note),
      documentNo: normalizeText(input && input.documentNo),
      status: normalizeDocumentStatus(input && input.status),
      createPayable: Boolean(input && input.createPayable),
      dueDate: normalizeDate(input && input.dueDate),
      createdBy: normalizeText(input && input.createdBy),
      ownerEmployeeId: Number(input && input.ownerEmployeeId) || 0,
      ownerDepartmentId: Number(input && input.ownerDepartmentId) || 0,
      createdByEmployeeId: Number(input && input.createdByEmployeeId) || 0,
      lastEditedByEmployeeId: Number(input && input.lastEditedByEmployeeId) || 0,
      submittedBy: normalizeText(input && input.submittedBy),
      submittedAt: normalizeText(input && input.submittedAt),
      approvedBy: normalizeText(input && input.approvedBy),
      approvedAt: normalizeText(input && input.approvedAt),
      rejectedBy: normalizeText(input && input.rejectedBy),
      rejectedAt: normalizeText(input && input.rejectedAt),
      rejectReason: normalizeText(input && input.rejectReason),
      confirmedBy: normalizeText(input && input.confirmedBy),
      confirmedAt: normalizeText(input && input.confirmedAt),
      voidRequestedBy: normalizeText(input && input.voidRequestedBy),
      voidRequestedAt: normalizeText(input && input.voidRequestedAt),
      voidRequestReason: normalizeText(input && input.voidRequestReason),
      receivedQuantity: nonNegativeNumber(input && input.receivedQuantity) || 0
    };
  }

  function normalizeSale(input, id) {
    const productId = Number(input && input.productId);
    const quantity = positiveNumber(input && input.quantity);
    const unitPrice = nonNegativeNumber(input && input.unitPrice);
    const date = normalizeDate(input && input.date);

    if (!productId || quantity === null || unitPrice === null || !date) {
      return null;
    }

    return {
      id,
      productId,
      warehouseId: Number(input && input.warehouseId) || 0,
      quantity,
      unitPrice,
      customer: normalizeText(input && input.customer),
      date,
      note: normalizeText(input && input.note),
      documentNo: normalizeText(input && input.documentNo),
      status: normalizeDocumentStatus(input && input.status),
      costBasis: normalizeCostBasis(input && input.costBasis),
      createReceivable: Boolean(input && input.createReceivable),
      dueDate: normalizeDate(input && input.dueDate),
      createdBy: normalizeText(input && input.createdBy),
      ownerEmployeeId: Number(input && input.ownerEmployeeId) || 0,
      ownerDepartmentId: Number(input && input.ownerDepartmentId) || 0,
      createdByEmployeeId: Number(input && input.createdByEmployeeId) || 0,
      lastEditedByEmployeeId: Number(input && input.lastEditedByEmployeeId) || 0,
      submittedBy: normalizeText(input && input.submittedBy),
      submittedAt: normalizeText(input && input.submittedAt),
      approvedBy: normalizeText(input && input.approvedBy),
      approvedAt: normalizeText(input && input.approvedAt),
      rejectedBy: normalizeText(input && input.rejectedBy),
      rejectedAt: normalizeText(input && input.rejectedAt),
      rejectReason: normalizeText(input && input.rejectReason),
      confirmedBy: normalizeText(input && input.confirmedBy),
      confirmedAt: normalizeText(input && input.confirmedAt),
      voidRequestedBy: normalizeText(input && input.voidRequestedBy),
      voidRequestedAt: normalizeText(input && input.voidRequestedAt),
      voidRequestReason: normalizeText(input && input.voidRequestReason),
      shippedQuantity: nonNegativeNumber(input && input.shippedQuantity) || 0,
      commissionStatus: normalizeText(input && input.commissionStatus)
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

  function normalizeTransfer(input, id) {
    const productId = Number(input && input.productId);
    const fromWarehouseId = Number(input && input.fromWarehouseId);
    const toWarehouseId = Number(input && input.toWarehouseId);
    const quantity = positiveNumber(input && input.quantity);
    const date = normalizeDate(input && input.date);

    if (!productId || !fromWarehouseId || !toWarehouseId || fromWarehouseId === toWarehouseId || quantity === null || !date) {
      return null;
    }

    return {
      id,
      productId,
      fromWarehouseId,
      toWarehouseId,
      quantity,
      date,
      note: normalizeText(input && input.note),
      documentNo: normalizeText(input && input.documentNo)
    };
  }

  function normalizeReturn(input, id) {
    const documentType = normalizeText(input && input.documentType);
    const productId = Number(input && input.productId);
    const warehouseId = Number(input && input.warehouseId);
    const quantity = positiveNumber(input && input.quantity);
    const unitAmount = nonNegativeNumber(input && input.unitAmount);
    const date = normalizeDate(input && input.date);

    if (!["salesReturn", "purchaseReturn"].includes(documentType) || !productId || !warehouseId || quantity === null || unitAmount === null || !date) {
      return null;
    }

    return {
      id,
      documentType,
      documentNo: normalizeText(input && input.documentNo),
      sourceDocumentNo: normalizeText(input && input.sourceDocumentNo),
      sourceLineId: Number(input && input.sourceLineId) || 0,
      productId,
      warehouseId,
      quantity,
      unitAmount,
      costBasis: normalizeCostBasis(input && input.costBasis),
      reason: normalizeText(input && input.reason),
      date,
      inspectionStatus: normalizeText(input && input.inspectionStatus) || "accepted",
      createdBy: normalizeText(input && input.createdBy),
      confirmedBy: normalizeText(input && input.confirmedBy),
      relatedDocumentNos: normalizeDocumentNoList(input && input.relatedDocumentNos),
      status: normalizeDocumentStatus(input && input.status)
    };
  }

  function financeStatus(amount, paidAmount) {
    if (paidAmount <= 0) {
      return "open";
    }

    return paidAmount >= amount ? "paid" : "partial";
  }

  function normalizeReceivable(input, id) {
    const amount = positiveNumber(input && input.amount);
    const paidAmount = nonNegativeNumber(input && input.paidAmount);
    const dueDate = normalizeDate(input && input.dueDate);

    if (amount === null || paidAmount === null || paidAmount > amount || !dueDate) {
      return null;
    }

    return {
      id,
      sourceType: normalizeText(input && input.sourceType) || "sale",
      sourceDocumentNo: normalizeText(input && input.sourceDocumentNo),
      customer: normalizeText(input && input.customer),
      amount,
      paidAmount,
      dueDate,
      status: normalizeFinanceStatus(input && input.status, amount, paidAmount),
      note: normalizeText(input && input.note),
      voidReason: normalizeText(input && input.voidReason),
      voidedAt: normalizeText(input && input.voidedAt),
      voidedBy: normalizeText(input && input.voidedBy),
      relatedDocumentNos: normalizeDocumentNoList(input && input.relatedDocumentNos)
    };
  }

  function normalizePayable(input, id) {
    const amount = positiveNumber(input && input.amount);
    const paidAmount = nonNegativeNumber(input && input.paidAmount);
    const dueDate = normalizeDate(input && input.dueDate);

    if (amount === null || paidAmount === null || paidAmount > amount || !dueDate) {
      return null;
    }

    return {
      id,
      sourceType: normalizeText(input && input.sourceType) || "purchase",
      sourceDocumentNo: normalizeText(input && input.sourceDocumentNo),
      supplier: normalizeText(input && input.supplier),
      amount,
      paidAmount,
      dueDate,
      status: normalizeFinanceStatus(input && input.status, amount, paidAmount),
      note: normalizeText(input && input.note),
      voidReason: normalizeText(input && input.voidReason),
      voidedAt: normalizeText(input && input.voidedAt),
      voidedBy: normalizeText(input && input.voidedBy),
      relatedDocumentNos: normalizeDocumentNoList(input && input.relatedDocumentNos)
    };
  }

  function normalizePayment(input, id) {
    const direction = input && input.direction === "out" ? "out" : "in";
    const targetType = input && input.targetType === "payable" ? "payable" : "receivable";
    const targetId = Number(input && input.targetId);
    const amount = positiveNumber(input && input.amount);
    const date = normalizeDate(input && input.date);

    if (!targetId || amount === null || !date) {
      return null;
    }

    return {
      id,
      direction,
      targetType,
      targetId,
      amount,
      method: normalizeText(input && input.method),
      date,
      note: normalizeText(input && input.note)
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

  function copyTransfer(transfer) {
    return {
      id: Number(transfer.id),
      productId: Number(transfer.productId),
      fromWarehouseId: Number(transfer.fromWarehouseId),
      toWarehouseId: Number(transfer.toWarehouseId),
      quantity: positiveNumber(transfer.quantity) || 0,
      date: normalizeDate(transfer.date),
      note: normalizeText(transfer.note),
      documentNo: normalizeText(transfer.documentNo)
    };
  }

  function copyReturn(returnRow) {
    return {
      id: Number(returnRow.id),
      documentType: normalizeText(returnRow.documentType) === "purchaseReturn" ? "purchaseReturn" : "salesReturn",
      documentNo: normalizeText(returnRow.documentNo),
      sourceDocumentNo: normalizeText(returnRow.sourceDocumentNo),
      sourceLineId: Number(returnRow.sourceLineId) || 0,
      productId: Number(returnRow.productId),
      warehouseId: Number(returnRow.warehouseId) || 0,
      quantity: positiveNumber(returnRow.quantity) || 0,
      unitAmount: nonNegativeNumber(returnRow.unitAmount) || 0,
      costBasis: normalizeCostBasis(returnRow.costBasis),
      reason: normalizeText(returnRow.reason),
      date: normalizeDate(returnRow.date),
      inspectionStatus: normalizeText(returnRow.inspectionStatus) || "accepted",
      createdBy: normalizeText(returnRow.createdBy),
      confirmedBy: normalizeText(returnRow.confirmedBy),
      relatedDocumentNos: normalizeDocumentNoList(returnRow.relatedDocumentNos),
      status: normalizeDocumentStatus(returnRow.status)
    };
  }

  function copyReceivable(receivable) {
    const amount = positiveNumber(receivable.amount) || 0;
    const paidAmount = nonNegativeNumber(receivable.paidAmount) || 0;

    return {
      id: Number(receivable.id),
      sourceType: normalizeText(receivable.sourceType) || "sale",
      sourceDocumentNo: normalizeText(receivable.sourceDocumentNo),
      customer: normalizeText(receivable.customer),
      amount,
      paidAmount,
      dueDate: normalizeDate(receivable.dueDate),
      status: normalizeFinanceStatus(receivable.status, amount, paidAmount),
      note: normalizeText(receivable.note),
      voidReason: normalizeText(receivable.voidReason),
      voidedAt: normalizeText(receivable.voidedAt),
      voidedBy: normalizeText(receivable.voidedBy),
      relatedDocumentNos: normalizeDocumentNoList(receivable.relatedDocumentNos)
    };
  }

  function copyPayable(payable) {
    const amount = positiveNumber(payable.amount) || 0;
    const paidAmount = nonNegativeNumber(payable.paidAmount) || 0;

    return {
      id: Number(payable.id),
      sourceType: normalizeText(payable.sourceType) || "purchase",
      sourceDocumentNo: normalizeText(payable.sourceDocumentNo),
      supplier: normalizeText(payable.supplier),
      amount,
      paidAmount,
      dueDate: normalizeDate(payable.dueDate),
      status: normalizeFinanceStatus(payable.status, amount, paidAmount),
      note: normalizeText(payable.note),
      voidReason: normalizeText(payable.voidReason),
      voidedAt: normalizeText(payable.voidedAt),
      voidedBy: normalizeText(payable.voidedBy),
      relatedDocumentNos: normalizeDocumentNoList(payable.relatedDocumentNos)
    };
  }

  function copyPayment(payment) {
    return {
      id: Number(payment.id),
      direction: payment.direction === "out" ? "out" : "in",
      targetType: payment.targetType === "payable" ? "payable" : "receivable",
      targetId: Number(payment.targetId),
      amount: positiveNumber(payment.amount) || 0,
      method: normalizeText(payment.method),
      date: normalizeDate(payment.date),
      note: normalizeText(payment.note)
    };
  }

  function defaultPreferences() {
    return {
      locale: "zh-Hant-TW",
      interfaceLanguage: "zh-Hant",
      quantityDecimals: 0,
      moneyDecimals: 0,
      thousandsSeparator: ",",
      decimalSeparator: ".",
      currencyCode: "TWD",
      currencySymbol: "$",
      currencyPosition: "prefix",
      reportTitle: "OpenStockFlow 營運報表",
      reportHeaderText: "OpenStockFlow",
      reportFooterText: "",
      showPrintDate: true,
      dateFormat: "YYYY-MM-DD"
    };
  }

  function normalizePreferences(input) {
    const defaults = defaultPreferences();
    const quantityDecimals = nonNegativeNumber(input && input.quantityDecimals);
    const moneyDecimals = nonNegativeNumber(input && input.moneyDecimals);
    const thousandsSeparator = normalizeText(input && input.thousandsSeparator);
    const decimalSeparator = normalizeText(input && input.decimalSeparator);
    const currencyPosition = normalizeText(input && input.currencyPosition);

    return {
      locale: normalizeText(input && input.locale) || defaults.locale,
      interfaceLanguage: normalizeText(input && input.interfaceLanguage) || defaults.interfaceLanguage,
      quantityDecimals: Math.min(6, Math.round(quantityDecimals === null ? defaults.quantityDecimals : quantityDecimals)),
      moneyDecimals: Math.min(6, Math.round(moneyDecimals === null ? defaults.moneyDecimals : moneyDecimals)),
      thousandsSeparator: thousandsSeparator || defaults.thousandsSeparator,
      decimalSeparator: decimalSeparator || defaults.decimalSeparator,
      currencyCode: normalizeText(input && input.currencyCode) || defaults.currencyCode,
      currencySymbol: normalizeText(input && input.currencySymbol) || defaults.currencySymbol,
      currencyPosition: currencyPosition === "suffix" ? "suffix" : defaults.currencyPosition,
      reportTitle: normalizeText(input && input.reportTitle) || defaults.reportTitle,
      reportHeaderText: normalizeText(input && input.reportHeaderText) || defaults.reportHeaderText,
      reportFooterText: normalizeText(input && input.reportFooterText),
      showPrintDate: input && input.showPrintDate === false ? false : true,
      dateFormat: normalizeText(input && input.dateFormat) || defaults.dateFormat
    };
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

  function normalizeFinanceStatus(status, amount, paidAmount) {
    const value = normalizeText(status);
    if (value === "voided") {
      return value;
    }

    return financeStatus(amount, paidAmount);
  }

  function normalizeDocumentNoList(value) {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map(normalizeText).filter(Boolean);
  }

  function normalizeNumberList(value) {
    if (!Array.isArray(value)) {
      return [];
    }

    return Array.from(new Set(value.map((item) => Number(item)).filter(Boolean)));
  }

  function normalizeTextList(value) {
    if (!Array.isArray(value)) {
      return [];
    }

    return Array.from(new Set(value.map(normalizeText).filter(Boolean)));
  }

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

  function sameSku(left, right) {
    return normalizeText(left).toUpperCase() === normalizeText(right).toUpperCase();
  }

  const api = {
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
    normalizeProduct,
    normalizePurchase,
    normalizeSale,
    normalizeAdjustment,
    normalizeTransfer,
    normalizeReturn,
    normalizeReceivable,
    normalizePayable,
    normalizePayment,
    copyProduct,
    copyPurchase,
    copySale,
    copyAdjustment,
    copyTransfer,
    copyReturn,
    copyReceivable,
    copyPayable,
    copyPayment,
    financeStatus,
    defaultPreferences,
    normalizePreferences,
    defaultWarehouse,
    ensureWarehouseOnRow,
    sameSku
  };

  global.OpenStockFlowModels = api;

  if (typeof module !== "undefined") {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
