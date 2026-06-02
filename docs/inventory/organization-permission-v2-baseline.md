# 組織、人員與細緻權限第二版基準線

本基準線定義 StockFlow 從「本機角色」走向「部門、人員、主管、授權範圍」的第二版權限模型。第一版角色只回答「採購、銷售、倉管、財務、稽核能不能做」，第二版要回答「哪一個人、隸屬哪個部門、主管能處理哪些下屬或部門單據、單據在什麼狀態前可以異動」。

## 核心原則

- 角色是職能，部門是組織，人員是操作者，授權範圍是邊界。
- 主管權限不是全公司權限；主管只能處理被授權部門或下屬的單據。
- 未正式影響庫存、財務、業績前，需保留可修改與可刪除草稿的機制。
- 已正式影響庫存、財務、業績後，不直接刪除或覆寫；需退回、作廢、差額、退貨、換貨或反向事件。
- 每次新增、刪除、修改、查詢、列印都需進稽核軌跡。
- 匯入資料需能帶入部門、人員、主管關係與停用狀態，但不得靜默覆蓋既有權限。

## 第二版新增主檔

### Department

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---:|---|
| `id` | number | 是 | 部門 ID。 |
| `code` | string | 是 | 部門代碼，不可重複。 |
| `name` | string | 是 | 部門名稱。 |
| `type` | string | 是 | `sales`、`purchasing`、`warehouse`、`finance`、`admin`、`audit`。 |
| `parentDepartmentId` | number | 否 | 上層部門。 |
| `managerEmployeeId` | number | 否 | 部門主管。 |
| `active` | boolean | 是 | 是否啟用。 |
| `note` | string | 否 | 備註。 |

### Employee

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---:|---|
| `id` | number | 是 | 員工 ID。 |
| `employeeNo` | string | 是 | 員工編號，不可重複。 |
| `name` | string | 是 | 姓名。 |
| `departmentId` | number | 是 | 所屬部門。 |
| `role` | string | 是 | 主要角色，沿用 `owner`、`purchasing`、`sales`、`warehouse`、`finance`、`auditor`。 |
| `managerEmployeeId` | number | 否 | 直屬主管。 |
| `active` | boolean | 是 | 是否啟用。 |
| `canLogin` | boolean | 是 | 未來登入用；單機版可先保留。 |
| `note` | string | 否 | 備註。 |

### PermissionScope

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---:|---|
| `id` | number | 是 | 授權範圍 ID。 |
| `employeeId` | number | 是 | 被授權人。 |
| `scopeType` | string | 是 | `self`、`department`、`subtree`、`assignedEmployees`、`all`。 |
| `departmentIds` | array | 否 | 可管理部門。 |
| `employeeIds` | array | 否 | 可管理人員。 |
| `actions` | array | 是 | 可執行動作，如 `approveSale`、`editDraftSale`、`voidRequestSale`。 |
| `active` | boolean | 是 | 是否啟用。 |

守門標記：`org-permission-master-data`

## 角色、部門與主管權限

第二版需將權限判斷從：

```text
canPerform(action, role)
```

擴展為：

```text
canPerform(action, { role, employeeId, departmentId, targetDocument })
```

判斷順序：

1. 動作是否允許該角色。
2. 操作者是否為有效員工。
3. 操作者是否在該部門或被授權範圍內。
4. 若為主管操作，目標單據建立者是否屬於可管理部門或可管理下屬。
5. 單據狀態是否允許該操作。
6. 操作是否需要原因或審核。

範例：

- 銷售小明可新增自己的銷貨草稿與送審。
- 銷售主管大頭可修改、退回、刪除銷售部尚未正式出貨的草稿或送審單。
- 大頭不可修改採購部單據，不可直接改倉管已確認出庫的正式單。
- 稽核可查詢小明與大頭的操作紀錄，但不可改資料。

守門標記：`org-permission-supervisor-scope`

## 單據責任欄位

所有正式單據需逐步補齊：

| 欄位 | 說明 |
|---|---|
| `ownerEmployeeId` | 單據主要負責人。 |
| `ownerDepartmentId` | 單據負責部門。 |
| `createdByEmployeeId` | 建立人。 |
| `lastEditedByEmployeeId` | 最近修改人。 |
| `approvedByEmployeeId` | 核准人。 |
| `confirmedByEmployeeId` | 倉管或財務確認人。 |
| `voidRequestedByEmployeeId` | 作廢申請人。 |
| `voidedByEmployeeId` | 作廢執行人。 |

單機版可先保留既有文字欄位 `createdBy`、`approvedBy`、`voidedBy`，但新資料結構需預留 ID 欄位。

守門標記：`org-permission-document-ownership`

## 銷貨單可異動生命週期

銷貨單不可只看 `confirmed` 或 `voided`，需拆成更貼近商業流程的狀態：

