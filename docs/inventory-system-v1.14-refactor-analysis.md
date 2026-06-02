# StockFlow v1.14.x 拆解分析

## 目的

StockFlow 已走到 `v1.14.0`，功能從第一版進銷存逐步擴張到主檔、單據、盤點、多倉庫與報表中心。現在最大的風險不是功能不夠，而是程式結構開始變重：新增功能時容易同時碰到 UI、資料規則、儲存、匯出和測試。

`v1.14.x` 這條分支建議先做「深度整理」，不要急著新增調撥單。目標是讓下一階段的 `v1.15.0` 調撥、`v1.16.0` 倉庫安全庫存、`v1.17.0` 商品資料深化，可以站在更乾淨的骨架上。

## 現況盤點

目前檔案大致如下：

| 檔案 | 現況 | 主要責任 |
|---|---|---|
| `index.html` | 約 25KB | 所有頁籤、表單、報表 DOM |
| `styles.css` | 約 8KB | 全站樣式、表格、卡片、響應式 |
| `app.js` | 約 49KB | 事件綁定、畫面渲染、localStorage、備份還原、CSV |
| `inventoryStore.js` | 約 42KB | 資料模型、驗證、交易規則、報表計算 |
| `inventoryStore.test.js` | 約 11KB | 核心資料邏輯測試 |

現在的優點：

- 零依賴，瀏覽器直接開啟即可使用。
- 核心資料邏輯集中在 `inventoryStore.js`，可用 Node 測試。
- `app.js` 與 `inventoryStore.js` 分工已經比早期版本清楚。
- 多倉庫的資料模型已經進入核心計算，不再只是 UI 欄位。

現在的壓力點：

- `app.js` 同時處理事件、畫面、儲存、備份、匯出、DOM 查詢，已成為最大混合區。
- `inventoryStore.js` 同時處理模型正規化、商業規則、報表查詢、匯出資料，未來調撥與退貨會讓它變得更厚。
- 表單驗證目前主要依賴 HTML input 限制與 store 回傳 `null` / `{ error }`，錯誤型別還不夠系統化。
- 測試集中在資料核心，UI 狀態、備份還原邊界、垃圾輸入防護還可以更細。
- CSS 還可用，但表單、報表、卡片、表格樣式已經開始需要分區管理。

## 拆解原則

這階段不建議引入 React、Vue、打包器或後端。原因是目前最大的價值仍是「本機可直接開」，而且現有測試流程也依賴零依賴。拆解應該先用多個普通 `<script>` 檔完成。

建議原則：

1. 先拆純函式，再拆 UI。
2. 先增加測試，再移動邏輯。
3. 每次只搬一類責任，搬完跑檢查。
4. 保留全域 API 相容，避免一次改壞瀏覽器載入順序。
5. 任何資料格式變更才升 `dataSchemaVersion`，單純拆檔只升 `appVersion` / `assetVersion`。

## 建議模組邊界

### 核心資料層

建議拆成：

| 檔案 | 責任 |
|---|---|
| `inventoryUtils.js` | 文字、日期、數字、ID、CSV cell 等通用工具 |
| `inventoryModels.js` | `normalizeProduct`、`copyProduct`、`normalizePurchase` 等模型正規化 |
| `inventoryReports.js` | `inventoryReport`、`warehouseStockSummary`、`productWarehouseSummary`、毛利排行 |
| `inventoryStore.js` | 狀態集合、交易命令、公開 API 組裝 |

先不要拆太細。目標不是檔案越多越好，而是讓「交易規則」和「報表計算」不要互相擠在同一段程式裡。

### 應用層

建議拆成：

| 檔案 | 責任 |
|---|---|
| `inventoryStorage.js` | localStorage、schema migration、備份摘要、還原驗證 |
| `inventoryDom.js` | `escapeHtml`、格式化、共用 render helper |
| `inventoryRenderers.js` | 商品、主檔、交易列表、報表渲染 |
| `app.js` | 啟動流程、事件綁定、呼叫 render、呼叫 store |

`app.js` 最後應該像一個指揮中心，而不是所有工作都在同一個房間裡完成。

### CSS

短期不必切檔，因為沒有打包器。可以先用註解和順序整理：

1. 基礎變數與 reset
2. Layout：shell、header、tabs、views
3. Components：panel、metric、badge、buttons、forms
4. Tables and lists
5. Reports
6. Responsive

若之後真的要拆 CSS，可改成多個 `<link>`，例如 `base.css`、`components.css`、`reports.css`，但 v1.14.x 先不急。

## 垃圾輸入與防護

