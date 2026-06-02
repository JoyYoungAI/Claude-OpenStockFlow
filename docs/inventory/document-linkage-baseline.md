# 單據編號與關聯基準線

單據編號不是畫面上的流水號，而是交易關聯的主鍵。凡是會影響庫存、帳款、借出歸還、業績或獎金的流程，都必須能從單據編號追回來源、狀態與後續影響。

這份基準線先定義商業邏輯邊界，不代表第一版已完整實作所有流程。後續新增功能時，應優先擴充單據交易核心，而不是讓各模組各自判斷同一張單據的影響。

## 核心原則

- 每張會改變業務狀態的單據都必須有 `documentNo`。
- 單據編號必須穩定，不因畫面排序、篩選或資料重算而改變。
- 庫存、帳款、業績、獎金、借出與歸還不可只靠表單欄位推測，必須能關聯 `sourceDocumentNo` 或 `relatedDocumentNo`。
- 單據狀態改變必須透過明確狀態機，不允許任意改欄位。
- 作廢、轉單、歸還、付款、收款都必須留下關聯鏈。
- 流程變化時，優先改「單據類型的事件規則」，不在庫存、財務、報表、UI 多處重複判斷。

## 單據類型

| 類型 | 編號前綴 | 主要影響 | 備註 |
|---|---|---|---|
| 採購進貨 | PO | 庫存增加、可產生應付 | 供應商進貨與入庫 |
| 銷售出貨 | SO | 庫存減少、可產生應收、可產生業績 | 客戶銷售與出貨 |
| 盤點調整 | ADJ | 庫存增加或減少 | 依盤點差異調整 |
| 倉庫調撥 | TRF | 來源倉減少、目的倉增加 | 不產生應收應付 |
| 借出單 | LOAN | 可售庫存轉為借出中 | 客戶借貨測試 |
| 借出轉出貨 | SO | 借出關聯銷售出貨 | 由借出單轉銷售 |
| 借出歸還 | LRTN | 借出中轉待驗收入庫 | 倉庫確認後才回可售庫存 |
| 收款 | RCPT | 應收減少、現金流入 | 關聯出貨或應收 |
| 付款 | PAY | 應付減少、現金流出 | 關聯進貨或應付 |

## 編號格式

第一版與後續模組應採用一致格式：

```text
{PREFIX}-{YYYYMM}-{SEQUENCE}
```

範例：

```text
SO-202605-001
PO-202605-001
LOAN-202605-001
LRTN-202605-001
```

規則：

- `PREFIX` 由單據類型決定。
- `YYYYMM` 以單據日期為基準，不以系統今天日期強制覆蓋。
- `SEQUENCE` 在同一前綴與月份內遞增。
- 作廢單據不可釋放編號重用。
- 轉單時新單據使用自己的編號，並保留來源單據關聯。

## 標準單據欄位

所有主要單據應逐步收斂到下列欄位：

| 欄位 | 說明 |
|---|---|
| id | 系統內部 ID |
| documentNo | 對使用者可見且可追蹤的單據編號 |
| documentType | 單據類型，例如 `sale`、`purchase`、`loanOut` |
| status | 單據狀態 |
| sourceDocumentNo | 由哪張單據產生，可為空 |
| relatedDocumentNos | 相關單據編號清單 |
| customerId / supplierId | 往來對象 |
| warehouseId | 主要倉庫 |
| ownerUserId | 建單或負責業務 |
| createdBy | 建立者 |
| confirmedBy | 確認者 |
| createdAt | 建立時間 |
| confirmedAt | 確認時間 |
| voidedAt | 作廢時間 |
| note | 備註 |

第一版目前沒有登入與權限，`ownerUserId`、`createdBy`、`confirmedBy` 可先保留為文字或未來欄位，但規格上必須保留位置。

## 標準事件模型

單據確認後，不應由各模組自行推測影響，而應依單據類型產生標準事件。

```text
確認單據
  -> 庫存事件 InventoryImpact
  -> 帳款事件 FinanceImpact
  -> 業績事件 SalesPerformanceImpact
  -> 待處理事件 PendingTask
```

### InventoryImpact

| 欄位 | 說明 |
|---|---|
| sourceDocumentNo | 來源單據 |
| productId | 商品 |
| warehouseId | 倉庫 |
| quantity | 數量，正數增加、負數減少 |
| stockBucket | 庫存桶，例如 `available`、`loaned`、`pendingInspection` |
| occurredAt | 發生時間 |

### FinanceImpact

