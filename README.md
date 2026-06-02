# OpenStockFlow 進銷存系統

純前端、零依賴的進銷存系統，直接用瀏覽器開啟 `index.html` 即可使用，無需安裝任何套件或伺服器，所有資料存在 localStorage。

## 快速使用

下載後直接用瀏覽器開啟：

```
index.html
```

## 功能

- **角色權限**：老闆、採購、銷售、倉管、財務、稽核
- **主檔管理**：商品主檔、倉庫主檔、往來對象主檔（供應商／客戶）
- **進出貨**：採購進貨、銷售出貨（支援多明細）
- **退回**：進貨退回、銷售退回
- **盤點調整**：ADJ 調整單
- **報表**：庫存報表（商品 × 倉庫維度）、毛利報表、進出貨流水、庫存異動明細
- **匯出**：CSV 匯出、完整備份 JSON 匯出／匯入
- **版本管理**：localStorage schemaVersion、稽核軌跡

## 檔案結構

```
index.html               主畫面
app.js                   應用程式進入點
inventoryStore.js        資料狀態管理
inventoryModels.js       資料模型
inventoryStorage.js      localStorage 存取
inventoryAccess.js       角色權限控制
inventoryAudit.js        稽核軌跡
inventoryBackup.js       備份／還原
inventoryRenderers.js    UI 渲染
inventoryMasterDataUi.js 主檔 UI
inventoryReports.js      報表
inventoryMessages.js     訊息文字
inventoryI18n.js         多語系
inventoryUtils.js        工具函式
```

## 版本紀錄

| 版本 | 說明 |
|------|------|
| v1.17.x | 角色權限細化、稽核軌跡、主檔 UI 重構 |
| v1.16.x | 作廢／沖銷 UI |
| v1.15.x | 成本計算方法 |
| v1.14.0 | 商品 × 倉庫維度庫存計算 |
| v1.12.0 | 倉庫主檔版本資料 |
| v1.11.0 | 報表中心、產品類別主檔、完整備份 JSON |
| v1.9.0  | 盤點調整、ADJ 單 |
| v1.8.0  | 採購單／銷售單多明細 |
| v1.7.0  | 往來對象主檔 |
| v1.0.0  | 第一版：進貨、銷售、庫存報表 |