目前 store 已有基本正規化，但錯誤回饋偏粗。建議建立統一錯誤碼：

```text
INVALID_INPUT
DUPLICATE_SKU
DUPLICATE_WAREHOUSE
DUPLICATE_PARTNER
UNKNOWN_PRODUCT
UNKNOWN_WAREHOUSE
INACTIVE_PRODUCT
INACTIVE_WAREHOUSE
INSUFFICIENT_STOCK
NO_DIFFERENCE
NEGATIVE_STOCK
```

下一步可以讓 store 回傳：

```js
{ ok: false, error: "UNKNOWN_WAREHOUSE" }
```

但這會碰到大量呼叫端，建議先做錯誤碼常數，不急著一次改 API。

特別要補的防護：

- 文字欄位最大長度在 store 層也要截斷或拒絕，不只靠 HTML。
- `NaN`、`Infinity`、負數、小數數量要明確測試。
- 已停用倉庫不可被新採購、銷售、盤點使用。
- 備份還原要拒絕重複 ID、無效日期、孤兒 `warehouseId`。
- CSV 匯出要確認欄位和內容一致，目前 header 要包含 `warehouse`。

## UI/UX 拆解方向

現有畫面已可用，但功能變多後，使用者會遇到三種壓力：

- 表單越來越長。
- 報表資訊越來越密。
- 主檔和交易的關係越來越多。

建議 UI 方向：

- 表單區塊標題更清楚，例如「商品明細」「單據資訊」「備註」。
- 交易表單的倉庫欄位固定靠前，因為它決定庫存檢查。
- 報表中心保留摘要卡，但每個報表區塊要有自己的篩選。
- 庫存報表可以逐步加入「彙總 / 明細」切換，避免商品 + 倉庫列太多。
- 錯誤訊息要從「新增失敗」變成「哪個欄位、為什麼失敗」。

## v1.14.x 建議路線

### v1.14.1：測試和防護先補強

目標：先抓住垃圾輸入垃圾輸出。

- 補 `inventoryStore.test.js` 的無效資料測試。
- 補停用倉庫不可交易測試。
- 補備份還原孤兒資料測試。
- 修正 CSV header 包含 `warehouse`。
- 不拆檔，只補安全網。

已在 `v1.14.1` 先完成第一批安全網：明確指定未知或停用倉庫時會拒絕交易，不再退回預設倉庫；進貨、銷售、單據、盤點補上更多無效資料測試；CSV header 納入 `warehouse`，並維持依目前庫存篩選條件匯出。

### v1.14.2：抽出模型與工具

目標：降低 `inventoryStore.js` 厚度。

- 新增 `inventoryUtils.js`。
- 新增 `inventoryModels.js`。
- 把 normalize/copy/same/number/date helper 移出。
- 保持 store 公開 API 不變。
- 更新 `index.html` script 載入順序。

已在 `v1.14.2` 完成第一階段拆骨架：新增 `inventoryUtils.js` 與 `inventoryModels.js`，先把主檔、夥伴、進貨、銷售的正規化規則接出來，並讓瀏覽器依序載入工具、模型、store、app。這版不改資料 schema，只升 `appVersion` / `assetVersion`，後續再逐步把剩餘商品、盤點與報表計算搬離 `inventoryStore.js`。

### v1.14.3：抽出報表計算

目標：讓庫存、毛利、倉庫摘要成為可測的報表模組。

- 新增 `inventoryReports.js`。
- 把 `inventoryReport`、`warehouseStockSummary`、`productWarehouseSummary`、`grossProfitRanking` 移出或委派。
- 增加報表專用測試情境。

已在 `v1.14.3` 完成報表計算抽出：新增 `inventoryReports.js`，集中處理庫存報表、儀表板摘要、毛利排行、倉庫庫存摘要、商品倉庫分布、期間摘要、庫存異動與庫存匯出列。`inventoryStore.js` 保留原本 API，改用 `reportState()` 把目前狀態交給報表模組，庫存檢查也委派同一套 `stockForProduct`，避免交易檢查與報表各自維護一份庫存算法。

### v1.14.4：抽出儲存、備份、還原

目標：把 localStorage 和 migration 從 `app.js` 中分離。

- 新增 `inventoryStorage.js`。
- 移出 `loadState`、`saveState`、`migrateState`、`validateBackupEnvelope`。
- 加入備份還原測試。
- 確認 `dataSchemaVersion = 5` 不變。

已在 `v1.14.4` 完成儲存、備份、還原抽出：新增 `inventoryStorage.js`，集中處理 localStorage key、資料版本、儲存包裝、舊資料 migration、備份檔驗證與備份摘要。`app.js` 改成只負責備份按鈕、檔案讀取、預覽與還原後重繪；資料 schema 維持 `5`，只升 `appVersion` / `assetVersion`。

