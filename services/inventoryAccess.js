(function (global) {
  const accessRoles = {
    owner: { label: "業主 / 管理者" },
    purchasing: { label: "採購" },
    sales: { label: "銷售" },
    warehouse: { label: "倉儲" },
    finance: { label: "財務" },
    auditor: { label: "稽核 / 查詢" }
  };

  const actionPermissions = {
    manageProducts: ["owner"],
    manageMasterData: ["owner"],
    managePartners: ["owner", "purchasing", "sales"],
    createPurchase: ["owner", "purchasing"],
    createSale: ["owner", "sales"],
    stockAdjust: ["owner", "warehouse"],
    transferStock: ["owner", "warehouse"],
    managePayments: ["owner", "finance"],
    savePreferences: ["owner"],
    exportBackup: ["owner"],
    restoreBackup: ["owner"],
    resetSampleData: ["owner"],
    voidDocument: ["owner"],
    exportAuditLogs: ["owner", "auditor"],
    submitPurchase: ["owner", "purchasing"],
    submitSale: ["owner", "sales"],
    submitDocument: ["owner", "purchasing", "sales", "warehouse", "finance"],
    approveDocument: ["owner"],
    rejectDocument: ["owner"],
    rejectPurchase: ["owner", "purchasing"],
    rejectSale: ["owner", "sales"],
    confirmPurchase: ["owner", "warehouse"],
    confirmSale: ["owner", "warehouse"],
    confirmDocument: ["owner"],
    requestVoid: ["owner", "purchasing", "sales", "warehouse", "finance"],
    reassignPurchaseOwner: ["owner", "purchasing"],
    reassignSaleOwner: ["owner", "sales"],
    createPurchaseReturn: ["owner", "purchasing", "warehouse"],
    createSalesReturn: ["owner", "sales", "warehouse"],
    createReturn: ["owner", "purchasing", "sales"],
    exportInventoryCsv: ["owner", "purchasing", "sales", "warehouse", "finance", "auditor"]
  };

  const modulePermissions = {
    overview: ["owner", "purchasing", "sales", "warehouse", "finance", "auditor"],
    masterdata: ["owner", "purchasing", "sales", "warehouse", "finance", "auditor"],
    products: ["owner", "purchasing", "sales", "warehouse", "finance", "auditor"],
    purchases: ["owner", "purchasing", "warehouse", "finance", "auditor"],
    sales: ["owner", "sales", "warehouse", "finance", "auditor"],
    adjustments: ["owner", "warehouse", "auditor"],
    reports: ["owner", "purchasing", "sales", "warehouse", "finance", "auditor"],
    transfers: ["owner", "warehouse", "auditor"],
    finance: ["owner", "finance", "auditor"],
    learning: ["owner", "purchasing", "sales", "warehouse", "finance", "auditor"]
  };

  const fieldPermissions = {
    viewCost: ["owner", "purchasing", "finance", "auditor"],
    viewPrice: ["owner", "purchasing", "sales", "finance", "auditor"],
    viewStockValue: ["owner", "purchasing", "finance", "auditor"],
    viewSalesRevenue: ["owner", "sales", "finance", "auditor"],
    viewGrossProfit: ["owner", "finance", "auditor"],
    viewReceivables: ["owner", "sales", "finance", "auditor"],
    viewPayables: ["owner", "purchasing", "finance", "auditor"],
    viewCompanyFinanceSummary: ["owner", "finance", "auditor"]
  };

  const supervisorOnlyActions = [
    "rejectPurchase",
    "rejectSale",
    "reassignPurchaseOwner",
    "reassignSaleOwner"
  ];

  function createInventoryAccess(config) {
    const options = Object.assign({
      getCurrentUser: () => ({ role: "owner" }),
      listPermissionScopes: () => [],
      t: (path, fallback) => fallback || path,
      interpolate: defaultInterpolate,
      moduleLabel: (moduleName) => moduleName
    }, config);

    function currentUser() {
      return options.getCurrentUser() || { role: "owner" };
    }

    function canPerform(action, context) {
      const permissionContext = Object.assign({}, currentUser(), context || {});
      const role = normalizeRole(permissionContext.role);
      const allowedRoles = actionPermissions[action] || [];
      return allowedRoles.includes(role) && isWithinPermissionScope(action, permissionContext);
    }

    function isWithinPermissionScope(action, context) {
      if (!context || context.role === "owner") {
        return true;
      }

      const target = context.targetDocument || null;
      if (!target) {
        return !requiresSupervisorScope(action);
      }

      if (requiresSupervisorScope(action)) {
        if (Number(target.ownerEmployeeId) === Number(context.employeeId)) {
          return false;
        }
        return hasSupervisorScope(action, context, target);
      }

      if (Number(target.ownerEmployeeId) === Number(context.employeeId)) {
        return true;
      }

      if (Number(target.ownerDepartmentId) && Number(target.ownerDepartmentId) === Number(context.departmentId)) {
        return hasSupervisorScope(action, context, target);
      }

      return false;
    }

    function hasSupervisorScope(action, context, target) {
      const scopes = options.listPermissionScopes(context.employeeId);
      return scopes.some((scope) => {
        const actionAllowed = scope.actions.includes(action) || scope.actions.includes("*");
        if (!actionAllowed) {
          return false;
        }

        if (scope.scopeType === "all") {
          return true;
        }

        if (scope.scopeType === "department" || scope.scopeType === "subtree") {
          return scope.departmentIds.includes(Number(target.ownerDepartmentId));
        }

        if (scope.scopeType === "assignedEmployees") {
          return scope.employeeIds.includes(Number(target.ownerEmployeeId));
        }

        return false;
      });
    }

    function requiresSupervisorScope(action) {
      return supervisorOnlyActions.includes(action);
    }

    function canViewModule(moduleName, context) {
      const user = currentUser();
      const role = normalizeRole(context && context.role ? context.role : user.role);
      const allowedRoles = modulePermissions[moduleName] || [];
      return allowedRoles.includes(role);
    }

    function canViewField(fieldName, context) {
      const user = currentUser();
      const role = normalizeRole(context && context.role ? context.role : user.role);
      const allowedRoles = fieldPermissions[fieldName] || [];
      return allowedRoles.includes(role);
    }

    function permissionReason(action) {
      return options.interpolate(options.t("operationGuards.roleDenied", "目前角色「{role}」不能執行「{action}」。"), {
        role: currentRoleLabel(),
        action: actionLabel(action)
      });
    }

    function modulePermissionReason(moduleName) {
      return options.interpolate("目前角色「{role}」不能查看「{module}」內容。", {
        role: currentRoleLabel(),
        module: options.moduleLabel(moduleName)
      });
    }

    function actionLabel(action) {
      return options.t(`accessActions.${action}`, "這項操作");
    }

    function currentRoleLabel() {
      const user = currentUser();
      const role = normalizeRole(user.role);
      return roleLabel(role);
    }

    function roleLabel(role) {
      const normalized = normalizeRole(role);
      return options.t(`accessRoles.${normalized}`, accessRoles[normalized].label);
    }

    return {
      canPerform,
      isWithinPermissionScope,
      hasSupervisorScope,
      canViewModule,
      canViewField,
      permissionReason,
      modulePermissionReason,
      actionLabel,
      currentRoleLabel,
      roleLabel,
      normalizeRole
    };
  }

  function normalizeRole(role) {
    return accessRoles[role] ? role : "owner";
  }

  function defaultInterpolate(template, values) {
    return String(template || "").replace(/\{(\w+)\}/g, (match, key) => {
      return Object.prototype.hasOwnProperty.call(values || {}, key) ? values[key] : match;
    });
  }

  const api = {
    accessRoles,
    actionPermissions,
    modulePermissions,
    fieldPermissions,
    createInventoryAccess,
    normalizeRole
  };

  global.OpenStockFlowAccess = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