| 狀態 | 系統值 | 可異動規則 |
|---|---|---|
| 草稿 | `draft` | 建立者與授權主管可修改、刪除。 |
| 送審 | `submitted` | 建立者不可直接改；主管可退回。 |
| 已核准 | `approved` | 等待倉管出庫；主管可退回，需原因。 |
| 出庫準備 | `picking` | 倉管揀貨中；銷售不可改，主管需退回流程。 |
| 已出庫 | `shipped` | 已影響庫存，不可直接修改或刪除。 |
| 已開立應收 | `billed` | 已影響帳款，不可直接修改或刪除。 |
| 已完成 | `completed` | 出庫與帳款流程完成，只能退貨、換貨、折讓或作廢申請。 |
| 已作廢 | `voided` | 原單保留，需看反向事件。 |
| 已沖銷 | `reversed` | 已由反向事件抵銷。 |

第二版第一階段可先將既有 `confirmed` 視為已正式成立，但規格需保留 `shipped` 與 `billed`，避免銷貨流程過早把庫存和財務綁死。

守門標記：`org-permission-sales-edit-lifecycle`

## 刪除與修改規則

| 情境 | 規則 |
|---|---|
| 銷售草稿輸入錯誤 | 建立者可修改；建立者或主管可刪除草稿，需稽核 tombstone。 |
| 已送審但未核准 | 主管可退回；建立者修正後重送。 |
| 已核准但未出庫 | 主管可退回或修改授權欄位；需原因。 |
| 已揀貨但未出庫 | 倉管退回揀貨，銷售主管再處理。 |
| 已出庫 | 不直接刪除；使用退貨、換貨、折讓或作廢申請。 |
| 已收款 | 不直接刪除；財務需沖銷或退款流程。 |

任何刪除或修改需寫入稽核：

- 修改前。
- 修改後。
- 操作者。
- 當下角色與部門。
- 原因。
- 是否主管代處理。

守門標記：`org-permission-edit-delete-rules`

## 退貨、部分退貨與換貨

### 整單退回

整單退回不是刪除銷貨單，而是建立銷售退貨 `SRTN`：

- 回補原出貨倉庫或指定退貨倉。
- 減少應收或建立退款/折讓。
- 毛利反向。
- 關聯原銷貨單。

### 部分退回

部分退回需以來源明細行控管：

- 不可超過該行剩餘可退數量。
- 可多次退回。
- 每次退回都有獨立 `SRTN`。

### 換貨

換貨需拆成兩段，不可用一筆資料模糊處理：

1. 退回舊商品：建立 `SRTN`。
2. 補出新商品：建立新 `SO` 或換貨出庫事件。

若有價差：

- 價差應收：建立應收差額。
- 價差退款：建立應付或退款事件。
- 無價差：仍需保留換貨關聯。

守門標記：`org-permission-return-exchange-flow`

## 匯入資料關聯

目前系統已有完整 JSON 備份還原，屬於整包匯入。第二版若加入部門與員工，匯入規則需擴充：

| 匯入內容 | 規則 |
|---|---|
| 部門 | `code` 不可重複；上層部門需存在或同批匯入。 |
| 員工 | `employeeNo` 不可重複；部門需存在；主管需存在或同批匯入。 |
| 授權範圍 | 指向的員工與部門需存在。 |
| 單據 | 若帶 `ownerEmployeeId`，該員工需存在；否則需進待補責任人狀態。 |
| 稽核 | 還原需保留；一般匯入不可偽造歷史稽核為系統事件。 |

匯入方式分兩階段：

1. 整包 JSON 還原：沿用現有備份還原，但 schema 需包含 `departments`、`employees`、`permissionScopes`。
2. CSV 批次匯入：只允許主檔，例如部門與員工；交易單據 CSV 匯入需另開規格。

守門標記：`org-permission-import-linkage`

## 稽核與列印

第二版需把人員與部門帶入稽核：

- `actorEmployeeId`
- `actorDepartmentId`
- `targetEmployeeId`
- `targetDepartmentId`
- `isSupervisorAction`
- `delegationReason`

主管代處理需在稽核 UI 明確顯示，不能只顯示「銷售主管修改」。

守門標記：`org-permission-audit-scope`

## 第一階段實作邊界

第二版第一階段建議：

1. 新增部門與員工主檔規格與資料集合。
2. 新增本機目前員工選擇器，取代單純角色選單。
3. `canPerform` 加入 employee / department / supervisor scope。
4. 銷貨單新增 `ownerEmployeeId`、`ownerDepartmentId`。
5. 草稿銷貨單可修改與可刪除 tombstone。
6. 主管可處理同部門未正式出貨單據。
7. 稽核紀錄顯示部門、人員與主管代處理。

暫不在第一階段做：

- 真登入。
- 密碼、帳號鎖定。
- 跨公司組織。
- 複雜獎金結算。
- 完整換貨 UI。
- 交易單據 CSV 匯入。

## 守門標記總表

- `org-permission-master-data`
- `org-permission-supervisor-scope`
- `org-permission-document-ownership`
- `org-permission-sales-edit-lifecycle`
- `org-permission-edit-delete-rules`
- `org-permission-return-exchange-flow`
- `org-permission-import-linkage`
- `org-permission-audit-scope`