### v1.14.5：抽出畫面渲染

目標：讓 `app.js` 變成事件與流程入口。

- 新增 `inventoryRenderers.js`。
- 把 `renderProducts`、`renderPurchases`、`renderReports`、`renderStock` 等移出。
- `app.js` 只負責收集表單、呼叫 store、呼叫 render。
- 這一步風險最大，建議一次只搬一個頁籤。

已在 `v1.14.5` 先搬報表中心渲染：新增 `inventoryRenderers.js`，先讓 `renderReports` 離開 `app.js`。這是最穩的第一步，因為報表計算已在 `v1.14.3` 抽出，報表畫面可以跟著建立外部 renderer 模式。

### v1.14.6：CSS 分區整理

目標：降低樣式互相影響。

- 不急著切檔，先用區塊註解整理。
- 檢查表格、卡片、表單、報表在手機寬度下是否仍可讀。
- 若需要再拆成多個 CSS 檔。

已在 `v1.14.6` 完成 CSS 分區整理：保留單一 `styles.css`，但用 Base、Layout、Controls、Reports、Panels and forms、Tables、Lists and cards、Responsive 等區塊標示責任。這版不改視覺，先把樣式地圖整理清楚。

### v1.14.7：錯誤訊息與輸入防護整理

目標：讓常見錯誤訊息有集中入口。

- 新增 `inventoryMessages.js`。
- 先集中商品、往來對象、主檔、採購、銷售、盤點與作廢進貨的常見錯誤訊息。
- 保留 store 現有回傳格式，不做大規模 API 改造。

已在 `v1.14.7` 完成第一階段訊息集中：新增 `inventoryMessages.js`，`app.js` 改用 `StockFlowMessages.message()` 與 `StockFlowMessages.transactionError()` 顯示常見錯誤。這是後續欄位級錯誤提示和錯誤碼常數化的地基。

### v1.14.8：收束與 2.0 前檢查

目標：把 v1.14.x 深度整理分支收束。

- 版本與快取參數升到 `v1.14.8`。
- 檢查新增模組載入順序。
- 架構文件同步更新。
- 保持 `dataSchemaVersion = 5` 不變。

已在 `v1.14.8` 完成收束：目前核心拆分為 utils、models、reports、store、storage、renderers、messages、app。`v1.14.x` 不再繼續拉長，下一輪可以回到功能主線。

## 建議下一步

建議下一次回到功能版，走 `v1.15.0`。

理由很樸素：`v1.14.x` 已經完成補防護、拆核心、拆報表、拆儲存、建立 renderer 模式、整理 CSS 與集中錯誤訊息。下一步應該回到進銷存功能宇宙，例如倉庫調撥、退貨、倉庫安全庫存，或商品資料深化。

`v1.15.0` 的建議方向：

- 倉庫調撥單：來源倉、目的倉、調撥日期、明細、備註。
- 調撥前檢查來源倉庫庫存。
- 調撥後進入庫存異動與倉庫報表。
- `scripts/check.ps1` 通過。
- 資料 schema 升到 `6`，新增 `transfers` 集合。

已在 `v1.15.0` 先完成倉庫調撥核心版：新增 `transfers` 資料集合，資料版本升到 `6`；store 提供 `addTransferOrder` 與 `listTransfers`；庫存計算納入調撥入庫與調撥出庫；庫存異動會顯示調撥進出兩筆明細。這版先不做完整 UI，後續可再補調撥單頁籤、作廢與更細的報表。

已在 `v1.15.1` 補上調撥單 UI 與列表：新增倉庫調撥頁籤、來源倉/目的倉表單、兩筆調撥明細、調撥查詢、月份篩選與列表顯示。這版仍不做作廢，保留給後續小版處理。

已在 `v1.15.2` 補上調撥報表：庫存異動明細已納入調撥進出，報表中心新增倉庫調撥流向摘要，可依報表月份查看各倉庫調入、調出與淨流量。

## 不建議現在做的事

- 不建議現在引入框架。
- 不建議一次把所有檔案拆完。
- 不建議在拆解同時新增調撥單。
- 不建議先重寫 CSS。
- 不建議改 store API 回傳格式，除非先鋪好相容層。

## 結論

StockFlow 目前不是要「重寫」，而是要「長骨架」。`v1.14.x` 的重點應該是先補防護、再拆核心、再拆 UI。這樣走到 `v1.15.0` 做倉庫調撥時，系統不會只是功能變多，而是承重能力也變好。
