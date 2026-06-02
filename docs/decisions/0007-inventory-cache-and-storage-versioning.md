# 0007 新增資源快取破除與資料版本控管

## 背景

StockFlow 持續快速迭代，使用者可能在瀏覽器中看到舊版 CSS 或 JavaScript。另一方面，localStorage 內的資料格式也會隨著功能增加而改變，例如往來對象、單據、盤點調整。

## 決定

HTML 載入 CSS 與 JavaScript 時加上版本參數，例如 `app.js?v=1.10.0`。localStorage 保存資料時改用帶版本的包裝格式：

```text
schemaVersion
appVersion
assetVersion
savedAt
state
```

舊版純資料格式仍可載入，缺少的資料集合會在載入時補成空陣列。`v1.11.0` 起，舊資料也會從既有商品分類補出 `productCategories`。`v1.12.0` 起，舊資料缺少 `warehouses` 時會補出預設主倉。`v1.13.0` 起，舊進貨、銷售與盤點資料缺少 `warehouseId` 時會補到預設主倉。

## 理由

- 更新版本後，瀏覽器會重新載入新版 CSS/JS。
- 使用者既有本機資料不用因格式升級而遺失。
- 後續資料結構變更可以靠 `schemaVersion` 做明確遷移。

## 版本

`v1.14.0`
