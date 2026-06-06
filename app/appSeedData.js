// 範例資料、教學內容、驗證清單

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
function docMonth(dateStr) {
  return dateStr.slice(0, 7).replace("-", "");
}

const d40 = daysAgo(40); const dm40 = docMonth(d40);
const d38 = daysAgo(38); const dm38 = docMonth(d38);
const d35 = daysAgo(35); const dm35 = docMonth(d35);
const d30 = daysAgo(30); const dm30 = docMonth(d30);
const d25 = daysAgo(25); const dm25 = docMonth(d25);
const d20 = daysAgo(20); const dm20 = docMonth(d20);
const d15 = daysAgo(15); const dm15 = docMonth(d15);
const d12 = daysAgo(12); const dm12 = docMonth(d12);
const d10 = daysAgo(10); const dm10 = docMonth(d10);
const d7  = daysAgo(7);  const dm7  = docMonth(d7);
const d5  = daysAgo(5);  const dm5  = docMonth(d5);
const d3  = daysAgo(3);  const dm3  = docMonth(d3);
const d0  = daysAgo(0);  const dm0  = docMonth(d0);

const seedState = {
  departments: [
    { id: 1, code: "ADM",   name: "管理部", type: "admin",      managerEmployeeId: 1, active: true, note: "系統管理與最終核准" },
    { id: 2, code: "SALES", name: "銷售部", type: "sales",      managerEmployeeId: 3, active: true, note: "銷售與客戶服務" },
    { id: 3, code: "PUR",   name: "採購部", type: "purchasing", managerEmployeeId: 5, active: true, note: "採購與供應商管理" },
    { id: 4, code: "WH",    name: "倉管部", type: "warehouse",  managerEmployeeId: 7, active: true, note: "入出庫、盤點與調撥" },
    { id: 5, code: "FIN",   name: "財務部", type: "finance",    managerEmployeeId: 8, active: true, note: "應收應付與收付款" },
    { id: 6, code: "AUD",   name: "稽核室", type: "audit",      managerEmployeeId: 9, active: true, note: "查核與稽核追蹤" }
  ],
  employees: [
    { id: 1, employeeNo: "E-OWNER", name: "本機管理者", departmentId: 1, role: "owner",      active: true, canLogin: true, note: "預設管理者" },
    { id: 2, employeeNo: "S-001",   name: "小明",       departmentId: 2, role: "sales",      managerEmployeeId: 3, active: true, canLogin: true, note: "銷售人員" },
    { id: 3, employeeNo: "S-MGR",   name: "大頭",       departmentId: 2, role: "sales",      active: true, canLogin: true, note: "銷售主管" },
    { id: 4, employeeNo: "P-001",   name: "採購同事",   departmentId: 3, role: "purchasing", managerEmployeeId: 5, active: true, canLogin: true, note: "採購人員" },
    { id: 5, employeeNo: "P-MGR",   name: "採購主管",   departmentId: 3, role: "purchasing", active: true, canLogin: true, note: "採購主管" },
    { id: 6, employeeNo: "W-001",   name: "倉管同事",   departmentId: 4, role: "warehouse",  managerEmployeeId: 7, active: true, canLogin: true, note: "倉管人員" },
    { id: 7, employeeNo: "W-MGR",   name: "倉管主管",   departmentId: 4, role: "warehouse",  active: true, canLogin: true, note: "倉管主管" },
    { id: 8, employeeNo: "F-001",   name: "財務同事",   departmentId: 5, role: "finance",    active: true, canLogin: true, note: "財務人員" },
    { id: 9, employeeNo: "A-001",   name: "稽核同事",   departmentId: 6, role: "auditor",    active: true, canLogin: true, note: "稽核查詢" }
  ],
  permissionScopes: [
    { id: 1, employeeId: 3, scopeType: "department", departmentIds: [2], employeeIds: [], actions: ["submitSale", "createSale", "rejectSale", "reassignSaleOwner", "requestVoid", "createSalesReturn"], active: true },
    { id: 2, employeeId: 5, scopeType: "department", departmentIds: [3], employeeIds: [], actions: ["submitPurchase", "createPurchase", "rejectPurchase", "reassignPurchaseOwner", "requestVoid", "createPurchaseReturn"], active: true },
    { id: 3, employeeId: 7, scopeType: "department", departmentIds: [4], employeeIds: [], actions: ["confirmPurchase", "confirmSale", "stockAdjust", "transferStock"], active: true }
  ],
  productCategories: [
    { id: 1, code: "FOOD",   name: "食品", sortOrder: 10, note: "咖啡、茶品、甜食",   active: true },
    { id: 2, code: "SUPPLY", name: "用品", sortOrder: 20, note: "杯具、包材、消耗品", active: true }
  ],
  warehouses: [
    { id: 1, code: "MAIN",    name: "主倉",   type: "warehouse",  note: "預設倉庫",                         active: true },
    { id: 2, code: "STORE",   name: "門市",   type: "store",      note: "前台銷售點",                       active: true },
    { id: 3, code: "LOAN",    name: "借出中", type: "loan",       note: "借貨暫存，不視為可售庫存",          active: true },
    { id: 4, code: "INSPECT", name: "待驗區", type: "inspection", note: "客戶歸還後，倉管確認前暫存",        active: true }
  ],
  products: [
    { id: 1, sku: "P-COF-001", name: "精品咖啡豆", categoryId: 1, unit: "包", cost: 260, price: 450, safetyStock: 10, active: true },
    { id: 2, sku: "P-TEA-002", name: "冷泡茶包",   categoryId: 1, unit: "盒", cost:  95, price: 180, safetyStock: 15, active: true },
    { id: 3, sku: "P-CHO-003", name: "精選巧克力", categoryId: 1, unit: "盒", cost: 180, price: 320, safetyStock: 12, active: true },
    { id: 4, sku: "P-MUG-004", name: "陶瓷馬克杯", categoryId: 2, unit: "個", cost: 120, price: 280, safetyStock: 10, active: true },
    { id: 5, sku: "P-BAG-005", name: "禮品提袋",   categoryId: 2, unit: "個", cost:  15, price:  45, safetyStock: 20, active: true },
    { id: 6, sku: "P-FIL-006", name: "咖啡濾紙",   categoryId: 2, unit: "張", cost:   8, price:  25, safetyStock: 30, active: true }
  ],
  partners: [
    { id: 1, role: "supplier", name: "咖啡豆供應商", contact: "林小姐", phone: "02-2345-1000", note: "咖啡豆與茶品主要來源", active: true },
    { id: 2, role: "supplier", name: "陶瓷工坊",     contact: "陳先生", phone: "02-2345-2000", note: "杯具、包材供應商",     active: true },
    { id: 3, role: "customer", name: "門市客戶",     contact: "",       phone: "",             note: "一般零售客戶",         active: true },
    { id: 4, role: "customer", name: "批發客戶",     contact: "王小姐", phone: "09-0000-0000", note: "固定採購客戶",         active: true }
  ],

  // ── 採購單（document format with lines）──────────────────────────────────────
  purchases: [
    // PO-001（d40）咖啡豆 30包 + 冷泡茶 50盒；已確認；建立應付；應付逾期
    {
      id: 1, documentNo: `PO-${dm40}-001`, date: d40,
      warehouseId: 1, supplierId: 1, supplierName: "咖啡豆供應商",
      status: "confirmed", createPayable: true, dueDate: daysAgo(10),
      ownerEmployeeId: 4, ownerDepartmentId: 3, createdByEmployeeId: 4,
      note: "季節性補貨，應付帳款已部分付清",
      lines: [
        { lineId: 1, productId: 1, quantity: 30, unitCost: 260, receivedQuantity: 30 },
        { lineId: 2, productId: 2, quantity: 50, unitCost:  95, receivedQuantity: 50 }
      ]
    },
    // PO-002（d38）馬克杯 20個 + 禮品提袋 100個；已確認
    {
      id: 3, documentNo: `PO-${dm38}-002`, date: d38,
      warehouseId: 1, supplierId: 2, supplierName: "陶瓷工坊",
      status: "confirmed", createPayable: false,
      ownerEmployeeId: 4, ownerDepartmentId: 3, createdByEmployeeId: 4,
      note: "門市陳列與包材補貨，現金結清不建立應付",
      lines: [
        { lineId: 3, productId: 4, quantity:  20, unitCost: 120, receivedQuantity:  20 },
        { lineId: 4, productId: 5, quantity: 100, unitCost:  15, receivedQuantity: 100 }
      ]
    },
    // PO-003（d15）咖啡豆 20包 + 巧克力 15盒；已確認；建立應付；今日到期
    {
      id: 5, documentNo: `PO-${dm15}-003`, date: d15,
      warehouseId: 1, supplierId: 1, supplierName: "咖啡豆供應商",
      status: "confirmed", createPayable: true, dueDate: d0,
      ownerEmployeeId: 4, ownerDepartmentId: 3, createdByEmployeeId: 4,
      note: "月中補貨，含新品巧克力首批",
      lines: [
        { lineId: 5, productId: 1, quantity: 20, unitCost: 260, receivedQuantity: 20 },
        { lineId: 6, productId: 3, quantity: 15, unitCost: 180, receivedQuantity: 15 }
      ]
    },
    // PO-004（d5）咖啡濾紙 200張；已提交，待採購主管審核（庫存不生效 → 觸發低庫存警示）
    {
      id: 7, documentNo: `PO-${dm5}-004`, date: d5,
      warehouseId: 1, supplierId: 2, supplierName: "陶瓷工坊",
      status: "submitted", createPayable: false,
      submittedBy: "採購同事", submittedAt: d5 + "T08:00:00.000Z",
      ownerEmployeeId: 4, ownerDepartmentId: 3, createdByEmployeeId: 4,
      note: "耗材補貨，待採購主管審核",
      lines: [
        { lineId: 7, productId: 6, quantity: 200, unitCost: 8, receivedQuantity: 0 }
      ]
    },
    // PO-005（今日）馬克杯 15個；草稿，尚未提交
    {
      id: 8, documentNo: `PO-${dm0}-005`, date: d0,
      warehouseId: 1, supplierId: 2, supplierName: "陶瓷工坊",
      status: "draft", createPayable: false,
      ownerEmployeeId: 4, ownerDepartmentId: 3, createdByEmployeeId: 4,
      note: "草稿：待確認數量後提交",
      lines: [
        { lineId: 8, productId: 4, quantity: 15, unitCost: 120, receivedQuantity: 0 }
      ]
    }
  ],

  // ── 銷售單（document format with lines）──────────────────────────────────────
  // commissionStatus 在單頭：""=不追蹤, "pending"=待確認, "held"=保留, "paid"=已核發
  sales: [
    // SO-001（d35）批發：咖啡豆 8包 + 冷泡茶 10盒；已確認；應收已全數收款；業績已核發
    {
      id: 1, documentNo: `SO-${dm35}-001`, date: d35,
      warehouseId: 1, customerId: 4, customerName: "批發客戶",
      status: "confirmed", createReceivable: true, commissionStatus: "paid", dueDate: daysAgo(5),
      ownerEmployeeId: 2, ownerDepartmentId: 2, createdByEmployeeId: 2,
      note: "批發月結出貨，已全數收款，業績獎金已入帳",
      lines: [
        { lineId: 1, productId: 1, quantity:  8, unitPrice: 450, shippedQuantity:  8 },
        { lineId: 2, productId: 2, quantity: 10, unitPrice: 180, shippedQuantity: 10 }
      ]
    },
    // SO-002（d30）門市：馬克杯 3個；已確認；現收無應收
    {
      id: 3, documentNo: `SO-${dm30}-002`, date: d30,
      warehouseId: 1, customerId: 3, customerName: "門市客戶",
      status: "confirmed", createReceivable: false, commissionStatus: "",
      ownerEmployeeId: 2, ownerDepartmentId: 2, createdByEmployeeId: 2,
      note: "門市零售現收",
      lines: [
        { lineId: 3, productId: 4, quantity: 3, unitPrice: 280, shippedQuantity: 3 }
      ]
    },
    // SO-003（d12）批發：咖啡豆 5包 + 巧克力 3盒；已確認；應收尚未收款（今日到期）；業績保留
    {
      id: 4, documentNo: `SO-${dm12}-003`, date: d12,
      warehouseId: 1, customerId: 4, customerName: "批發客戶",
      status: "confirmed", createReceivable: true, commissionStatus: "held", dueDate: d0,
      ownerEmployeeId: 2, ownerDepartmentId: 2, createdByEmployeeId: 2,
      note: "批發月結，帳款尚未收回（今日到期），業績獎金暫保留",
      lines: [
        { lineId: 4, productId: 1, quantity: 5, unitPrice: 450, shippedQuantity: 5 },
        { lineId: 5, productId: 3, quantity: 3, unitPrice: 320, shippedQuantity: 3 }
      ]
    },
    // SO-004（d7）門市：冷泡茶 8盒 + 禮品提袋 10個；已確認；現收
    {
      id: 6, documentNo: `SO-${dm7}-004`, date: d7,
      warehouseId: 1, customerId: 3, customerName: "門市客戶",
      status: "confirmed", createReceivable: false, commissionStatus: "",
      ownerEmployeeId: 2, ownerDepartmentId: 2, createdByEmployeeId: 2,
      note: "門市零售現收",
      lines: [
        { lineId: 6, productId: 2, quantity:  8, unitPrice: 180, shippedQuantity:  8 },
        { lineId: 7, productId: 5, quantity: 10, unitPrice:  45, shippedQuantity: 10 }
      ]
    },
    // SO-005（d3）批發：咖啡豆 3包；已提交；待銷售主管確認（庫存不生效）
    {
      id: 8, documentNo: `SO-${dm3}-005`, date: d3,
      warehouseId: 1, customerId: 4, customerName: "批發客戶",
      status: "submitted", createReceivable: false, commissionStatus: "pending",
      submittedBy: "小明", submittedAt: d3 + "T09:00:00.000Z",
      ownerEmployeeId: 2, ownerDepartmentId: 2, createdByEmployeeId: 2,
      note: "批發出貨，待銷售主管確認後產生應收；業績待核定",
      lines: [
        { lineId: 8, productId: 1, quantity: 3, unitPrice: 450, shippedQuantity: 0 }
      ]
    },
    // SO-006（今日）門市：巧克力 5盒；草稿，尚未提交
    {
      id: 9, documentNo: `SO-${dm0}-006`, date: d0,
      warehouseId: 1, customerId: 3, customerName: "門市客戶",
      status: "draft", createReceivable: false, commissionStatus: "",
      ownerEmployeeId: 2, ownerDepartmentId: 2, createdByEmployeeId: 2,
      note: "草稿：門市訂單，確認後出貨",
      lines: [
        { lineId: 9, productId: 3, quantity: 5, unitPrice: 320, shippedQuantity: 0 }
      ]
    }
  ],

  // 有效庫存驗算（status=confirmed 生效）：
  // 咖啡豆：30+20-8-5=37  冷泡茶：50-10-8=32  巧克力：15-3=12（＝安全庫存邊界）
  // 馬克杯主倉：20-3-1-2=14  借出中：1個  待驗區：1個
  // 禮品提袋：100-10=90  咖啡濾紙：0（PO-004 submitted，未生效）→ 低庫存警示

  adjustments: [
    { id: 1, productId: 4, warehouseId: 1, quantity: -1, reason: "盤點差異",
      date: d25, note: "定期盤點，馬克杯展示品損耗一個", documentNo: `ADJ-${dm25}-001` }
  ],
  transfers: [
    { id: 1, productId: 4, fromWarehouseId: 1, toWarehouseId: 3, quantity: 2, date: d20,
      note: "批發客戶借貨測試展示用", documentNo: `LOAN-${dm20}-001` },
    { id: 2, productId: 4, fromWarehouseId: 3, toWarehouseId: 4, quantity: 1, date: d10,
      note: `借貨歸還，關聯 LOAN-${dm20}-001，待倉管確認後移回主倉`, documentNo: `LRTN-${dm10}-001` }
  ],
  receivables: [
    // AR-001：SO-001 全數收款，業績已核發
    { id: 1, sourceType: "sale", sourceDocumentNo: `SO-${dm35}-001`,
      customer: "批發客戶", amount: 5400, paidAmount: 5400,
      dueDate: daysAgo(5), status: "paid",
      note: "咖啡豆8包+冷泡茶10盒，已收清，業績獎金已核發" },
    // AR-002：SO-003 尚未收款，今日到期，業績保留
    { id: 2, sourceType: "sale", sourceDocumentNo: `SO-${dm12}-003`,
      customer: "批發客戶", amount: 3210, paidAmount: 0,
      dueDate: d0, status: "open",
      note: "咖啡豆5包+巧克力3盒，今日到期，業績獎金保留中" }
  ],
  payables: [
    // AP-001：PO-001 部分付款，已逾期
    { id: 1, sourceType: "purchase", sourceDocumentNo: `PO-${dm40}-001`,
      supplier: "咖啡豆供應商", amount: 12550, paidAmount: 5000,
      dueDate: daysAgo(10), status: "partial",
      note: "咖啡豆30包+冷泡茶50盒，已部分付清，餘款逾期" },
    // AP-002：PO-003 未付款，今日到期
    { id: 2, sourceType: "purchase", sourceDocumentNo: `PO-${dm15}-003`,
      supplier: "咖啡豆供應商", amount: 7900, paidAmount: 0,
      dueDate: d0, status: "open",
      note: "咖啡豆20包+巧克力15盒，今日到期，尚未付款" }
  ],
  payments: [
    { id: 1, direction: "out", targetType: "payable",    targetId: 1, amount: 5000, method: "銀行轉帳",
      date: daysAgo(20), note: `支付 PO-${dm40}-001 部分貨款` },
    { id: 2, direction: "in",  targetType: "receivable", targetId: 1, amount: 5400, method: "銀行轉帳",
      date: daysAgo(5),  note: `收取 SO-${dm35}-001 全額貨款` }
  ],
  preferences: {
    locale: "zh-Hant-TW", interfaceLanguage: "zh-Hant", quantityDecimals: 0, moneyDecimals: 0,
    thousandsSeparator: ",", decimalSeparator: ".", currencyCode: "TWD", currencySymbol: "$",
    currencyPosition: "prefix", reportTitle: "海風咖啡 進銷存報表", reportHeaderText: "海風咖啡",
    reportFooterText: "", showPrintDate: true, dateFormat: "YYYY-MM-DD"
  }
};

