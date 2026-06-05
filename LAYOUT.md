# Claude-OpenStockFlow Layout

Updated: 2026-06-04

This repo is still a pure static browser app. There is no npm, no package.json, no bundler, no browser `import/export`, and no runtime `fetch`.

## Runtime Entry

- `index.html` loads every runtime script through the sequential loader at the bottom of the file.
- `styles.css` remains at the repository root.
- Browser runtime uses classic `<script>` files only.
- `esm/` files are parity modules for tests and future migration only; the browser loader does not load them.

## Folders

| Folder | Purpose |
| --- | --- |
| `core/` | Data utilities, models, reports, store modules, storage |
| `services/` | Access control, audit trail, backup/restore service |
| `ui/` | I18n, UI messages, report renderers, master-data UI widgets |
| `app/` | App event handlers, shared app UI helpers, seed data, final app bootstrap |
| `esm/` | No-build ESM parity modules, test-only for now |

## Loader Order

```text
core/inventoryUtils
core/inventoryModelsMaster
core/inventoryModelsFinance
core/inventoryModels
ui/inventoryI18n
services/inventoryAccess
services/inventoryAudit
services/inventoryBackup
core/inventoryReports
ui/inventoryMasterDataUi
core/inventoryStoreMaster
core/inventoryStoreFinance
core/inventoryStoreTransactions
core/inventoryStore
core/inventoryStorage
ui/inventoryRenderers
ui/inventoryMessages
app/appSeedData
app/appFormatters
app/appTextBaseline
app/appDocumentUi
app/appMaster
app/appPurchases
app/appSales
app/appAdjustments
app/appFinance
app/appReports
app/app
```

## Tests

Run tests from the repository root:

```bash
node inventoryStore.test.js
node inventoryEsm.test.mjs
node browserSmokeCheck.mjs
```

The store test uses the CommonJS files under `core/` and `services/`. The ESM parity test compares `esm/` modules against the moved CommonJS modules.

`browserSmokeCheck.mjs` launches a temporary Edge profile in headless mode by default. If headless Edge cannot expose DevTools on a machine, start Edge manually with a temporary profile and run:

```powershell
$env:SMOKE_EDGE_EXISTING='1'
$env:SMOKE_EDGE_PORT='9888'
node browserSmokeCheck.mjs
```
