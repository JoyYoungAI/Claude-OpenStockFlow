// 範例資料、教學內容、驗證清單
// 這裡的資料只用於「重設範例資料」與「同步教學」功能

const today = new Date().toISOString().slice(0, 10);
const sampleDocumentMonth = today.slice(0, 7).replace("-", "");

const seedState = {
  departments: [
    { id: 1, code: "ADM", name: "管理部", type: "admin", managerEmployeeId: 1, active: true, note: "系統管理與最終核准" },
    { id: 2, code: "SALES", name: "銷售部", type: "sales", managerEmployeeId: 3, active: true, note: "銷售與客戶服務" },
    { id: 3, code: "PUR", name: "採購部", type: "purchasing", managerEmployeeId: 5, active: true, note: "採購與供應商管理" },
    { id: 4, code: "WH", name: "倉管部", type: "warehouse", managerEmployeeId: 7, active: true, note: "入出庫、盤點與調撥" },
    { id: 5, code: "FIN", name: "財務部", type: "finance", managerEmployeeId: 8, active: true, note: "應收應付與收付款" },
    { id: 6, code: "AUD", name: "稽核室", type: "audit", managerEmployeeId: 9, active: true, note: "查核與稽核追蹤" }
  ],
  employees: [
    { id: 1, employeeNo: "E-OWNER", name: "本機管理者", departmentId: 1, role: "owner", active: true, canLogin: true, note: "預設管理者" },
    { id: 2, employeeNo: "S-001", name: "小明", departmentId: 2, role: "sales", managerEmployeeId: 3, active: true, canLogin: true, note: "銷售人員" },
    { id: 3, employeeNo: "S-MGR", name: "大頭", departmentId: 2, role: "sales", active: true, canLogin: true, note: "銷售主管" },
    { id: 4, employeeNo: "P-001", name: "採購同事", departmentId: 3, role: "purchasing", managerEmployeeId: 5, active: true, canLogin: true, note: "採購人員" },
    { id: 5, employeeNo: "P-MGR", name: "採購主管", departmentId: 3, role: "purchasing", active: true, canLogin: true, note: "採購主管" },
    { id: 6, employeeNo: "W-001", name: "倉管同事", departmentId: 4, role: "warehouse", managerEmployeeId: 7, active: true, canLogin: true, note: "倉管人員" },
    { id: 7, employeeNo: "W-MGR", name: "倉管主管", departmentId: 4, role: "warehouse", active: true, canLogin: true, note: "倉管主管" },
    { id: 8, employeeNo: "F-001", name: "財務同事", departmentId: 5, role: "finance", active: true, canLogin: true, note: "財務人員" },
    { id: 9, employeeNo: "A-001", name: "稽核同事", departmentId: 6, role: "auditor", active: true, canLogin: true, note: "稽核查詢" }
  ],
  permissionScopes: [
    { id: 1, employeeId: 3, scopeType: "department", departmentIds: [2], employeeIds: [], actions: ["submitSale", "createSale", "rejectSale", "reassignSaleOwner", "requestVoid", "createSalesReturn"], active: true },
    { id: 2, employeeId: 5, scopeType: "department", departmentIds: [3], employeeIds: [], actions: ["submitPurchase", "createPurchase", "rejectPurchase", "reassignPurchaseOwner", "requestVoid", "createPurchaseReturn"], active: true },
    { id: 3, employeeId: 7, scopeType: "department", departmentIds: [4], employeeIds: [], actions: ["confirmPurchase", "confirmSale", "stockAdjust", "transferStock"], active: true }
  ],
  productCategories: [
    { id: 1, code: "FOOD", name: "食品", sortOrder: 10, note: "日常販售商品", active: true },
    { id: 2, code: "SUPPLY", name: "用品", sortOrder: 20, note: "門市營運用品", active: true }
  ],
  warehouses: [
    { id: 1, code: "MAIN", name: "主倉", type: "warehouse", note: "預設倉庫", active: true },
    { id: 2, code: "STORE", name: "門市", type: "store", note: "前台銷售點", active: true },
    { id: 3, code: "LOAN", name: "借出中", type: "loan", note: "借貨測試暫存，不視為可售庫存", active: true },
    { id: 4, code: "INSPECT", name: "待驗區", type: "inspection", note: "客戶歸還後，倉庫確認前暫存", active: true }
  ],
  products: [
    { id: 1, sku: "P-COF-001", name: "精品咖啡豆", categoryId: 1, unit: "包", cost: 260, price: 450, safetyStock: 5, active: true },
    { id: 2, sku: "P-MUG-002", name: "陶瓷馬克杯", categoryId: 2, unit: "個", cost: 120, price: 280, safetyStock: 8, active: true },
    { id: 3, sku: "P-TEA-003", name: "冷泡茶包", categoryId: 1, unit: "盒", cost: 95, price: 180, safetyStock: 10, active: true }
  ],
  partners: [
    { id: 1, role: "supplier", name: "咖啡供應商", contact: "林小姐", phone: "02-2345-1000", note: "咖啡豆主要來源", active: true },
    { id: 2, role: "supplier", name: "陶瓷工坊", contact: "陳先生", phone: "02-2345-2000", note: "杯具供應商", active: true },
    { id: 3, role: "customer", name: "門市客戶", contact: "", phone: "", note: "一般零售客戶", active: true },
    { id: 4, role: "customer", name: "批發客戶", contact: "王小姐", phone: "09-0000-0000", note: "固定採購客戶", active: true }
  ],
  purchases: [
    { id: 1, productId: 1, warehouseId: 1, quantity: 18, unitCost: 260, supplier: "咖啡供應商", date: today, note: "補貨進貨，產生應付帳款", documentNo: `PO-${sampleDocumentMonth}-001`, ownerEmployeeId: 4, ownerDepartmentId: 3, createdByEmployeeId: 4 },
    { id: 2, productId: 2, warehouseId: 1, quantity: 12, unitCost: 120, supplier: "陶瓷工坊", date: today, note: "門市陳列用品，含借出示範庫存", documentNo: `PO-${sampleDocumentMonth}-002`, ownerEmployeeId: 4, ownerDepartmentId: 3, createdByEmployeeId: 4 },
    { id: 3, productId: 3, warehouseId: 1, quantity: 20, unitCost: 95, supplier: "茶品供應商", date: today, note: "新品補貨", documentNo: `PO-${sampleDocumentMonth}-003`, ownerEmployeeId: 4, ownerDepartmentId: 3, createdByEmployeeId: 4 }
  ],
  sales: [
    { id: 1, productId: 1, warehouseId: 1, quantity: 13, unitPrice: 450, customer: "門市客戶", date: today, note: "一般零售出貨", documentNo: `SO-${sampleDocumentMonth}-001`, ownerEmployeeId: 2, ownerDepartmentId: 2, createdByEmployeeId: 2 },
    { id: 2, productId: 2, warehouseId: 1, quantity: 3, unitPrice: 280, customer: "門市客戶", date: today, note: "一般零售出貨", documentNo: `SO-${sampleDocumentMonth}-002`, ownerEmployeeId: 2, ownerDepartmentId: 2, createdByEmployeeId: 2 },
    { id: 3, productId: 3, warehouseId: 1, quantity: 5, unitPrice: 180, customer: "批發客戶", date: today, note: "批發出貨，應收未收回前獎金保留", documentNo: `SO-${sampleDocumentMonth}-003`, ownerEmployeeId: 2, ownerDepartmentId: 2, createdByEmployeeId: 2 },
    { id: 4, productId: 2, warehouseId: 3, quantity: 1, unitPrice: 280, customer: "批發客戶", date: today, note: `由 LOAN-${sampleDocumentMonth}-001 借出轉出貨；業務：陳業務；獎金狀態 held，待收款後釋放`, documentNo: `SO-${sampleDocumentMonth}-004`, ownerEmployeeId: 2, ownerDepartmentId: 2, createdByEmployeeId: 2 }
  ],
  adjustments: [
    { id: 1, productId: 2, warehouseId: 1, quantity: -1, reason: "盤點差異", date: today, note: "展示損耗", documentNo: `ADJ-${sampleDocumentMonth}-001` }
  ],
  transfers: [
    { id: 1, productId: 2, fromWarehouseId: 1, toWarehouseId: 3, quantity: 2, date: today, note: "借出單：批發客戶借貨測試，尚未產生應收", documentNo: `LOAN-${sampleDocumentMonth}-001` },
    { id: 2, productId: 2, fromWarehouseId: 3, toWarehouseId: 4, quantity: 1, date: today, note: `借出歸還：關聯 LOAN-${sampleDocumentMonth}-001，倉庫確認前停在待驗區`, documentNo: `LRTN-${sampleDocumentMonth}-001` }
  ],
  receivables: [
    { id: 1, sourceType: "sale", sourceDocumentNo: `SO-${sampleDocumentMonth}-003`, customer: "批發客戶", amount: 900, paidAmount: 0, dueDate: today, status: "open", note: "批發出貨應收，未收回前業績獎金保留" },
    { id: 2, sourceType: "sale", sourceDocumentNo: `SO-${sampleDocumentMonth}-004`, customer: "批發客戶", amount: 280, paidAmount: 0, dueDate: today, status: "open", note: `由 LOAN-${sampleDocumentMonth}-001 轉出貨；業務：陳業務；commissionStatus=held` }
  ],
  payables: [
    { id: 1, sourceType: "purchase", sourceDocumentNo: `PO-${sampleDocumentMonth}-001`, supplier: "咖啡供應商", amount: 4680, paidAmount: 2000, dueDate: today, status: "partial", note: "進貨產生應付，已部分付款" },
    { id: 2, sourceType: "purchase", sourceDocumentNo: `PO-${sampleDocumentMonth}-002`, supplier: "陶瓷工坊", amount: 1440, paidAmount: 0, dueDate: today, status: "open", note: "借出示範商品來源進貨" }
  ],
  payments: [
    { id: 1, direction: "out", targetType: "payable", targetId: 1, amount: 2000, method: "銀行轉帳", date: today, note: `支付 PO-${sampleDocumentMonth}-001 部分貨款` }
  ],
  preferences: {
    locale: "zh-Hant-TW", interfaceLanguage: "zh-Hant", quantityDecimals: 0, moneyDecimals: 0,
    thousandsSeparator: ",", decimalSeparator: ".", currencyCode: "TWD", currencySymbol: "$",
    currencyPosition: "prefix", reportTitle: "Claude-OpenStockFlow 營運報表", reportHeaderText: "Claude-OpenStockFlow",
    reportFooterText: "", showPrintDate: true, dateFormat: "YYYY-MM-DD"
  }
};

