function formatMoney(value) {
  const preferences = store.getPreferences ? store.getPreferences() : { moneyDecimals: 0, thousandsSeparator: ",", decimalSeparator: ".", currencySymbol: "$", currencyPosition: "prefix" };
  const amount = formatNumber(value, preferences.moneyDecimals, preferences);
  const symbol = preferences.currencySymbol || preferences.currencyCode || "$";
  return preferences.currencyPosition === "suffix" ? `${amount}${symbol}` : `${symbol}${amount}`;
}

function formatQuantity(value) { const preferences = store.getPreferences ? store.getPreferences() : {}; return formatNumber(value, preferences.quantityDecimals, preferences); }
function formatCount(value) { return String(Math.round(Number(value) || 0)); }

function formatNumber(value, decimals, options) {
  const n = Number(value) || 0;
  const d = Number.isFinite(Number(decimals)) ? Number(decimals) : 0;
  const opts = options || {};
  const thousandsSep = opts.thousandsSeparator !== undefined ? opts.thousandsSeparator : ",";
  const decimalSep = opts.decimalSeparator !== undefined ? opts.decimalSeparator : ".";
  const fixed = n.toFixed(d);
  const [intPart, decPart] = fixed.split(".");
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
  return decPart !== undefined ? `${intFormatted}${decimalSep}${decPart}` : intFormatted;
}

function formatPercent(value) { return `${formatNumber(value * 100, 1)}%`; }

function formatDate(value) {
  const preferences = store && store.getPreferences ? store.getPreferences() : {};
  const format = preferences.dateFormat || "YYYY-MM-DD";
  if (!value) { return ""; }
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) { return String(value); }
  const [, yyyy, mm, dd] = match;
  return format.replace("YYYY", yyyy).replace("MM", mm).replace("DD", dd);
}

function parseDate(value) {
  if (value instanceof Date) { return value; }
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) { return null; }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function toCsv(rows) {
  const header = ["sku", "name", "warehouse", "category", "unit", "onHand", "adjusted", "cost", "price", "safetyStock", "stockValue", "revenue", "grossProfit", "lowStock"];
  return [header.join(",")].concat(rows.map((row) => header.map((key) => csvCell(row[key])).join(","))).join("\n");
}

function formatInventoryCsvRows(rows) {
  return rows.map((row) => Object.assign({}, row, {
    onHand: formatQuantity(row.onHand), adjusted: formatQuantity(row.adjusted),
    cost: formatMoney(row.cost), price: formatMoney(row.price),
    safetyStock: formatQuantity(row.safetyStock), stockValue: formatMoney(row.stockValue),
    revenue: formatMoney(row.revenue), grossProfit: formatMoney(row.grossProfit)
  }));
}

function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename; link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value) { return `"${String(value).replaceAll('"', '""')}"`; }
function escapeHtml(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"); }
function escapeAttr(value) { return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("'", "&#39;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"); }

if (typeof module !== "undefined") {
  module.exports = {
    formatMoney,
    formatQuantity,
    formatCount,
    formatNumber,
    formatPercent,
    formatDate,
    parseDate,
    toCsv,
    formatInventoryCsvRows,
    downloadCsv,
    csvCell,
    escapeHtml,
    escapeAttr
  };
}
