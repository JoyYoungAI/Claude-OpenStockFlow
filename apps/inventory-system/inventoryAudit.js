(function (global) {
  function createInventoryAudit(config) {
    const options = Object.assign({
      getFilterValues: () => ({ query: "", month: "", action: "", highRiskOnly: false }),
      roleLabel: (role) => role || "-",
      escapeHtml: (value) => String(value == null ? "" : value),
      recordAudit: () => null
    }, config);

    function currentAuditOptions() {
      const values = options.getFilterValues();
      return {
        query: values.query || "",
        month: values.month || "",
        action: values.action || "",
        highRiskOnly: Boolean(values.highRiskOnly)
      };
    }

    function recordSensitiveRead(entityType, summary, after) {
      return options.recordAudit("read", {
        entityType,
        summary,
        after,
        riskLevel: "medium"
      }, true);
    }

    function formatAuditCsvRows(logs) {
      return (logs || []).map((event) => ({
        occurredAt: event.occurredAt,
        actorName: event.actorName,
        roleAtOperation: options.roleLabel(event.roleAtOperation),
        action: auditActionLabel(event.action),
        entityType: event.entityType,
        entityId: event.entityId,
        documentNo: event.documentNo,
        sourceDocumentNo: event.sourceDocumentNo,
        relatedDocumentNos: (event.relatedDocumentNos || []).join(" / "),
        summary: event.summary,
        reason: event.reason,
        result: auditResultLabel(event.result),
        riskLevel: auditRiskLabel(event.riskLevel)
      }));
    }

    function auditActionBadge(action) {
      const className = action === "delete" || action === "restore" ? "danger" : action === "read" ? "neutral" : "";
      return `<span class="badge ${className}">${options.escapeHtml(auditActionLabel(action))}</span>`;
    }

    function auditResultBadge(result) {
      const className = result === "denied" || result === "failed" ? "danger" : "";
      return `<span class="badge ${className}">${options.escapeHtml(auditResultLabel(result))}</span>`;
    }

    function auditRiskBadge(riskLevel) {
      const className = riskLevel === "high" ? "danger" : riskLevel === "medium" ? "warn" : "";
      return `<span class="badge ${className}">${options.escapeHtml(auditRiskLabel(riskLevel))}</span>`;
    }

    return {
      currentAuditOptions,
      recordSensitiveRead,
      formatAuditCsvRows,
      auditActionBadge,
      auditResultBadge,
      auditRiskBadge,
      auditActionLabel,
      auditResultLabel,
      auditRiskLabel
    };
  }

  function auditActionLabel(action) {
    const labels = {
      create: "新增",
      delete: "刪除 / 作廢",
      update: "修改",
      read: "查詢",
      print: "列印",
      export: "匯出",
      restore: "還原",
      access: "權限"
    };
    return labels[action] || action || "-";
  }

  function auditResultLabel(result) {
    const labels = { success: "成功", denied: "拒絕", failed: "失敗" };
    return labels[result] || result || "-";
  }

  function auditRiskLabel(riskLevel) {
    const labels = { low: "低", medium: "中", high: "高" };
    return labels[riskLevel] || riskLevel || "-";
  }

  const api = {
    createInventoryAudit,
    auditActionLabel,
    auditResultLabel,
    auditRiskLabel
  };

  global.StockFlowAudit = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
