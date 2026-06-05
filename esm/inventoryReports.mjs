import { normalizeText } from "./inventoryUtils.mjs";
import {
  copyProduct,
  copyWarehouse
} from "./inventoryModels.mjs";

function expandPurchaseLines(docs) {
  if (!Array.isArray(docs)) return [];
  return docs.flatMap((doc) => {
    if (!Array.isArray(doc.lines)) return [];
    return doc.lines.map((line) => ({
      lineId: line.lineId,
      docId: doc.id,
      productId: line.productId,
      warehouseId: doc.warehouseId,
      quantity: line.quantity,
      unitCost: line.unitCost,
      receivedQuantity: line.receivedQuantity || 0,
      date: doc.date,
      documentNo: doc.documentNo,
      supplierName: doc.supplierName,
      note: doc.note,
      status: doc.status
    }));
  });
}

function expandSaleLines(docs) {
  if (!Array.isArray(docs)) return [];
  return docs.flatMap((doc) => {
    if (!Array.isArray(doc.lines)) return [];
    return doc.lines.map((line) => ({
      lineId: line.lineId,
      docId: doc.id,
      productId: line.productId,
      warehouseId: doc.warehouseId,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      shippedQuantity: line.shippedQuantity || 0,
      costBasis: line.costBasis,
      date: doc.date,
      documentNo: doc.documentNo,
      customerName: doc.customerName,
      note: doc.note,
      status: doc.status
    }));
  });
}

function inventoryReport(state, options) {
  const filter = Object.assign({ query: "", category: "", lowStockOnly: false, sort: "sku" }, options);
  const query = normalizeText(filter.query).toLowerCase();
  const rows = state.products
    .filter((product) => !filter.category || String(product.categoryId) === String(filter.category))
    .reduce((result, product) => result.concat(warehousesForReport(state, filter.warehouseId).map((warehouse) => stockForProduct(state, product.id, warehouse.id))), [])
    .filter((item) => {
      if (!query) {
        return true;
      }

      return [
        item.product && item.product.sku,
        item.product && item.product.name,
        item.warehouse && item.warehouse.code,
        item.warehouse && item.warehouse.name
      ].some((value) => normalizeText(value).toLowerCase().includes(query));
    })
    .filter((item) => !filter.lowStockOnly || item.lowStock);

  return sortInventoryRows(rows, filter.sort);
}

function dashboard(state) {
  const stock = inventoryReport(state);
  const activeProducts = state.products.filter((product) => product.active).length;

  return {
    activeProducts,
    stockValue: stock.reduce((total, item) => total + item.stockValue, 0),
    lowStockCount: stock.filter((item) => item.lowStock).length,
    revenue: stock.reduce((total, item) => total + item.revenue, 0),
    grossProfit: stock.reduce((total, item) => total + item.grossProfit, 0)
  };
}

function grossProfitRanking(state, limit) {
  return inventoryReport(state)
    .filter((item) => item.revenue > 0)
    .sort((a, b) => b.grossProfit - a.grossProfit || b.revenue - a.revenue)
    .slice(0, limit || 5);
}

function warehouseStockSummary(state, options) {
  const summaries = new Map();

  inventoryReport(state, options).forEach((row) => {
    const key = row.warehouseId || 0;
    const summary = summaries.get(key) || {
      warehouse: row.warehouse ? copyWarehouse(row.warehouse) : null,
      warehouseId: key,
      productCount: 0,
      onHand: 0,
      stockValue: 0,
      lowStockCount: 0
    };

    summary.productCount += row.onHand !== 0 || row.lowStock ? 1 : 0;
    summary.onHand += row.onHand;
    summary.stockValue += row.stockValue;
    summary.lowStockCount += row.lowStock ? 1 : 0;
    summaries.set(key, summary);
  });

  return Array.from(summaries.values())
    .sort((a, b) => normalizeText(a.warehouse && a.warehouse.code).localeCompare(normalizeText(b.warehouse && b.warehouse.code)));
}

