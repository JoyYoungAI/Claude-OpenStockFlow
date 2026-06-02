# 協作規則

## 工作方式

- 開始修改前，先讀 `CODEX_PROJECT_GUIDE.md` 和相關文件。
- 優先維持現有架構和命名風格。
- 每次修改都盡量保持小範圍、可驗證。
- 不還原使用者既有改動，除非使用者明確要求。

## 完成標準

每個任務完成時，至少要能回答：

- 改了什麼？
- 為什麼這樣改？
- 怎麼驗證？
- 還有什麼沒驗證或需要注意？

## 檢查

一般修改後執行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\check.ps1
```

如果檢查失敗，先修正失敗原因，再回報結果。
