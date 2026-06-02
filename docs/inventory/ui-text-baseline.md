# 文字基準線對齊

使用者可見文字必須有一致來源與語氣。文字不是裝飾，而是使用者判斷「我現在在哪裡、按下去會發生什麼、錯了怎麼修」的安全感來源。

## 管理原則

- 使用者可見文字優先由 `apps/inventory-system/inventoryI18n.js` 管理。
- 新增畫面文字時，應先加入語系字典，再由畫面或渲染流程讀取。
- 事件處理流程不直接散落主要錯誤訊息，避免多人協作時同一件事出現多種語氣。
- 規格、語系 key、畫面呈現三者需同步對齊。

## 第一階段：標題、提示、關鍵警示、主要錯誤訊息

- 瀏覽器標題與應用標題由 `inventoryI18n.js` 管理。
- 主導覽文字由 `inventoryI18n.js` 管理，並與總規格的模組地圖一致。
- 主要操作按鈕必須有 `title` 提示，說明動作效果。
- 會取代、停用、作廢、還原、重設或重新計算資料的操作，必須先顯示確認警示。
- 主要錯誤訊息由文字基準管理，不直接散落在事件處理流程中。

## 第二階段：表單欄位與 placeholder

- 主要表單 label 由 `inventoryI18n.js` 管理。
- 搜尋欄與輸入欄 placeholder 由 `inventoryI18n.js` 管理。
- 必填、選取、數字範圍與格式錯誤必須使用系統自訂提示，不依賴瀏覽器預設語氣。
- 欄位文字要以使用者工作語言命名，例如「入庫倉庫」比純技術欄位名稱更清楚。

## 第三階段：報表、空狀態、列表與完整語系化

- 列表狀態、操作文字、空狀態文字與常用單位由 `inventoryI18n.js` 管理。
- 報表摘要、報表列表、庫存異動與跨倉報表的固定文字由 `inventoryI18n.js` 管理。
- 空狀態文字要指出目前沒有資料的事實，不假設使用者犯錯。
- 報表文字要避免口語過度簡化，因為報表會影響庫存與金額判斷。

## 必要 key 類別

`inventoryI18n.js` 至少需維護下列類別：

- `app`
- `navigation`
- `tooltips`
- `confirmations`
- `messages`
- `operationGuards`
- `actions`
- `common`
- `fields`
- `placeholders`
- `validation`
- `headings`
- `subtitles`
- `tables`
- `emptyStates`
- `reports`

## 驗證

`scripts/check.ps1` 必須檢查核心語系 key 存在。新增高風險操作、主要表單或報表固定文字時，也應同步擴充檢查清單。
