# 進銷存系統規格

本文件是進銷存系統的總規格入口。當規格內容開始牽涉不同模組、不同 UI 基準線與不同驗證方式時，細節應拆到 `docs/inventory/` 底下的子規格，避免單一文件過大而讓實作上下文失焦。

## 目標

建立一個可在本機直接使用的進銷存系統第一版，先覆蓋小型商家最核心的流程：

- 商品管理
- 採購進貨
- 銷售出貨
- 庫存報表

第一版重點是「資料正確、流程完整、狀態清楚」。`v1.13.0` 起先把採購、銷售、盤點接上倉庫，庫存正式以「商品 + 倉庫」維度計算；`v1.14.0` 起強化倉庫庫存報表；`v1.15.0` 起加入倉庫調撥核心；`v1.16.x` 起進入文字、操作狀態與風險基準線對齊；`v1.17.0` 起釘住正式營運基礎與本機角色權限控管；`v1.17.1` 起補採購/銷售單據責任歸屬與主管安全操作邊界；`v1.17.2` 起在採購/銷售列表顯示單據責任歸屬。

進階多店流程、退貨、完整審核流和會計級帳務仍留到後續版本。

## 使用角色

| 角色 | 主要需求 | 第一版權限 |
|---|---|---|
| 老闆 / 管理者 | 看商品、進貨、銷售、庫存與毛利概況 | 全部功能 |
| 採購人員 | 建立進貨紀錄，追蹤採購成本 | 商品檢視、進貨新增、庫存檢視 |
| 銷售人員 | 建立銷售紀錄，確認可售庫存 | 商品檢視、銷售新增、庫存檢視 |
| 倉管人員 | 確認庫存數量與低庫存商品 | 商品檢視、庫存報表 |

第一版不做登入和權限切換，但資料和頁面設計要保留未來加入角色權限的空間。

## 模組地圖

| 模組 | UI 按鈕文字 | data-tab | 規格位置 | 狀態 |
|---|---|---|---|---|
| 總覽 | 總覽 | overview | 本文件 | 入口看板 |
| 基本資料 | 1 基本資料 | masterdata | [基本資料規格](inventory/master-data-spec.md) | 第一版步驟 1 |
| 商品管理 | 2 商品管理 | products | [商品與庫存基準](inventory/product-stock-spec.md) | 第一版步驟 2 |
| 採購進貨 | 3 採購進貨 | purchases | [採購進貨規格](inventory/purchase-spec.md) | 第一版步驟 3 |
| 銷售出貨 | 4 銷售出貨 | sales | [銷售出貨規格](inventory/sales-spec.md) | 第一版步驟 4 |
| 盤點調整 | 5 盤點調整 | adjustments | [商品與庫存基準](inventory/product-stock-spec.md) | 第一版步驟 5 |
| 庫存報表 | 6 庫存報表 | reports | [報表與空狀態規格](inventory/reports-spec.md) | 第一版步驟 6 |
| 調撥 | E1 調撥 | transfers | [調撥規格](inventory/transfer-spec.md) | 延伸模組 |
| 財務 | E2 財務 | finance | [財務規格](inventory/finance-spec.md) | 延伸模組 |

主流程按鈕使用步驟編號，讓使用者從一張出貨單回推前置資料：基本資料、商品、採購補貨、銷售出貨、盤點修正、庫存回查。`總覽` 是入口看板，不編入作業步驟。

延伸功能可以保留在系統中，但不得混入第一版主流程編號。`往來對象` 歸入 `基本資料`；`調撥` 與 `財務` 屬延伸模組。若要升為主流程，必須先更新本表與對應子規格。

## 子規格索引

| 子規格 | 責任邊界 |
|---|---|
| [下刀前備份基準線](inventory/pre-change-backup-baseline.md) | 重大改動前的壓縮備份、命名、內容、排除與失敗處理 |
| [文字基準線對齊](inventory/ui-text-baseline.md) | 標題、提示、警示、錯誤、欄位、placeholder、列表、報表與語系化來源 |
| [操作狀態與風險基準線](inventory/operation-risk-baseline.md) | 按鈕顏色、hover、focus、disabled、危險操作、多視窗舊資料防護 |
| [單據編號與關聯基準線](inventory/document-linkage-baseline.md) | 單據編號、來源關聯、庫存事件、帳款事件、業績事件、借出歸還 |
| [資料生命週期與作廢基準線](inventory/data-lifecycle-void-baseline.md) | 草稿、確認、修改、作廢、沖銷、反向事件、報表引用與備份還原 |
| [權限控管基準線](inventory/access-control-baseline.md) | 角色、權限矩陣、高風險操作、備份還原與未來登入欄位 |
| [組織、人員與細緻權限第二版基準線](inventory/organization-permission-v2-baseline.md) | 部門、員工、主管授權範圍、未出貨前可異動、退貨換貨與匯入關聯 |
| [稽核軌跡基準線](inventory/audit-trail-baseline.md) | 新增、刪除、修改、查詢、列印、匯出、還原與權限拒絕的可追溯紀錄 |
| [審核流程基準線](inventory/approval-workflow-baseline.md) | 草稿、送審、核准、退回、確認、作廢申請與角色責任 |
| [退貨流程基準線](inventory/return-flow-baseline.md) | 銷售退貨、進貨退貨、來源單據、庫存、帳款、毛利與報表影響 |
| [成本法基準線](inventory/costing-method-baseline.md) | 簡化成本、移動加權、FIFO、成本層與歷史成本追溯 |
| [作廢反向事件 UI 基準線](inventory/void-reversal-ui-baseline.md) | 作廢狀態、原因、原單反向單連結、包含作廢查詢與反向事件入口 |
| [發票、稅務、會計分錄基準線](inventory/accounting-tax-baseline.md) | 營運財務與會計財務邊界、發票欄位、稅額欄位與分錄草案 |
| [多人同步與雲端資料庫基準線](inventory/cloud-sync-baseline.md) | 服務端事實來源、版本衝突、服務端發號、權限驗證與離線草稿 |
| [即時同步教學專區規格](inventory/realtime-sync-learning-spec.md) | 右上角教學入口、章節目錄、練習、測驗、同步與資料安全教學 |
| [基本資料規格](inventory/master-data-spec.md) | 產品類別、倉庫、往來對象、資料備份與還原 |
| [商品與庫存基準](inventory/product-stock-spec.md) | 商品、SKU、庫存計算、盤點調整、資料規則 |
| [採購進貨規格](inventory/purchase-spec.md) | 進貨流程、採購資料、入庫、採購成本 |
| [銷售出貨規格](inventory/sales-spec.md) | 銷售流程、出貨、庫存不足防護、粗略毛利 |
| [報表與空狀態規格](inventory/reports-spec.md) | 庫存報表、倉庫報表、CSV、空狀態、報表文字 |
| [調撥規格](inventory/transfer-spec.md) | 跨倉庫調撥、TRF 單號、來源扣減、目的增加、調撥報表 |
| [財務規格](inventory/finance-spec.md) | 應收、應付、收款、付款、現金流與財務摘要；延伸路線見 `docs/finance-module-plan.md` |

