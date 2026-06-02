# 財務規格

財務是延伸模組 `E2`，目前定位為「進銷存自然產生的財務視角」，不是完整會計系統。它負責讓使用者看懂銷售收入、採購成本、應收、應付、收款、付款與現金壓力。

詳細版本路線與早期規劃保留於 [StockFlow 財務模組規劃](../finance-module-plan.md)。本文件作為 `docs/inventory/` 子規格入口，用來和主規格、檢查腳本與其他 inventory 子規格對齊。

## 模組定位

| 項目 | 定義 |
|---|---|
| UI 按鈕 | `E2 財務` |
| data-tab | `finance` |
| data-view | `finance` |
| 規格層級 | 延伸模組 |
| 核心目的 | 從採購、銷售與收付款看營運現金與帳款狀態 |

財務模組可以引用採購、銷售與付款資料，但不應一開始擴張成完整總帳、稅務、發票或銀行對帳系統。

## 範圍

第一階段做：

- 銷售產生應收。
- 採購產生應付。
- 登錄收款與付款。
- 顯示應收餘額、應付餘額、本期收款、本期付款。
- 報表中心顯示收入、成本、毛利與現金流摘要。

第一階段不做：

- 完整會計科目樹。
- 借貸分錄。
- 稅務申報。
- 多幣別。
- 銀行對帳。
- 發票字軌與電子發票串接。

## Receivable

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---:|---|
| id | number | 是 | 應收 ID |
| sourceType | string | 是 | 來源類型，第一階段以 `sale` 為主 |
| sourceDocumentNo | string | 是 | 來源銷售單號 |
| customer | string | 是 | 客戶 |
| amount | number | 是 | 應收金額 |
| paidAmount | number | 是 | 已收金額 |
| dueDate | string | 否 | 到期日 |
| status | string | 是 | `open`、`partial`、`paid`、`voided` |
| note | string | 否 | 備註 |

## Payable

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---:|---|
| id | number | 是 | 應付 ID |
| sourceType | string | 是 | 來源類型，第一階段以 `purchase` 為主 |
| sourceDocumentNo | string | 是 | 來源採購單號 |
| supplier | string | 是 | 供應商 |
| amount | number | 是 | 應付金額 |
| paidAmount | number | 是 | 已付金額 |
| dueDate | string | 否 | 到期日 |
| status | string | 是 | `open`、`partial`、`paid`、`voided` |
| note | string | 否 | 備註 |

## Payment

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---:|---|
| id | number | 是 | 收付款 ID |
| direction | string | 是 | `in` 代表收款，`out` 代表付款 |
| targetType | string | 是 | `receivable` 或 `payable` |
| targetId | number | 是 | 對應應收或應付 ID |
| amount | number | 是 | 收付款金額 |
| method | string | 否 | 付款方式 |
| date | string | 是 | 日期，格式 `YYYY-MM-DD` |
| note | string | 否 | 備註 |

## 資料規則

- 銷售單可產生應收，採購單可產生應付。
- 收款金額不可超過應收餘額。
- 付款金額不可超過應付餘額。
- 收款不可套用到應付，付款不可套用到應收。
- 收付款只影響現金流與帳款狀態，不改變銷售收入、採購成本與毛利。
- 作廢應收、應付或收付款時，不可直接刪除歷史紀錄，需依資料生命週期與作廢基準線處理。

## 報表引用

- 收入、成本與毛利以銷售和採購來源為主，不受是否已收款或已付款影響。
- 現金流只看實際收款與付款。
- 應收與應付報表需顯示原始單據、已收已付、餘額與狀態。
- 作廢或沖銷的財務事件預設不列入有效餘額，但需能追溯來源與原因。

## 與共用基準線的關係

- 財務事件需保留 `sourceDocumentNo`，遵守 [單據編號與關聯基準線](document-linkage-baseline.md)。
- 作廢、沖銷與反向收付款遵守 [資料生命週期與作廢基準線](data-lifecycle-void-baseline.md)。
- 危險操作與 disabled 提示遵守 [操作狀態與風險基準線](operation-risk-baseline.md)。
- 財務文字、欄位與提示應納入 [文字基準線對齊](ui-text-baseline.md)。

## 驗證

- 建立銷售後可以看到應收。
- 建立採購後可以看到應付。
- 部分收款後，應收餘額正確。
- 全額收款後，應收狀態為已結清。
- 部分付款後，應付餘額正確。
- 付款不可超過應付餘額，收款不可超過應收餘額。
- 報表中心的收入、成本、毛利不被收付款狀態影響。
- 現金流報表只看實際收款與付款。

守門標記：

- `finance-tab-finance`
- `finance-planning-link`
- `finance-receivable-payable-payment`
- `finance-source-document-link`
- `finance-cashflow-only-payments`