const learningTopics = [
  {
    id: "intro-flow", title: "整體流程說明", summary: "了解進銷存的核心流程與資料關聯。",
    sections: [
      { heading: "基本流程", body: "採購進貨 → 庫存增加 → 銷售出貨 → 庫存減少 → 財務收付款。每個步驟都在這套系統中有對應的單據。", type: "info" },
      { heading: "單據狀態流程", items: ["草稿（draft）：建單中，可修改，不影響庫存", "已提交（submitted）：等待審核，不影響庫存", "已確認（confirmed）：庫存生效，財務可追蹤", "已作廢（voided）：庫存回復，留有稽核紀錄"], type: "info" },
      { heading: "示範情境", body: "示範資料以「海風咖啡」為背景，涵蓋過去 40 天的完整進銷存週期，包含應付逾期、應收到期、借貨流程與低庫存警示。", type: "info" }
    ]
  },
  {
    id: "approval-flow", title: "審核流程示範", summary: "了解草稿→提交→確認的完整流程。",
    sections: [
      { heading: "為何需要審核流程？", body: "草稿與已提交的單據不計入庫存，可在確認前修正或取消，避免操作失誤造成帳務混亂。", type: "info" },
      { heading: "示範資料中的流程", items: [
        `PO-${dm5}-004（進貨單）：狀態「已提交」，咖啡濾紙 200 張待審核，目前庫存為 0 → 觸發低庫存警示`,
        `SO-${dm3}-005（銷售單）：狀態「已提交」，咖啡豆 3 包待確認，庫存尚未扣減`,
        `PO-${dm0}-005 與 SO-${dm0}-006：草稿狀態，可直接修改或刪除`
      ], type: "warning" },
      { heading: "操作建議", body: "切換「本機角色」為「採購主管」或「銷售主管」後，即可看到審核按鈕，體驗完整審批流程。", type: "info" }
    ]
  },
  {
    id: "loan-flow", title: "借出與歸還流程", summary: "了解借貨如何追蹤，以及歸還後的倉庫流程。",
    sections: [
      { heading: "借出操作", body: "使用調撥單從主倉移至「借出中」倉庫，並在備註記錄借貨對象與目的。", type: "info" },
      { heading: "歸還操作", body: "歸還時從「借出中」調撥至「待驗區」，待倉管確認後再移回主倉。", type: "info" },
      { heading: "示範流程", items: [
        `LOAN-${dm20}-001：從主倉借出 2 個馬克杯，主倉庫存 -2`,
        `LRTN-${dm10}-001：歸還 1 個，現停在待驗區，等待倉管確認品質`
      ], type: "info" }
    ]
  },
  {
    id: "commission-flow", title: "業績獎金流程", summary: "了解銷售業績如何與應收帳款連動。",
    sections: [
      { heading: "commissionStatus 說明", items: [
        "（空白）：此單不追蹤業績，如門市現金交易",
        "pending：已提交，業績待確認",
        "held：已確認出貨，但應收尚未收回，獎金保留",
        "paid：應收已收清，獎金已核發"
      ], type: "info" },
      { heading: "示範資料", items: [
        `SO-${dm35}-001：業績 paid，應收 $5,400 已全數收款`,
        `SO-${dm12}-003：業績 held，應收 $3,210 今日到期未收，獎金保留中`,
        `SO-${dm3}-005：業績 pending，銷售主管尚未確認`
      ], type: "warning" }
    ]
  },
  {
    id: "backup-restore", title: "備份與還原", summary: "了解如何匯出與匯入完整備份。",
    sections: [
      { heading: "匯出備份", body: "點選「匯出完整備份」，系統會下載包含所有資料的 JSON 檔案。", type: "info" },
      { heading: "還原備份", body: "在基本資料頁面選擇備份 JSON 檔，確認後點「還原資料」，目前資料會被取代。", type: "danger" },
      { heading: "注意", items: ["備份檔包含所有進銷存、財務與稽核紀錄。", "還原後無法撤銷，請確認備份檔來源正確。"], type: "warning" }
    ]
  }
];

const learningChecklist = [
  `PO-${dm40}-001：進貨咖啡豆 30包 + 冷泡茶 50盒，應付 $12,550，已付 $5,000（逾期 10 天）`,
  `SO-${dm35}-001：批發出貨 8包咖啡豆 + 10盒冷泡茶，應收 $5,400 已全數收款，業績獎金已入帳`,
  `SO-${dm12}-003：批發出貨，應收 $3,210 今日到期尚未收款，業績獎金保留中`,
  `LOAN-${dm20}-001：借出 2個馬克杯；LRTN-${dm10}-001：歸還 1個，停在待驗區`,
  "庫存驗算（確認狀態生效）：咖啡豆 30+20-8-5=37；冷泡茶 50-10-8=32；巧克力 15-3=12（等於安全庫存）",
  "馬克杯：主倉 20-3-1（盤點）-2（借出）=14；借出中 1個；待驗區 1個",
  "咖啡濾紙庫存=0，安全庫存 30，低庫存警示（PO-004 提交中，尚未生效）",
  `PO-${dm5}-004 狀態「已提交」示範審核流程；PO-${dm0}-005 草稿示範建單流程`
];