## 第一版範圍

第一版必做：

- 零依賴前端版本，可直接用瀏覽器打開。
- 使用 `localStorage` 保存資料，且資料必須包含 schema version。
- CSS/JS 載入路徑必須帶版本參數，避免瀏覽器沿用舊資源。
- 商品新增與商品清單。
- 產品類別主檔新增、停用與篩選。
- 倉庫主檔新增、停用與篩選。
- SKU 重複檢查。
- 進貨新增，可指定入庫倉庫，並增加該倉庫庫存。
- 銷售新增，可指定出貨倉庫，並扣減該倉庫庫存。
- 庫存不足時禁止銷售並顯示提示。
- 盤點調整可依實際盤點數建立庫存調整。
- 庫存報表顯示低庫存商品。
- 基礎總覽指標。
- CSV 匯出庫存報表。
- 完整 JSON 備份匯出、檢查、預覽與整包還原。
- 核心資料邏輯測試。
- 接入 `scripts/check.ps1`。

第一版不做：

- 登入、權限、帳號管理。
- 完整多門市營運流程。
- 採購單審核流程。
- 銷售退貨和進貨退貨。
- 會計級應收應付、發票、稅務、會計分錄。
- 條碼掃描、圖片上傳。
- 後端 API、資料庫、雲端同步。
- 複雜成本法，例如 FIFO、移動加權、批號效期。

## 驗證標準

第一版完成後，至少手動確認：

1. 新增商品後，商品出現在商品清單與庫存報表。
2. 新增進貨後，指定倉庫庫存數量增加。
3. 新增銷售後，指定倉庫庫存數量減少。
4. 銷售數量大於指定倉庫庫存時，系統拒絕新增。
5. 庫存低於安全庫存時，報表有明確標示。
6. 總覽數字與資料一致。
7. 匯出 CSV 內容包含商品與庫存欄位。
8. 重新整理頁面後，資料仍存在。
9. 建立盤點調整後，庫存報表與庫存異動明細同步更新。
10. 匯出完整備份後，可重新選擇該 JSON 並看到資料摘要。
11. 同一商品在不同倉庫進貨後，庫存報表分開顯示各倉庫數量。
12. 指定倉庫銷售或盤點時，只影響該商品在該倉庫的庫存。
13. 庫存報表可依倉庫篩選，報表中心可看到倉庫庫存摘要與商品跨倉分布。
14. 主要按鈕的 hover、focus、disabled 與危險操作警示符合基準線。
15. 標題、提示、主要錯誤、欄位、placeholder 與報表文字由語系檔管理。

自動驗證需由 `scripts/check.ps1` 執行，並包含：

- 專案必要檔案與規格拆分檔案存在。
- 下刀前備份基準線存在，備份資料夾至少有一份可辨識備份。
- 主導覽命名與本文件的模組地圖一致。
- 文字基準線必要語系 key 存在。
- 操作狀態與風險基準線必要 CSS/JS 防護存在。
- 單據編號與關聯基準線存在，並由本文件連結。
- 即時同步教學專區規格存在，並由本文件連結。
- 核心資料邏輯測試通過。

## 建議實作結構

```text
apps/inventory-system/
  index.html
  styles.css
  inventoryUtils.js
  inventoryModels.js
  inventoryReports.js
  inventoryStore.js
  inventoryStorage.js
  inventoryRenderers.js
  inventoryMessages.js
  inventoryI18n.js
  app.js
```

## 後續升級路線

第二版可加入：

- 編輯商品。
- 進貨/銷售紀錄刪除或作廢。
- 退貨流程。
- 更完整的跨倉調撥 UI。
- 客戶與供應商主檔延伸欄位。
- 商品條碼欄位。
- 更精準成本計算。

第三版可加入：

- 後端 API。
- 資料庫。
- 登入與權限。
- 匯入 CSV。
- 儀表板圖表。
- 發票與帳款模組。


- [Access layer refactor baseline](inventory/access-layer-refactor-baseline.md)

- [Audit layer refactor baseline](inventory/audit-layer-refactor-baseline.md)

- [Backup layer refactor baseline](inventory/backup-layer-refactor-baseline.md)

- [Master data UI refactor baseline](inventory/master-data-ui-refactor-baseline.md)