const learningTopics = [
  {
    id: "sync-basic", title: "進銷存同步基礎", summary: "了解資料如何即時同步與衝突處理。",
    sections: [
      { heading: "什麼是同步？", body: "本系統所有資料存在 localStorage，多分頁開啟時需手動重新整理以同步最新資料。", type: "info" },
      { heading: "操作建議", items: ["同一時間只在一個分頁進行寫入操作。", "若出現「資料已在其他視窗更新」警告，請先重新整理再繼續。"], type: "warning" }
    ]
  },
  {
    id: "backup-restore", title: "備份與還原", summary: "了解如何匯出與匯入完整備份。",
    sections: [
      { heading: "匯出備份", body: "點選「匯出完整備份」，系統會下載包含所有資料的 JSON 檔案。", type: "info" },
      { heading: "還原備份", body: "在基本資料頁面選擇備份 JSON 檔，確認後點「還原資料」，目前資料會被取代。", type: "danger" },
      { heading: "注意", items: ["備份檔包含所有進銷存、財務與稽核紀錄。", "還原後無法撤銷，請確認備份檔來源正確。"], type: "warning" }
    ]
  },
  {
    id: "loan-flow", title: "借出與歸還流程", summary: "了解借貨如何追蹤，以及歸還後的倉庫流程。",
    sections: [
      { heading: "借出操作", body: "使用調撥單從主倉移至「借出中」倉庫，並在備註記錄借貨對象與目的。", type: "info" },
      { heading: "歸還操作", body: "歸還時從「借出中」調撥至「待驗區」，待倉管確認後再移回主倉。", type: "info" },
      { heading: "範例流程", items: [`LOAN-${sampleDocumentMonth}-001：從主倉借出 1 個馬克杯`, `LRTN-${sampleDocumentMonth}-001：借出歸還，移至待驗區`], type: "info" }
    ]
  },
  {
    id: "receivable-flow", title: "應收帳款流程", summary: "了解銷售如何產生應收，以及收款後的沖帳。",
    sections: [
      { heading: "建立應收", body: "銷售出貨時勾選「建立應收帳款」，系統自動產生對應的應收紀錄。", type: "info" },
      { heading: "收款沖帳", body: "在財務模組選擇「收款」方向，選擇對應應收項目，輸入金額後儲存。", type: "info" },
      { heading: "範例", body: `SO-${sampleDocumentMonth}-004 的應收註記含 commissionStatus=held，代表借出轉出貨後，獎金仍待收款或政策確認。`, type: "warning" }
    ]
  },
  {
    id: "checklist-guide", title: "人肉驗證清單說明", summary: "了解如何使用右側清單進行手動驗證。",
    sections: [
      { heading: "用途", body: "右側清單提供常見驗證項目，協助你在測試或上線前確認系統行為符合預期。", type: "info" },
      { heading: "建議步驟", items: ["依照清單逐項操作並觀察結果。", "如有異常，記錄單號與操作步驟，便於回報或排查。"], type: "info" }
    ]
  }
];

const learningChecklist = [
  `PO-${sampleDocumentMonth}-001：進貨 18 包咖啡豆，應付 $4,680，已付 $2,000`,
  `SO-${sampleDocumentMonth}-001：銷售 13 包咖啡豆，庫存應剩 5 包`,
  `LOAN-${sampleDocumentMonth}-001：借出 2 個馬克杯至借出中倉`,
  `SO-${sampleDocumentMonth}-004：馬克杯借出轉銷售，應收 $280`,
  `ADJ-${sampleDocumentMonth}-001：馬克杯盤點差異 -1`,
  "主倉馬克杯庫存 = 12 - 3 - 2 - 1 = 6 個",
  "低庫存提醒：咖啡豆安全庫存 5，實際庫存 5（邊界）"
];