function productWarehouseSummary(state, options) {
  const summaries = new Map();

  inventoryReport(state, options).forEach((row) => {
    const key = row.productId;
    const summary = summaries.get(key) || {
      product: row.product ? copyProduct(row.product) : null,
      productId: row.productId,
      totalOnHand: 0,
      stockValue: 0,
      lowStockCount: 0,
      warehouses: []
    };

    summary.totalOnHand += row.onHand;
    summary.stockValue += row.stockValue;
    summary.lowStockCount += row.lowStock ? 1 : 0;
    summary.warehouses.push({
      warehouse: row.warehouse ? copyWarehouse(row.warehouse) : null,
      warehouseId: row.warehouseId,
      onHand: row.onHand,
      lowStock: row.lowStock
    });
    summaries.set(key, summary);
  });

  return Array.from(summaries.values())
    .sort((a, b) => a.product.sku.localeCompare(b.product.sku));
}

function warehouseTransferSummary(state, options) {
  const filter = Object.assign({ month: "" }, options);
  const summaries = new Map();

  state.warehouses.forEach((warehouse) => {
    summaries.set(warehouse.id, {
      warehouse: copyWarehouse(warehouse),
      warehouseId: warehouse.id,
      transferredIn: 0,
      transferredOut: 0,
      netTransfer: 0,
      transferCount: 0
    });
  });

  filterByMonth(activeRows(state.transfers || []), filter.month).forEach((transfer) => {
    const fromSummary = summaries.get(Number(transfer.fromWarehouseId));
    const toSummary = summaries.get(Number(transfer.toWarehouseId));

    if (fromSummary) {
      fromSummary.transferredOut += transfer.quantity;
      fromSummary.netTransfer -= transfer.quantity;
      fromSummary.transferCount += 1;
    }

    if (toSummary) {
      toSummary.transferredIn += transfer.quantity;
      toSummary.netTransfer += transfer.quantity;
      toSummary.transferCount += 1;
    }
  });

  return Array.from(summaries.values())
    .filter((summary) => summary.transferCount > 0)
    .sort((a, b) => Math.abs(b.netTransfer) - Math.abs(a.netTransfer)
      || normalizeText(a.warehouse && a.warehouse.code).localeCompare(normalizeText(b.warehouse && b.warehouse.code)));
}

function reportSummary(state, options) {
  const filter = Object.assign({ month: "" }, options);
  const purchaseLines = filterByMonth(expandPurchaseLines(activeRows(state.purchases)), filter.month);
  const saleLines = filterByMonth(expandSaleLines(activeRows(state.sales)), filter.month);
  const salesReturnRows = filterByMonth(activeRows(state.returns || []).filter((item) => item.documentType === "salesReturn"), filter.month);
  const purchaseReturnRows = filterByMonth(activeRows(state.returns || []).filter((item) => item.documentType === "purchaseReturn"), filter.month);
  const purchaseCost = purchaseLines.reduce((total, item) => total + item.quantity * item.unitCost, 0)
    - purchaseReturnRows.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
  const purchaseQuantity = purchaseLines.reduce((total, item) => total + item.quantity, 0)
    - purchaseReturnRows.reduce((total, item) => total + item.quantity, 0);
  const salesRevenue = saleLines.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
    - salesReturnRows.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
  const salesQuantity = saleLines.reduce((total, item) => total + item.quantity, 0)
    - salesReturnRows.reduce((total, item) => total + item.quantity, 0);
  const grossProfit = saleLines.reduce((total, item) => {
    return total + item.quantity * item.unitPrice - saleCost(item);
  }, 0) - salesReturnRows.reduce((total, item) => {
    return total + item.quantity * item.unitPrice - returnCost(item);
  }, 0);

  return {
    purchaseCost,
    purchaseQuantity,
    purchaseCount: purchaseLines.length,
    salesRevenue,
    salesQuantity,
    salesCount: saleLines.length,
    grossProfit,
    marginRate: salesRevenue > 0 ? grossProfit / salesRevenue : 0
  };
}

