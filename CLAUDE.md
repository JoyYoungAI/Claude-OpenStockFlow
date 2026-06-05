# Claude-OpenStockFlow — CLAUDE.md
> 大補丸 1 號 · 版本日期 2026-06-02

---

## 專案定位

純前端、零依賴的進銷存系統。**沒有 Node.js 執行環境、沒有 npm、沒有打包工具。**
所有 JS 以 `<script>` 標籤載入，執行在瀏覽器中，資料存在 `localStorage`。

Live Demo：https://joyyoungai.github.io/Claude-OpenStockFlow/

---

## 絕對禁止

- **禁止** 引入任何 npm 套件或 `import/export` ES module 語法
- **禁止** 新增 `node_modules`、`package.json`、`webpack`、`vite` 等工具
- **禁止** 使用 `fetch` 或任何網路請求（純離線 localStorage 系統）
- **禁止** 修改 `styles.css` 的 class 名稱（HTML 硬依賴）
- **禁止** 刪除任何 `module.exports` 區塊（測試用 Node.js require 依賴）

---

## 架構概覽

```
index.html          主畫面（所有 UI 結構）
styles.css          全域樣式

── 資料層 ──────────────────────────────
inventoryUtils.js           工具函式（純函式，無副作用）
inventoryModelsMaster.js    主檔模型（商品/倉庫/往來對象/部門/員工/權限）
inventoryModelsFinance.js   財務模型（應收/應付/收付款）
inventoryModels.js          交易模型 + 共用工具 + 彙整 master/finance export
inventoryStoreMaster.js     主檔 CRUD 子模組（state accessor 模式）
inventoryStoreFinance.js    財務子模組
inventoryStoreTransactions.js  交易子模組（進銷存核心）
inventoryStore.js           狀態殼層 + 公開 API 組裝
inventoryStorage.js         localStorage 讀寫 + schema migration
inventoryReports.js         報表計算（純函式）
appSeedData.js              範例資料 + 同步教學內容（重設用）

── 存取與稽核 ───────────────────────────
inventoryAccess.js          角色權限控制
inventoryAudit.js           稽核軌跡
inventoryBackup.js          備份/還原

── UI 層 ───────────────────────────────
inventoryI18n.js            多語系
inventoryMessages.js        UI 訊息文字
inventoryMasterDataUi.js    主檔 UI 元件
inventoryRenderers.js       報表 HTML 渲染

── 應用層（事件綁定 + DOM 操作）────────
appMaster.js        商品/倉庫/往來對象/員工表單
appPurchases.js     採購進貨
appSales.js         銷售出貨
appAdjustments.js   盤點調整 + 調撥
appFinance.js       財務（應收/應付/收付款）
appReports.js       報表/稽核/教學/庫存
app.js              初始化 + 共用函式 + 全域常數
```

---

## 模組命名規則

| 類型 | 規則 | 範例 |
|------|------|------|
| 瀏覽器全域 export | `global.Claude-OpenStockFlowXxx` | `global.Claude-OpenStockFlowModels` |
| Node.js export | `module.exports = global.Claude-OpenStockFlowXxx` | 每個模組最後都有 |
| IIFE 包裝 | `(function(global){ ... })(this)` | 所有 inventory*.js |
| app*.js 函式 | 直接宣告（全域 scope，無 IIFE） | `function renderPurchases()` |

---

## State Accessor 模式（Store 拆分後的關鍵）

`inventoryStore.js` 建立 `ctx` 物件傳給三個子模組：

```js
const ctx = {
  getProducts: () => products,
  setProducts: (v) => { products = v; },
  // ... 每個 collection 都有 getter/setter
  addPayable: (...) => financeModule.addPayable(...),  // 跨模組呼叫
};
```

**修改子模組時，跨模組呼叫一定要透過 ctx 傳入，不能直接引用其他模組的全域。**

---

## Script 載入順序（index.html 底部）

```
inventoryUtils → inventoryModelsMaster → inventoryModelsFinance → inventoryModels
→ inventoryI18n → inventoryAccess → inventoryAudit → inventoryBackup
→ inventoryReports → inventoryMasterDataUi
→ inventoryStoreMaster → inventoryStoreFinance → inventoryStoreTransactions
→ inventoryStore → inventoryStorage → inventoryRenderers → inventoryMessages
→ appSeedData
→ appMaster → appPurchases → appSales → appAdjustments → appFinance → appReports
→ app.js（最後）
```

**載入由 index.html 底部的 script loader 控制**（sequential，照 `files` 陣列順序）。
新增 JS 檔案：把檔名（不含 .js）加入 loader 的 `files` 陣列即可，版本字串只需改 loader 裡的 `var V`。
注意 `inventoryModelsMaster`、`inventoryModelsFinance` 必須排在 `inventoryModels` 之前。

---

## 測試

```bash
node inventoryStore.test.js
```

- 測試全部是 `assert` 語句，無測試框架依賴
- 需要 Node.js 環境（本機或 CI）
- 測試僅覆蓋 store 層，不覆蓋 UI 層
- 加新功能時同步在測試檔補對應 assert

---

## Schema 版本

| 常數 | 位置 | 說明 |
|------|------|------|
| `SCHEMA_VERSION` | `inventoryStorage.js` 第 3 行 | localStorage schema 版本號，目前 `12` |
| `appVersion` | `app.js` 第 1 行 | 顯示版本號，目前 `1.17.2` |

新增欄位時，`SCHEMA_VERSION` 加 1，並在 `migrateState()` 裡補 `withDefaultStatus` 或類似的欄位遷移邏輯。

---

## 重要欄位命名

| 欄位 | 型別 | 說明 |
|------|------|------|
| `supplierId` | Number | 進貨單 → partners 外鍵（0 = 未連結，字串 supplier 仍保留） |
| `customerId` | Number | 銷售單 → partners 外鍵（0 = 未連結，字串 customer 仍保留） |
| `receivedQuantity` | Number | 進貨單實際入庫數量 |
| `shippedQuantity` | Number | 銷售單已配貨數量 |
| `commissionStatus` | String | 銷售單業績狀態（""/"pending"/"held"/"paid"/"voided"） |
| `unitPrice` | Number | 退貨單金額（舊版為 unitAmount，已改名） |

---

## CIA 安全原則

- **Confidentiality**：`inventoryAccess.js` 控制所有資料存取，修改前確認 `canPerform()` 邏輯
- **Integrity**：進銷存核心邏輯在 `inventoryStoreTransactions.js`，改動前讀完整個檔案
- **Availability**：`inventoryStorage.js` 的 `migrateState()` 保護舊資料不遺失，版本升級必須向後相容

---

## Git 工作流

- branch: `main`（直接推）
- commit message: 繁體中文或英文均可，說明 **為何** 而非 **做了什麼**
- push 需要 GitHub PAT，用完立即在 GitHub 刪除
- 推送前先確認 `git status` 沒有夾帶 backup zip、.codex/ 等內部檔案

## Current runtime layout

Updated 2026-06-04.

```text
index.html              browser entry and sequential script loader
styles.css              global styles

core/                   data models, reports, store, storage
services/               access control, audit, backup
ui/                     i18n, messages, renderers, master-data UI widgets
app/                    app event handlers, shared app UI helpers, seed data
esm/                    no-build ESM parity modules, not used by browser loader yet
```

Tests still run from the repository root:

```bash
node inventoryStore.test.js
node inventoryEsm.test.mjs
```