| 欄位 | 說明 |
|---|---|
| sourceDocumentNo | 來源單據 |
| direction | `receivable` 或 `payable` |
| amount | 金額 |
| status | `open`、`partial`、`paid`、`voided` |
| dueDate | 到期日 |
| settledDocumentNos | 關聯收付款單據 |

### SalesPerformanceImpact

| 欄位 | 說明 |
|---|---|
| sourceDocumentNo | 來源單據 |
| salesOwnerId | 業務或負責人 |
| basisAmount | 業績基準金額 |
| commissionStatus | `pending`、`held`、`eligible`、`released`、`reversed` |
| releasePolicy | 發放政策 |
| releasedAt | 發放時間 |

## 單據狀態機

通用狀態：

| 狀態 | 說明 |
|---|---|
| draft | 草稿，尚未影響庫存或帳款 |
| confirmed | 已確認，已產生標準事件 |
| partiallySettled | 部分收款或付款 |
| settled | 已完成收款、付款或歸還 |
| converted | 已轉成其他單據 |
| voided | 已作廢，需保留反向事件或作廢紀錄 |

不同單據類型可有自己的狀態，但不得破壞通用狀態的語意。

## 借出流程

借出不是一般出貨，也不是免費銷售。借出單表示商品暫時離開可售庫存，但尚未成立收入與應收。

### 借出

1. 建立 `LOAN` 借出單。
2. 確認借出後，指定倉庫的可售庫存減少。
3. 同數量進入 `loaned` 借出中庫存桶。
4. 不產生應收帳款。
5. 不產生可發放業績獎金。

### 借出轉出貨

1. 客戶滿意並決定購買。
2. 借出單狀態改為 `converted`。
3. 建立關聯的 `SO` 出貨單。
4. `SO` 產生應收帳款與業績事件。
5. 業績可先列 `pending` 或 `held`，依獎金政策決定是否等收款後釋放。

### 借出歸還

1. 客戶不滿意或測試結束。
2. 建立 `LRTN` 借出歸還單，關聯原 `LOAN`。
3. 商品先從 `loaned` 轉入 `pendingInspection`。
4. 倉庫人員確認商品狀態後，才轉回 `available` 可售庫存。
5. 若商品損壞、短少或不可銷售，需建立調整或損耗單據，不可直接回可售庫存。

## 帳款與獎金政策

出貨單成立後，是否立即計算業績、是否立即可發放獎金，屬公司政策，不應寫死在出貨流程。

基準線先保留三種政策：

| 政策 | 說明 |
|---|---|
| 出貨即列業績，獎金待收款 | `SalesPerformanceImpact` 建立為 `held` |
| 收款後列入可發放 | 收款完成後轉為 `eligible` |
| 出貨即列入可發放 | 出貨確認後轉為 `eligible`，但需能因退貨或作廢反轉 |

不論採用哪種政策，應收未收回的狀態必須能在業績與獎金報表中被看見。

## 報表與查詢要求

後續報表應能用單據編號追查：

- 一張出貨單影響哪些庫存異動。
- 一張出貨單產生哪些應收與收款。
- 一張借出單是否已轉出貨或已歸還。
- 一張借出歸還單是否已由倉庫確認入庫。
- 一張出貨單的業績歸屬於誰。
- 應收未收回時，該業績獎金目前是保留、可發放或已發放。

## 示範資料驗證

範例資料應保留一組可被人肉驗證的單據關聯鏈，讓協作者在完整功能實作前就能確認商業語意：

- `PO` 進貨單產生應付帳款。
- `SO` 出貨單影響庫存，且可產生應收帳款。
- `LOAN` 借出單把可售庫存移到借出中，不產生應收。
- `SO` 可由 `LOAN` 轉出貨，並在應收或註記中保留業務與獎金狀態。
- `LRTN` 借出歸還單把借出中庫存移到待驗區，倉庫確認前不得回到可售庫存。

## 實作方向

後續應逐步建立單據交易核心：

```text
Document Service
  -> validate document
  -> assign documentNo
  -> transition status
  -> emit standard impacts
  -> persist document and impacts together
```

新增單據類型時，應新增該類型的事件規則，而不是在庫存、財務、報表與 UI 多處加入同一段判斷。

## 驗證

後續自動驗證應逐步覆蓋：

- 單據編號在同月份同類型遞增。
- 作廢單據不重用編號。
- 出貨單可追到庫存事件、應收事件與業績事件。
- 借出單不產生應收。
- 借出轉出貨會建立關聯出貨單。
- 借出歸還需倉庫確認後才回可售庫存。
- 收款完成後，獎金狀態可依政策從 `held` 轉為 `eligible`。
