# 審核流程基準線

本基準線定義單據從草稿、送審、核准、退回、確認到作廢申請的流程。審核流程必須接上資料生命週期、權限控管與單據編號關聯，避免任何人直接改掉已影響庫存或金流的資料。

## 核心原則

- 草稿不影響庫存、財務、業績或正式報表。
- 核准不一定等於確認；確認才代表正式產生影響。
- 已確認單據若需變更，走修改申請、作廢申請或反向事件。
- 每個審核動作需記錄操作者、時間與原因。
- 退回不刪資料，需保留退回原因。

## 狀態

| 狀態 | 系統值 | 說明 |
|---|---|---|
| 草稿 | `draft` | 建立中，可由建立者修改或刪除。 |
| 送審 | `submitted` | 等待核准，不可再直接修改明細。 |
| 已核准 | `approved` | 可進入確認，但尚未產生正式庫存或財務影響。 |
| 已退回 | `rejected` | 退回建立者修正，需保留原因。 |
| 已確認 | `confirmed` | 正式成立，依單據類型產生影響。 |
| 作廢申請 | `voidRequested` | 已確認單據申請作廢，等待核准。 |
| 已作廢 | `voided` | 作廢完成，需保留紀錄與必要反向事件。 |
| 已沖銷 | `reversed` | 原影響已由反向事件抵銷。 |

## 流程

```text
draft -> submitted -> approved -> confirmed
draft -> deleted
submitted -> rejected -> draft
confirmed -> voidRequested -> voided/reversed
confirmed -> amendRequested -> amended/confirmed
```

`deleted` 只允許草稿使用；已送審或已確認資料不得直接刪除。

## 角色責任

| 動作 | 可執行角色 |
|---|---|
| 建立草稿 | 採購、銷售、倉管、財務、owner 依模組權限執行 |
| 送審 | 草稿建立者或 owner |
| 核准 | owner 或該模組主管角色 |
| 退回 | 核准者 |
| 確認 | owner 或被授權確認者 |
| 作廢申請 | 原建立者、模組主管、owner |
| 作廢核准 | owner 或被授權核准者 |

## 必要欄位

| 欄位 | 說明 |
|---|---|
| `status` | 審核與生命週期狀態。 |
| `createdBy` | 建立者。 |
| `submittedBy` | 送審者。 |
| `submittedAt` | 送審時間。 |
| `approvedBy` | 核准者。 |
| `approvedAt` | 核准時間。 |
| `rejectedBy` | 退回者。 |
| `rejectedAt` | 退回時間。 |
| `rejectReason` | 退回原因。 |
| `confirmedBy` | 確認者。 |
| `confirmedAt` | 確認時間。 |
| `voidRequestedBy` | 作廢申請人。 |
| `voidRequestReason` | 作廢申請原因。 |

## 第一階段實作邊界

單機版可先維持「儲存即確認」的快速流程，但資料模型與 UI 文字要保留正式審核狀態。當啟用審核模式時：

- 儲存單據先進 `draft`。
- 確認後才影響庫存、財務與報表。
- 作廢要先申請，再核准。
- 審核按鈕依權限顯示 disabled reason。

## 與其他基準線的關係

- 角色與核准權限依 [權限控管基準線](access-control-baseline.md)。
- 已確認後的作廢與沖銷依 [資料生命週期與作廢基準線](data-lifecycle-void-baseline.md)。
- 作廢後 UI 追溯依 [作廢反向事件 UI 基準線](void-reversal-ui-baseline.md)。

## 守門標記

- `approval-draft-submit-approve-confirm`
- `approval-reject-keeps-history`
- `approval-void-request`
- `approval-no-delete-confirmed`
- `approval-role-based-actions`
