# StockFlow 財務模組規劃

## 開發目標

下週一（2026-06-01）起，財務模組先以「進銷存自然產生的財務資料」為核心，不急著做完整會計總帳。

第一階段目標：

- 從採購、銷售、調撥、盤點異動推導成本、收入與庫存價值。
- 建立應收、應付、收款、付款的基礎模型。
- 讓經營者先看得懂現金壓力、毛利、未收款、未付款。

## 模組邊界

第一階段做：

- 銷售收入
- 採購成本
- 商品成本與毛利
- 應收帳款
- 應付帳款
- 收款紀錄
- 付款紀錄
- 財務摘要報表

第一階段不做：

- 完整會計科目樹
- 借貸分錄
- 稅務申報
- 多幣別
- 銀行對帳
- 發票字軌與電子發票串接

## 建議版本路線

### v1.16.0：財務資料模型核心

- 新增 `receivables`、`payables`、`payments` 或先以簡化集合表示。
- 銷售單可產生應收。
- 採購單可產生應付。
- 保留現金交易與賒帳交易的欄位空間。
- 資料 schema 升版。

### v1.16.1：收款與付款 UI

- 銷售紀錄可登錄收款。
- 採購紀錄可登錄付款。
- 顯示已收、未收、已付、未付。
- 防止付款金額超過應付、收款金額超過應收。

### v1.16.2：財務報表中心

- 本期收入、成本、毛利。
- 應收餘額、應付餘額。
- 收款列表、付款列表。
- 客戶應收排行、供應商應付排行。

### v1.16.3：營運現金視角

- 現金流入、現金流出。
- 未來付款壓力。
- 逾期應收、逾期應付。
- 報表月份與區間篩選。

### v1.16.4：語系與地區設定基礎建設

- 偏好設定新增介面語言、地區格式、貨幣代碼、貨幣符號與符號位置。
- 新增 `inventoryI18n.js` 作為語系字典基礎，先提供繁中預設值與後續多語系擴充入口。
- 資料 schema 升到 `8`，舊資料載入時自動補齊語系與貨幣偏好。

### v1.16.5：統一地區格式輸出

- 列表、交易紀錄、報表與庫存 CSV 統一使用偏好設定中的日期、數量、金額與千分位格式。
- 金額沿用貨幣符號與符號位置，百分比與筆數也改走同一條格式化路徑。

## 資料模型草案

### Receivable

```js
{
  id,
  sourceType: "sale",
  sourceDocumentNo,
  customer,
  amount,
  paidAmount,
  dueDate,
  status,
  note
}
```

### Payable

```js
{
  id,
  sourceType: "purchase",
  sourceDocumentNo,
  supplier,
  amount,
  paidAmount,
  dueDate,
  status,
  note
}
```

### Payment

```js
{
  id,
  direction: "in" | "out",
  targetType: "receivable" | "payable",
  targetId,
  amount,
  method,
  date,
  note
}
```

### Preferences

```js
{
  quantityDecimals,
  moneyDecimals,
  thousandsSeparator,
  decimalSeparator,
  reportTitle,
  reportHeaderText,
  reportFooterText,
  showPrintDate,
  dateFormat
}
```

## 驗證標準

- 建立銷售後可以看到應收。
- 建立採購後可以看到應付。
- 部分收款後，應收餘額正確。
- 全額收款後，狀態為已結清。
- 付款不可超過應付餘額。
- 報表中心的收入、成本、毛利不被收付款狀態影響。
- 現金流報表只看實際收款與付款。

## 開發提醒

財務模組要避免一開始就變成完整會計系統。StockFlow 目前最適合先做「老闆看得懂、每天用得到」的財務視角，再逐步長出會計級能力。
