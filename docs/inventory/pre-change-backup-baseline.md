# 下刀前備份基準線

下刀前備份是工程協作的安全基準。不是每位協作者都會使用 GitHub，也不是每個作業環境都有版本控制；因此在進行會影響多檔案、多模組、資料結構、規格基準線或 UI 流程的改動前，必須先建立一份可辨識、可攜帶、可還原參考的壓縮備份。

## 核心原則

- 會影響系統基準線或多檔案的改動，先備份，再下刀。
- 備份檔名必須讓人一眼看出建立時間與改動主題。
- 備份應使用壓縮檔，方便不熟 Git 的協作者保存、傳遞與回查。
- 備份失敗時，不得繼續進行該次改動。
- 備份不是取代版本控制，而是補上非工程使用者也能理解的安全退路。

## 必須備份的情境

以下情境下刀前必須先建立備份：

- 新增或修改基準線規格。
- 拆分或重組規格文件。
- 修改 `apps/inventory-system/` 多個檔案。
- 修改資料模型、localStorage schema、備份還原、匯入匯出。
- 修改單據、庫存、財務、應收應付、借出歸還、業績獎金邏輯。
- 修改主導覽、模組入口、教學頁或其他跨模組 UI。
- 修改 `scripts/check.ps1` 或專案守門檢查。

小型單一文字修正、註解修正或不影響流程的文件 typo 可不備份，但若不確定，預設備份。

## 備份位置

備份放在：

```text
backups/pre-change/
```

此資料夾用於保存下刀前快照，不放入功能程式邏輯，不作為正式資料庫。

## 命名規則

```text
stockflow-prechange-YYYYMMDD-HHMMSS-{topic}.zip
```

範例：

```text
stockflow-prechange-20260531-141249-pre-change-backup-baseline.zip
stockflow-prechange-20260531-150500-data-lifecycle-baseline.zip
```

規則：

- `YYYYMMDD-HHMMSS` 使用建立備份當下的本機時間。
- `{topic}` 使用小寫英文、數字與連字號。
- 主題需能對應本次改動，例如 `document-linkage-baseline`、`learning-module-ui`。

## 備份內容

壓縮檔至少包含：

```text
apps/inventory-system/
docs/
scripts/
README.md
CONTRIBUTING.md
CODEX_PROJECT_GUIDE.md
```

可依改動範圍加入其他必要檔案，但不得省略上述核心內容。

## 排除內容

備份不應包含：

```text
.git/
node_modules/
backups/
*.log
暫存檔
作業系統縮圖或快取
```

避免備份包無限膨脹，也避免備份裡再包備份。

## 建議建立方式

PowerShell 範例：

```powershell
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$topic = 'data-lifecycle-baseline'
$backupRoot = Join-Path (Get-Location) 'backups\pre-change'
New-Item -ItemType Directory -Force -Path $backupRoot | Out-Null
$zipPath = Join-Path $backupRoot "stockflow-prechange-$timestamp-$topic.zip"
$items = @('apps\inventory-system','docs','scripts','README.md','CONTRIBUTING.md','CODEX_PROJECT_GUIDE.md')
Compress-Archive -Path $items -DestinationPath $zipPath -CompressionLevel Optimal
```

後續可新增 `scripts/create-prechange-backup.ps1`，把這段流程工具化。

## 驗證

每次備份後至少確認：

- 壓縮檔存在。
- 檔名符合命名規則。
- 檔案大小大於 0。
- 壓縮檔位於 `backups/pre-change/`。

`scripts/check.ps1` 應檢查本規格存在、主規格有連結、備份資料夾存在，並至少有一份符合命名規則的下刀前備份。

## 失敗處理

若備份失敗：

- 停止本次下刀。
- 回報失敗原因。
- 不以「稍後再備份」作為繼續改動的理由。

## 與版本控制的關係

若專案有 Git，仍應使用 Git 追蹤細節；壓縮備份則提供給不熟 Git 的協作者作為可見、可保存的安全快照。兩者互補，不互相取代。
