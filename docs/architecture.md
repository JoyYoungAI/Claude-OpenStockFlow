# 架構說明

這個 workspace 目前是一個 Codex 專案模板加示範專案。

## 分層

```text
workspace
  project guidance
  documentation
  scripts
  demo app
```

## 主要檔案

- `CODEX_PROJECT_GUIDE.md`：Codex 協作規範。
- `README.md`：專案入口和快速開始。
- `CONTRIBUTING.md`：人與 Codex 都要遵守的協作規則。
- `scripts/check.ps1`：專案檢查腳本。
- `apps/codex-demo`：示範專案。
- `apps/budget-app`：零依賴記帳 App。
- `docs/inventory-system-spec.md`：進銷存系統第一版規格。
- `apps/inventory-system`：依規格實作的第一版進銷存系統。

## 示範專案設計

`apps/codex-demo` 使用純 HTML、CSS、JavaScript，沒有外部套件依賴。它的目的不是展示複雜技術，而是測試這套規範能否支援一個完整的小功能：

- 有可使用的頁面。
- 有獨立資料邏輯。
- 有基本測試。
- 有檢查腳本可驗證。

## 記帳 App 設計

`apps/budget-app` 也是純 HTML、CSS、JavaScript。它把資料邏輯放在 `ledgerStore.js`，畫面互動放在 `app.js`，方便用單元測試驗證核心邏輯。

主要功能：

- 收入、支出紀錄。
- 月份和類型篩選。
- 支出分類彙總。
- 本月預算使用率。
- CSV 匯出。

## 進銷存系統設計

`apps/inventory-system` 使用純 HTML、CSS、JavaScript 實作。工具函式集中在 `inventoryUtils.js`，模型正規化集中在 `inventoryModels.js`，語系字典基礎集中在 `inventoryI18n.js`，權限集中在 `inventoryAccess.js`，稽核輔助集中在 `inventoryAudit.js`，備份輔助集中在 `inventoryBackup.js`，基本資料 UI 輔助集中在 `inventoryMasterDataUi.js`，報表計算集中在 `inventoryReports.js`，交易命令與公開 API 由 `inventoryStore.js` 組裝，localStorage、schema migration、備份還原檢查集中在 `inventoryStorage.js`，報表畫面渲染集中在 `inventoryRenderers.js`，常見錯誤訊息集中在 `inventoryMessages.js`，畫面流程集中在 `app.js`。目前版本為 `v1.17.2`，版本號由 `app.js` 設定並顯示在頁首。

主要功能：

- 商品管理與 SKU 重複檢查。
- 商品編輯與 SKU 更新保護。
- 基本資料中心，先集中產品類別主檔與資料管理。
- 產品類別主檔，供商品建立、商品篩選與報表分類使用。
- 倉庫主檔，管理倉庫代碼、名稱、類型與啟用狀態。
- 採購、銷售與盤點可指定倉庫。
- 倉庫調撥，支援來源倉、目的倉、調撥明細、來源庫存檢查、調撥表單、調撥列表與調撥流向摘要。
- 庫存計算使用商品 + 倉庫維度，同商品在不同倉庫分開計算。
- 往來對象主檔，管理供應商與客戶。
- 採購進貨增加庫存。
- 銷售出貨扣減庫存。
- 採購單與銷售單單據化，支援多筆商品明細共用同一 PO/SO 單號。
- 盤點調整單據化，支援 ADJ 單號並納入庫存計算。
- 庫存不足禁止銷售。
- 庫存報表、低庫存標示、CSV 匯出。
- 獨立報表中心，集中銷售摘要、進貨摘要、毛利排行與庫存報表。
- 倉庫庫存摘要與商品跨倉分布，讓多倉庫庫存更容易閱讀。
- 庫存異動明細報表，合併進貨、銷售與盤點調整流水。
- 商品分類篩選、進貨/銷售搜尋、月份篩選、毛利排行。
- 進貨/銷售紀錄作廢，以及庫存報表排序。
- HTML 使用版本參數載入 CSS/JS，避免瀏覽器沿用舊資源。
- localStorage 以 `schemaVersion`、`appVersion`、`assetVersion`、`savedAt` 包裝資料，舊格式會在載入時補齊缺少的資料集合；`v1.16.0` 起資料版本為 `7`，新增應收、應付、收付款與報表偏好設定資料集合；`v1.16.4` 起資料版本為 `8`，新增語系、地區格式與貨幣偏好欄位；`v1.17.0` 起資料版本為 `9`，新增退貨紀錄集合與成本層骨架；稽核軌跡將資料版本升到 `10`；組織、人員與授權範圍將資料版本升到 `11`。`v1.17.1` 補採購/銷售單據責任欄位與主管安全操作，仍沿用 schema `11`，因為欄位可相容補齊；`v1.17.2` 只補責任顯示文字，資料版本不變。銷售明細會保留 `costBasis` 成本快照，避免後續商品成本異動靜默改寫歷史毛利。
- 資料管理支援完整 JSON 備份匯出、備份檔檢查預覽，以及確認後整包還原。
