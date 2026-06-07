(function (global) {
  function renderReports(context) {
    const {
      document,
      store,
      month,
      movementQuery,
      formatMoney,
      formatNumber,
      formatQuantity,
      formatCount,
      formatDate,
      formatPercent,
      escapeHtml,
      t,
      productName,
      warehouseName,
      movementBadge,
      canViewField,
      restrictedText
    } = context;
    const canSee = typeof canViewField === "function" ? canViewField : () => true;
    const restricted = typeof restrictedText === "function" ? restrictedText : () => "未開放";
    const money = (value, fieldName) => canSee(fieldName) ? formatMoney(value) : restricted();
    const movementAmountField = (type) => {
      if (type === "purchase" || type === "purchaseReturn" || type === "adjustment" || type === "transfer") {
        return "viewCost";
      }

      return "viewSalesRevenue";
    };
    const summary = store.reportSummary({ month });
    const finance = store.financeSummary({ month });
    const preferences = store.getPreferences ? store.getPreferences() : {};
    const language = preferences.interfaceLanguage || "zh-Hant";
    const text = typeof t === "function"
      ? t
      : (path, fallback) => global.ClaudeOpenStockFlowI18n ? global.ClaudeOpenStockFlowI18n.text(language, path, fallback) : fallback;
    const reportTitle = global.ClaudeOpenStockFlowI18n
      ? global.ClaudeOpenStockFlowI18n.text(language, "defaults.reportTitle", "Claude-OpenStockFlow 營運報表")
      : "Claude-OpenStockFlow 營運報表";
    const printDatePrefix = global.ClaudeOpenStockFlowI18n
      ? global.ClaudeOpenStockFlowI18n.text(language, "defaults.printDatePrefix", "列印日期")
      : "列印日期";
    const lowStock = store.inventoryReport({ lowStockOnly: true });
    const warehouseSummary = store.warehouseStockSummary();
    const transferSummary = store.warehouseTransferSummary({ month });
    const distribution = store.productWarehouseSummary().slice(0, 8);
    const sales = store.listSales({ month }).slice(0, 6);
    const purchases = store.listPurchases({ month }).slice(0, 6);
    const movements = store.stockMovements({
      month,
      query: movementQuery
    });

    document.querySelector("#report-title").textContent = preferences.reportTitle || reportTitle;
    document.querySelector("#report-header-text").textContent = preferences.reportHeaderText || "";
    document.querySelector("#report-print-date").textContent = preferences.showPrintDate === false ? "" : `${printDatePrefix} ${formatDate(new Date())}`;
    document.querySelector("#finance-report-label").textContent = month || text("common.allPeriod", "全部期間");
    document.querySelector("#report-receivable-balance").textContent = money(finance.receivableBalance, "viewCompanyFinanceSummary");
    document.querySelector("#report-receivable-total").textContent = `${money(finance.receivableTotal, "viewCompanyFinanceSummary")} ${text("reports.receivableTotal", "應收總額")}`;
    document.querySelector("#report-payable-balance").textContent = money(finance.payableBalance, "viewCompanyFinanceSummary");
    document.querySelector("#report-payable-total").textContent = `${money(finance.payableTotal, "viewCompanyFinanceSummary")} ${text("reports.payableTotal", "應付總額")}`;
    document.querySelector("#report-cash-in").textContent = money(finance.cashIn, "viewCompanyFinanceSummary");
    document.querySelector("#report-cash-out").textContent = money(finance.cashOut, "viewCompanyFinanceSummary");
    document.querySelector("#report-sales-revenue").textContent = money(summary.salesRevenue, "viewSalesRevenue");
    document.querySelector("#report-sales-count").textContent = `${formatCount(summary.salesCount)} ${text("common.countUnit", "筆")} / ${formatQuantity(summary.salesQuantity)} ${text("common.pieceUnit", "件")}`;
    document.querySelector("#report-purchase-cost").textContent = money(summary.purchaseCost, "viewCost");
    document.querySelector("#report-purchase-count").textContent = `${formatCount(summary.purchaseCount)} ${text("common.countUnit", "筆")} / ${formatQuantity(summary.purchaseQuantity)} ${text("common.pieceUnit", "件")}`;
    document.querySelector("#report-gross-profit").textContent = money(summary.grossProfit, "viewGrossProfit");
    document.querySelector("#report-margin-rate").textContent = `${text("reports.marginRate", "毛利率")} ${canSee("viewGrossProfit") ? formatPercent(summary.marginRate) : restricted()}`;
    document.querySelector("#report-low-stock").textContent = formatCount(lowStock.length);
    document.querySelector("#report-sales-label").textContent = month || text("common.allPeriod", "全部期間");
    document.querySelector("#report-purchases-label").textContent = month || text("common.allPeriod", "全部期間");

    document.querySelector("#warehouse-summary-cards").innerHTML = warehouseSummary.length
      ? warehouseSummary.map((item) => `
        <article class="ranking-card">
          <strong>${escapeHtml(item.warehouse ? item.warehouse.name : text("common.unassignedWarehouse", "未指定倉庫"))}</strong>
          <span class="compact-meta">${escapeHtml(item.warehouse ? item.warehouse.code : "-")} / ${text("reports.productRows", "商品列")} ${formatCount(item.productCount)}</span>
          <span class="compact-meta">${text("common.stock", "庫存")} ${formatQuantity(item.onHand)} / ${text("common.lowStock", "低庫存")} ${formatCount(item.lowStockCount)}</span>
          <span class="compact-meta">${text("common.stockValue", "庫存值")} ${money(item.stockValue, "viewStockValue")}</span>
        </article>
      `).join("")
      : `<div class="empty">${text("emptyStates.noWarehouseStock", "目前沒有倉庫庫存資料。")}</div>`;

    document.querySelector("#warehouse-transfer-cards").innerHTML = transferSummary.length
      ? transferSummary.map((item) => `
        <article class="ranking-card">
          <strong>${escapeHtml(item.warehouse ? item.warehouse.name : text("common.unassignedWarehouse", "未指定倉庫"))}</strong>
          <span class="compact-meta">${escapeHtml(item.warehouse ? item.warehouse.code : "-")} / ${text("navigation.transfers", "調撥")} ${formatCount(item.transferCount)} ${text("common.countUnit", "筆")}</span>
          <span class="compact-meta">${text("reports.transferredIn", "調入")} ${formatQuantity(item.transferredIn)} / ${text("reports.transferredOut", "調出")} ${formatQuantity(item.transferredOut)}</span>
          <span class="compact-meta">${text("reports.netTransfer", "淨流量")} ${item.netTransfer >= 0 ? "+" : ""}${formatQuantity(item.netTransfer)}</span>
        </article>
      `).join("")
      : `<div class="empty">${text("emptyStates.noWarehouseTransfers", "這個期間沒有調撥流向資料。")}</div>`;

    document.querySelector("#warehouse-distribution-list").innerHTML = distribution.length
      ? distribution.map((item) => `
        <article class="compact-card">
          <strong>${escapeHtml(item.product.name)}</strong>
          <span class="compact-meta">${text("common.totalStock", "總庫存")} ${formatQuantity(item.totalOnHand)} ${escapeHtml(item.product.unit)} / ${text("common.stockValue", "庫存值")} ${money(item.stockValue, "viewStockValue")}</span>
          <span class="compact-meta">${item.warehouses.map((warehouseRow) => `${escapeHtml(warehouseRow.warehouse ? warehouseRow.warehouse.code : "-")} ${formatQuantity(warehouseRow.onHand)}${warehouseRow.lowStock ? ` ${text("common.lowStock", "低庫存")}` : ""}`).join(" / ")}</span>
        </article>
      `).join("")
      : `<div class="empty">${text("emptyStates.noWarehouseDistribution", "目前沒有跨倉分布資料。")}</div>`;

    document.querySelector("#report-sales-list").innerHTML = sales.length
      ? sales.map((item) => {
        const lines = item.lines || [];
        const firstLine = lines[0] || {};
        const productDisplay = lines.length > 1
          ? `${productName(firstLine.productId)} ${text("common.andMore", "等")} ${lines.length} ${text("common.itemUnit", "項")}`
          : productName(firstLine.productId);
        const totalAmount = lines.reduce((sum, l) => sum + (l.quantity || 0) * (l.unitPrice || 0), 0);
        const totalQuantity = lines.reduce((sum, l) => sum + (l.quantity || 0), 0);
        return `
          <article class="record-card">
            <div>
              <strong>${escapeHtml(productDisplay)}</strong>
              <div class="record-meta">${escapeHtml(item.documentNo || text("common.noDocumentNo", "無單號"))} / ${formatDate(item.date)} / ${escapeHtml(warehouseName(item.warehouseId))} / ${escapeHtml(item.customerName || text("common.notFilled", "未填") + text("common.customer", "客戶"))} / ${formatQuantity(totalQuantity)} ${text("common.pieceUnit", "件")}</div>
            </div>
            <span class="amount expense">${money(totalAmount, "viewSalesRevenue")}</span>
          </article>
        `;
      }).join("")
      : `<div class="empty">${text("emptyStates.noReportSales", "這個期間沒有銷售資料。")}</div>`;

    document.querySelector("#report-purchase-list").innerHTML = purchases.length
      ? purchases.map((item) => {
        const lines = item.lines || [];
        const firstLine = lines[0] || {};
        const productDisplay = lines.length > 1
          ? `${productName(firstLine.productId)} ${text("common.andMore", "等")} ${lines.length} ${text("common.itemUnit", "項")}`
          : productName(firstLine.productId);
        const totalAmount = lines.reduce((sum, l) => sum + (l.quantity || 0) * (l.unitCost || 0), 0);
        const totalQuantity = lines.reduce((sum, l) => sum + (l.quantity || 0), 0);
        return `
          <article class="record-card">
            <div>
              <strong>${escapeHtml(productDisplay)}</strong>
              <div class="record-meta">${escapeHtml(item.documentNo || text("common.noDocumentNo", "無單號"))} / ${formatDate(item.date)} / ${escapeHtml(warehouseName(item.warehouseId))} / ${escapeHtml(item.supplierName || text("common.notFilled", "未填") + text("common.supplier", "供應商"))} / ${formatQuantity(totalQuantity)} ${text("common.pieceUnit", "件")}</div>
            </div>
            <span class="amount income">${money(totalAmount, "viewCost")}</span>
          </article>
        `;
      }).join("")
      : `<div class="empty">${text("emptyStates.noReportPurchases", "這個期間沒有進貨資料。")}</div>`;

    const ranking = store.grossProfitRanking(8);
    document.querySelector("#report-profit-ranking").innerHTML = ranking.length
      ? ranking.map((item, index) => `
        <article class="ranking-card">
          <strong>${index + 1}. ${escapeHtml(item.product.name)}</strong>
          <span class="compact-meta">${text("common.revenue", "收入")} ${money(item.revenue, "viewSalesRevenue")}</span>
          <span class="compact-meta">${text("common.grossProfit", "毛利")} ${money(item.grossProfit, "viewGrossProfit")}</span>
          <span class="compact-meta">${text("common.stock", "庫存")} ${formatQuantity(item.onHand)} ${escapeHtml(item.product.unit)}</span>
        </article>
      `).join("")
      : `<div class="empty">${text("emptyStates.noGrossProfitRanking", "尚無銷售資料可排行。")}</div>`;

    document.querySelector("#movement-count").textContent = `${formatCount(movements.length)} ${text("common.countUnit", "筆")}`;
    document.querySelector("#movement-table").innerHTML = movements.length
      ? movements.map((item) => `
        <tr>
          <td>${formatDate(item.date)}</td>
          <td>${movementBadge(item.type)}</td>
          <td>
            <div class="row-title">
              <strong>${escapeHtml(item.documentNo || text("common.noDocumentNo", "無單號"))}</strong>
              <span>${escapeHtml(item.sku)} / ${escapeHtml(item.productName)} / ${escapeHtml(item.warehouseName || text("common.unassignedWarehouse", "未指定倉庫"))}</span>
            </div>
          </td>
          <td class="${item.quantity >= 0 ? "movement-positive" : "movement-negative"}">${item.quantity >= 0 ? "+" : ""}${formatQuantity(item.quantity)}</td>
          <td>${money(item.amount, movementAmountField(item.type))}</td>
          <td>${escapeHtml(item.party || text("common.notFilled", "未填"))}</td>
          <td>${escapeHtml(item.note || text("common.noNote", "無備註"))}</td>
        </tr>
      `).join("")
      : `<tr><td colspan="7" class="empty">${text("emptyStates.noMovements", "這個期間沒有符合條件的庫存異動。")}</td></tr>`;
  }

  global.ClaudeOpenStockFlowRenderers = {
    renderReports
  };

  if (typeof module !== "undefined") {
    module.exports = global.ClaudeOpenStockFlowRenderers;
  }
})(typeof window !== "undefined" ? window : globalThis);
