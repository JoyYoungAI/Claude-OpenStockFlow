(function (global) {
  function createInventoryBackup(config) {
    const options = Object.assign({
      escapeHtml: (value) => String(value == null ? "" : value),
      validateBackupEnvelope: () => ({ valid: false, message: "備份檔無法檢查。" }),
      onValidBackup: () => {},
      onInvalidBackup: () => {},
      onReadError: () => {}
    }, config);

    function backupFilename(dateText) {
      return `stockflow-backup-${dateText}.json`;
    }

    function downloadJson(filename, data) {
      const json = `${JSON.stringify(data, null, 2)}\n`;
      const blob = new Blob([json], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    }

    function readBackupFile(file) {
      const reader = new FileReader();

      reader.addEventListener("load", () => {
        try {
          const parsed = JSON.parse(String(reader.result || "null"));
          const result = options.validateBackupEnvelope(parsed);

          if (!result.valid) {
            options.onInvalidBackup(result);
            return;
          }

          options.onValidBackup(result);
        } catch (error) {
          options.onReadError(error);
        }
      });

      reader.readAsText(file);
    }

    function renderBackupSummary(summary) {
      return `
        <strong>備份檔檢查通過</strong>
        <span>備份時間：${options.escapeHtml(summary.savedAt)}</span>
        <span>App 版本：${options.escapeHtml(summary.appVersion)} / 資料版本：${options.escapeHtml(summary.schemaVersion)}</span>
        <span>分類 ${summary.productCategories} 筆、倉庫 ${summary.warehouses} 筆、商品 ${summary.products} 筆、客戶/供應商 ${summary.partners} 筆</span>
        <span>進貨 ${summary.purchases} 筆、銷售 ${summary.sales} 筆、盤點調整 ${summary.adjustments} 筆、調撥 ${summary.transfers || 0} 筆</span>
        <span>部門 ${summary.departments || 0} 筆、員工 ${summary.employees || 0} 筆、權限範圍 ${summary.permissionScopes || 0} 筆</span>
        <span>稽核紀錄 ${summary.auditLogs || 0} 筆</span>
      `;
    }

    return {
      backupFilename,
      downloadJson,
      readBackupFile,
      renderBackupSummary
    };
  }

  const api = { createInventoryBackup };
  global.OpenStockFlowBackup = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
