# 商品與庫存基準

商品與庫存是整套系統的中心資料。採購、銷售、盤點、調撥與報表都必須回到同一套商品與庫存計算規則。

## 商品建立流程

1. 使用者新增商品。
2. 填入 SKU、商品名稱、分類、成本、售價、安全庫存。
3. 系統檢查 SKU 不可重複。
4. 商品出現在商品清單與庫存報表中。

## Product

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---:|---|
| id | number | 是 | 系統內部 ID |
| sku | string | 是 | 商品編號，不可重複 |
| name | string | 是 | 商品名稱 |
| category | string | 是 | 商品分類 |
| unit | string | 是 | 單位，例如 件、盒、箱 |
| cost | number | 是 | 目前成本 |
| price | number | 是 | 建議售價 |
| safetyStock | number | 是 | 安全庫存 |
| active | boolean | 是 | 是否啟用 |

## StockAdjustment

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---:|---|
| id | number | 是 | 調整紀錄 ID |
| productId | number | 是 | 商品 ID |
| warehouseId | number | 是 | 調整倉庫 ID |
| quantity | number | 是 | 調整數量，正數增加庫存，負數扣減庫存 |
| reason | string | 是 | 調整原因 |
| date | string | 是 | 日期，格式 `YYYY-MM-DD` |
| note | string | 否 | 備註 |
| documentNo | string | 否 | 調整單號，例如 `ADJ-202605-001` |

## StockItem

`StockItem` 可由商品、進貨、銷售和庫存調整即時計算，不一定要另外儲存。

| 欄位 | 型別 | 說明 |
|---|---|---|
| productId | number | 商品 ID |
| warehouseId | number | 倉庫 ID |
| warehouse | object | 倉庫摘要資料 |
| onHand | number | 目前庫存 |
| purchased | number | 累計進貨數 |
| sold | number | 累計銷售數 |
| adjusted | number | 累計調整數 |
| stockValue | number | 庫存成本金額 |
| revenue | number | 銷售收入 |
| grossProfit | number | 粗略毛利 |
| lowStock | boolean | 是否低於安全庫存 |

## 資料規則

- SKU 必須唯一。
- 商品名稱不可空白。
- 成本、售價、數量、安全庫存不可為負數。
- 停用商品不可新增進貨或銷售，但仍可出現在歷史紀錄和報表中。
- 庫存調整數量不可為 0。
- 盤點數量若與系統庫存相同，不建立調整單。
- 日期必須是 `YYYY-MM-DD`。

## 計算規則

```text
目前庫存 = 同商品同倉庫累計進貨數量 + 同商品同倉庫累計調整數量 - 同商品同倉庫累計銷售數量
```

```text
庫存成本金額 = 目前庫存 * 商品成本
```

## 驗證

- SKU 重複檢查。
- 商品新增成功與失敗。
- 盤點調整產生 ADJ 單號並改變庫存。
- 進貨、銷售、盤點依倉庫分開計算庫存。
- 低庫存判斷。