function stockMovements(state, options) {
  const filter = Object.assign({ month: "", query: "" }, options);
  const query = normalizeText(filter.query).toLowerCase();
  const purchaseMovements = expandPurchaseLines(activeRows(state.purchases)).map((line) => {
    const product = findProduct(state, line.productId);
    const warehouse = findWarehouse(state, line.warehouseId);
    return {
      id: `purchase-${line.lineId}`,
      sourceId: line.lineId,
      type: "purchase",
      label: "進貨",
      date: line.date,
      productId: line.productId,
      warehouseId: line.warehouseId,
      warehouseCode: warehouse ? warehouse.code : "",
      warehouseName: warehouse ? warehouse.name : "",
      sku: product ? product.sku : "",
      productName: product ? product.name : "未知商品",
      quantity: line.quantity,
      amount: line.quantity * line.unitCost,
      party: line.supplierName,
      note: line.note,
      documentNo: line.documentNo
    };
  });
  const saleMovements = expandSaleLines(activeRows(state.sales)).map((line) => {
    const product = findProduct(state, line.productId);
    const warehouse = findWarehouse(state, line.warehouseId);
    return {
      id: `sale-${line.lineId}`,
      sourceId: line.lineId,
      type: "sale",
      label: "銷售",
      date: line.date,
      productId: line.productId,
      warehouseId: line.warehouseId,
      warehouseCode: warehouse ? warehouse.code : "",
      warehouseName: warehouse ? warehouse.name : "",
      sku: product ? product.sku : "",
      productName: product ? product.name : "未知商品",
      quantity: -line.quantity,
      amount: line.quantity * line.unitPrice,
      party: line.customerName,
      note: line.note,
      documentNo: line.documentNo
    };
  });
  const adjustmentMovements = activeRows(state.adjustments).map((adjustment) => {
    const product = findProduct(state, adjustment.productId);
    const warehouse = findWarehouse(state, adjustment.warehouseId);
    return {
      id: `adjustment-${adjustment.id}`,
      sourceId: adjustment.id,
      type: "adjustment",
      label: "調整",
      date: adjustment.date,
      productId: adjustment.productId,
      warehouseId: adjustment.warehouseId,
      warehouseCode: warehouse ? warehouse.code : "",
      warehouseName: warehouse ? warehouse.name : "",
      sku: product ? product.sku : "",
      productName: product ? product.name : "未知商品",
      quantity: adjustment.quantity,
      amount: Math.abs(adjustment.quantity) * (product ? product.cost : 0),
      party: adjustment.reason,
      note: adjustment.note,
      documentNo: adjustment.documentNo
    };
  });
  const transferMovements = activeRows(state.transfers || []).flatMap((transfer) => {
    const product = findProduct(state, transfer.productId);
    const fromWarehouse = findWarehouse(state, transfer.fromWarehouseId);
    const toWarehouse = findWarehouse(state, transfer.toWarehouseId);
    const base = {
      sourceId: transfer.id,
      type: "transfer",
      label: "調撥",
      date: transfer.date,
      productId: transfer.productId,
      sku: product ? product.sku : "",
      productName: product ? product.name : "未知商品",
      amount: Math.abs(transfer.quantity) * (product ? product.cost : 0),
      party: `${fromWarehouse ? fromWarehouse.name : "未知倉庫"} -> ${toWarehouse ? toWarehouse.name : "未知倉庫"}`,
      note: transfer.note,
      documentNo: transfer.documentNo
    };

    return [
      Object.assign({}, base, {
        id: `transfer-out-${transfer.id}`,
        warehouseId: transfer.fromWarehouseId,
        warehouseCode: fromWarehouse ? fromWarehouse.code : "",
        warehouseName: fromWarehouse ? fromWarehouse.name : "",
        quantity: -transfer.quantity
      }),
      Object.assign({}, base, {
        id: `transfer-in-${transfer.id}`,
        warehouseId: transfer.toWarehouseId,
        warehouseCode: toWarehouse ? toWarehouse.code : "",
        warehouseName: toWarehouse ? toWarehouse.name : "",
        quantity: transfer.quantity
      })
    ];
  });
  const returnMovements = activeRows(state.returns || []).map((returnRow) => {
    const product = findProduct(state, returnRow.productId);
    const warehouse = findWarehouse(state, returnRow.warehouseId);
    const isSalesReturn = returnRow.documentType === "salesReturn";
    return {
      id: `return-${returnRow.id}`,
      sourceId: returnRow.id,
      type: returnRow.documentType,
      label: isSalesReturn ? "銷售退貨" : "進貨退貨",
      date: returnRow.date,
      productId: returnRow.productId,
      warehouseId: returnRow.warehouseId,
      warehouseCode: warehouse ? warehouse.code : "",
      warehouseName: warehouse ? warehouse.name : "",
      sku: product ? product.sku : "",
      productName: product ? product.name : "未知商品",
      quantity: isSalesReturn ? returnRow.quantity : -returnRow.quantity,
      amount: returnRow.quantity * returnRow.unitPrice,
      party: returnRow.sourceDocumentNo,
      note: returnRow.reason,
      documentNo: returnRow.documentNo
    };
  });

  return purchaseMovements
    .concat(saleMovements)
    .concat(adjustmentMovements)
    .concat(transferMovements)
    .concat(returnMovements)
    .filter((item) => !filter.month || item.date.slice(0, 7) === filter.month)
    .filter((item) => {
      if (!query) {
        return true;
      }

      return [item.sku, item.productName, item.warehouseCode, item.warehouseName, item.documentNo, item.party, item.note, item.label]
        .some((value) => normalizeText(value).toLowerCase().includes(query));
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}

function exportInventoryRows(state, options) {
  return inventoryReport(state, options).map((item) => ({
    sku: item.product.sku,
    name: item.product.name,
    warehouse: item.warehouse ? `${item.warehouse.code} ${item.warehouse.name}` : "",
    categoryId: item.product.categoryId,
    unit: item.product.unit,
    onHand: item.onHand,
    adjusted: item.adjusted,
    cost: item.product.cost,
    price: item.product.price,
    safetyStock: item.product.safetyStock,
    stockValue: item.stockValue,
    revenue: item.revenue,
    grossProfit: item.grossProfit,
    lowStock: item.lowStock ? "yes" : "no"
  }));
}

function stockForProduct(state, productId, warehouseId) {
  const product = findProduct(state, productId);
  const warehouse = warehouseId ? findWarehouse(state, warehouseId) : null;
  const activePurchaseLines = expandPurchaseLines(state.purchases.filter(isActiveDocument));
  const activeSaleLines = expandSaleLines(state.sales.filter(isActiveDocument));

  const purchased = activePurchaseLines
    .filter((l) => l.productId === Number(productId) && (!warehouseId || l.warehouseId === Number(warehouseId)))
    .reduce((total, l) => total + l.quantity, 0);
  const sold = activeSaleLines
    .filter((l) => l.productId === Number(productId) && (!warehouseId || l.warehouseId === Number(warehouseId)))
    .reduce((total, l) => total + l.quantity, 0);
  const salesReturned = (state.returns || [])
    .filter(isActiveDocument)
    .filter((returnRow) => returnRow.documentType === "salesReturn" && returnRow.productId === Number(productId) && (!warehouseId || returnRow.warehouseId === Number(warehouseId)))
    .reduce((total, returnRow) => total + returnRow.quantity, 0);
  const purchaseReturned = (state.returns || [])
    .filter(isActiveDocument)
    .filter((returnRow) => returnRow.documentType === "purchaseReturn" && returnRow.productId === Number(productId) && (!warehouseId || returnRow.warehouseId === Number(warehouseId)))
    .reduce((total, returnRow) => total + returnRow.quantity, 0);
  const adjusted = state.adjustments
    .filter(isActiveDocument)
    .filter((adjustment) => adjustment.productId === Number(productId) && (!warehouseId || adjustment.warehouseId === Number(warehouseId)))
    .reduce((total, adjustment) => total + adjustment.quantity, 0);
  const transferredIn = (state.transfers || [])
    .filter(isActiveDocument)
    .filter((transfer) => transfer.productId === Number(productId) && (!warehouseId || transfer.toWarehouseId === Number(warehouseId)))
    .reduce((total, transfer) => total + transfer.quantity, 0);
  const transferredOut = (state.transfers || [])
    .filter(isActiveDocument)
    .filter((transfer) => transfer.productId === Number(productId) && (!warehouseId || transfer.fromWarehouseId === Number(warehouseId)))
    .reduce((total, transfer) => total + transfer.quantity, 0);
  const revenue = activeSaleLines
    .filter((l) => l.productId === Number(productId) && (!warehouseId || l.warehouseId === Number(warehouseId)))
    .reduce((total, l) => total + l.quantity * l.unitPrice, 0)
    - (state.returns || [])
      .filter(isActiveDocument)
      .filter((returnRow) => returnRow.documentType === "salesReturn" && returnRow.productId === Number(productId) && (!warehouseId || returnRow.warehouseId === Number(warehouseId)))
      .reduce((total, returnRow) => total + returnRow.quantity * returnRow.unitPrice, 0);
  const netPurchased = purchased - purchaseReturned;
  const netSold = sold - salesReturned;
  const onHand = netPurchased + adjusted + transferredIn - transferredOut - netSold;
  const cost = product ? product.cost : 0;
  const soldCost = activeSaleLines
    .filter((l) => l.productId === Number(productId) && (!warehouseId || l.warehouseId === Number(warehouseId)))
    .reduce((total, l) => total + saleCost(l), 0);
  const returnedCost = (state.returns || [])
    .filter(isActiveDocument)
    .filter((returnRow) => returnRow.documentType === "salesReturn" && returnRow.productId === Number(productId) && (!warehouseId || returnRow.warehouseId === Number(warehouseId)))
    .reduce((total, returnRow) => total + returnCost(returnRow), 0);

  return {
    product: product ? copyProduct(product) : null,
    productId: Number(productId),
    warehouse: warehouse ? copyWarehouse(warehouse) : null,
    warehouseId: warehouse ? warehouse.id : 0,
    onHand,
    purchased: netPurchased,
    sold: netSold,
    adjusted,
    transferredIn,
    transferredOut,
    stockValue: onHand * cost,
    revenue,
    grossProfit: revenue - (soldCost - returnedCost),
    lowStock: product ? onHand <= product.safetyStock : false
  };
}

function warehousesForReport(state, warehouseId) {
  if (warehouseId) {
    const warehouse = findWarehouse(state, warehouseId);
    return warehouse ? [warehouse] : [];
  }

  const active = state.warehouses.filter((warehouse) => warehouse.active);
  return active.length ? active : state.warehouses;
}

function sortInventoryRows(rows, sort) {
  const bySkuAndWarehouse = (a, b) => a.product.sku.localeCompare(b.product.sku)
    || normalizeText(a.warehouse && a.warehouse.code).localeCompare(normalizeText(b.warehouse && b.warehouse.code));

  return rows.slice().sort((a, b) => {
    if (sort === "onHandAsc") {
      return a.onHand - b.onHand || bySkuAndWarehouse(a, b);
    }

    if (sort === "stockValueDesc") {
      return b.stockValue - a.stockValue || bySkuAndWarehouse(a, b);
    }

    if (sort === "grossProfitDesc") {
      return b.grossProfit - a.grossProfit || bySkuAndWarehouse(a, b);
    }

    if (sort === "lowStockFirst") {
      return Number(b.lowStock) - Number(a.lowStock) || a.onHand - b.onHand || bySkuAndWarehouse(a, b);
    }

    return bySkuAndWarehouse(a, b);
  });
}

function filterByMonth(rows, month) {
  return rows.filter((row) => !month || row.date.slice(0, 7) === month);
}

function activeRows(rows) {
  return rows.filter(isActiveDocument);
}

function saleCost(sale) {
  if (sale && sale.costBasis && Number.isFinite(Number(sale.costBasis.totalCost))) {
    return Number(sale.costBasis.totalCost);
  }

  if (sale && sale.costBasis && Number.isFinite(Number(sale.costBasis.unitCost))) {
    return sale.quantity * Number(sale.costBasis.unitCost);
  }

  return 0;
}

function returnCost(returnRow) {
  if (returnRow && returnRow.costBasis && Number.isFinite(Number(returnRow.costBasis.unitCost))) {
    return returnRow.quantity * Number(returnRow.costBasis.unitCost);
  }

  return 0;
}

function isActiveDocument(row) {
  return !row || !row.status || row.status === "confirmed" || row.status === "amended" || row.status === "voidRequested";
}

function findProduct(state, id) {
  return state.products.find((product) => product.id === Number(id)) || null;
}

function findWarehouse(state, id) {
  return state.warehouses.find((warehouse) => warehouse.id === Number(id)) || null;
}

const inventoryReports = {
  inventoryReport,
  dashboard,
  grossProfitRanking,
  warehouseStockSummary,
  productWarehouseSummary,
  warehouseTransferSummary,
  reportSummary,
  stockMovements,
  exportInventoryRows,
  stockForProduct
};

export {
  inventoryReport,
  dashboard,
  grossProfitRanking,
  warehouseStockSummary,
  productWarehouseSummary,
  warehouseTransferSummary,
  reportSummary,
  stockMovements,
  exportInventoryRows,
  stockForProduct
};

export default inventoryReports;
