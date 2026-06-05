# OpenStockFlow ESM Migration Worklog

Authors: Codex. Historical notes mention prior Claude read-only reviews; the Claude hook was retired on 2026-06-04.

## 2026-06-03

- Confirmed `claude_code` MCP is reachable, but its agent interface currently reports no available agent type. Use Claude Code MCP only for read-only file inspection and dependency review until that changes.
- Fixed the current store test blocker before starting ESM work: `reportSummary()` used legacy return field `unitAmount`, while current return rows normalize to `unitPrice`.
- Added an explicit return-summary regression check for June 2026 sales return revenue, purchase return cost, and gross profit.
- Verified `unitAmount` remains only as backward-compatibility fallback in model/storage migration paths.
- Current migration stance: keep no-build ESM small and strict; stabilize domain/store/report/access/storage before changing UI `app*.js` or replacing the sequential loader.
- Started the first no-build ESM cut with `esm/inventoryUtils.mjs`, keeping the existing IIFE/CJS `inventoryUtils.js` untouched.
- Added `inventoryEsm.test.mjs` to compare ESM utility outputs with the current CommonJS exports.
- Verified the old loader is untouched: `index.html` has no `type="module"` or `esm/` reference yet.
- Tests run: `node inventoryStore.test.js`; `node inventoryEsm.test.mjs`.

## 2026-06-04

- Continued from the worklog as handoff source.
- Added the second no-build ESM parity cut with `esm/inventoryModelsMaster.mjs`.
- `esm/inventoryModelsMaster.mjs` imports only from `esm/inventoryUtils.mjs` and does not write globals or touch browser loader state.
- Expanded `inventoryEsm.test.mjs` to compare selected master model normalizers/copy helpers/same predicates with the existing CommonJS `inventoryModelsMaster.js`.
- Claude Code MCP read-only scan confirmed `index.html` still has no `type="module"` or `esm/` reference.
- Tests run: `node inventoryEsm.test.mjs`; `node inventoryStore.test.js`.
- Added the third no-build ESM parity cut with `esm/inventoryModelsFinance.mjs`.
- `esm/inventoryModelsFinance.mjs` imports only from `esm/inventoryUtils.mjs` and keeps receivable/payable/payment normalizers side-effect free.
- Expanded `inventoryEsm.test.mjs` with finance parity checks for receivable, payable, payment, finance status, voided status preservation, and invalid input rejection.
- Claude Code MCP read-only scan again confirmed `index.html` still has no `type="module"` or `esm/` reference.
- Tests run after finance cut: `node inventoryEsm.test.mjs`; `node inventoryStore.test.js`.
- Added the fourth no-build ESM parity cut with `esm/inventoryModels.mjs`.
- `esm/inventoryModels.mjs` imports from `esm/inventoryUtils.mjs`, `esm/inventoryModelsMaster.mjs`, and `esm/inventoryModelsFinance.mjs`; the existing IIFE/CJS `inventoryModels.js` remains untouched.
- Expanded `inventoryEsm.test.mjs` with combined model parity checks for purchase, sale, adjustment, transfer, return, preferences, default warehouse, and document status/list helpers.
- Added the fifth no-build ESM parity cut with `esm/inventoryReports.mjs`.
- `esm/inventoryReports.mjs` imports `normalizeText`, `copyProduct`, and `copyWarehouse` from the ESM model stack, and keeps report calculation side-effect free.
- Expanded `inventoryEsm.test.mjs` with reports parity checks for inventory report, dashboard, gross profit ranking, warehouse/product summaries, transfer summary, report summary, stock movements, export rows, and stockForProduct.
- Tests run after reports cut: `node inventoryEsm.test.mjs`; `node inventoryStore.test.js`.
- On this laptop/session, Codex initially had no Claude Code MCP tool loaded. Added a Codex MCP config entry for local Claude Code via `claude mcp serve`, but the current Codex session did not hot-load the new tool.
- Claude CLI is installed at `C:\Users\baiyu\.local\bin\claude.exe`; `claude auth status` reports a logged-in Pro account, but non-interactive Claude review returned `401 Invalid authentication credentials`. A visible `claude auth login` window was opened so the user can refresh credentials before real Claude collaboration resumes.
- After refreshed Claude login, a non-interactive read-only Claude review succeeded. Claude found no blocking issue in the current ESM migration, flagged `inventoryStoreMaster` as a different risk class because it uses `createMasterModule(ctx)` with mutable state accessors, and recommended building a shared fake-ctx parity test sequence before cutting the ESM module.
- Added the sixth no-build ESM parity cut with `esm/inventoryStoreMaster.mjs`.
- `esm/inventoryStoreMaster.mjs` imports from the ESM model stack and preserves the store-master-local product normalizer/copy helper instead of replacing it with model exports.
- Expanded `inventoryEsm.test.mjs` with a fake `ctx` parity harness that runs the same master-data operation sequence against CJS `createMasterModule` and ESM `createMasterModule`, then deep-compares outputs and final state.
- Tests run after store master cut: `node inventoryEsm.test.mjs`; `node inventoryStore.test.js`.
- Added `esmTestHelpers.mjs` as the first ESM test slimming cut.
- Moved the store master fake-ctx parity harness out of `inventoryEsm.test.mjs`; the main smoke test now keeps the scenario call while helper code owns the mutable ctx setup.
- Added the seventh no-build ESM parity cut with `esm/inventoryStoreFinance.mjs`.
- `esm/inventoryStoreFinance.mjs` imports finance model helpers from `esm/inventoryModels.mjs` and preserves finance module state-accessor behavior.
- Expanded `esmTestHelpers.mjs` with a finance fake-ctx parity scenario covering receivable/payable/payment creation, invalid direction, payment exceeding balance, direct payment application, list filters, summaries, return reductions, voiding linked finance rows, and blocked payment to voided targets.
- Tests run after finance store cut: `node inventoryEsm.test.mjs`; `node inventoryStore.test.js`.
- Added the eighth no-build ESM parity cut with `esm/inventoryStoreTransactions.mjs`.
- `esm/inventoryStoreTransactions.mjs` imports transaction model helpers from `esm/inventoryModels.mjs` and preserves the transaction-module-local utility functions, order numbering, cost-layer logic, workflow transitions, returns, void reversal, stock count, and transfer behavior.
- Expanded `esmTestHelpers.mjs` with a transactions fake-ctx parity scenario covering purchase/sale creation, linked finance effects, insufficient stock, draft purchase workflow confirmation, owner reassignment, returns, adjustment/count, transfer, voiding, void reversal, list filters, and cost layers.
- The transactions parity helper scrubs volatile generated timestamps such as cost layer `createdAt`, cost basis `capturedAt`, and void `voidedAt` before comparing CJS and ESM results.
- Tests run after transactions store cut: `node inventoryEsm.test.mjs`; `node inventoryStore.test.js`.
- Historical note: a local Claude collaboration hook was added here, but it was later retired in `C5`; do not use or recreate it unless the user explicitly asks.
- Historical hook smoke test logged cost `$0.032917` and 7,568 total tokens before retirement.
- Added the ninth no-build ESM parity cut with `esm/inventoryStore.mjs`.
- `esm/inventoryStore.mjs` wires the ESM master, finance, and transactions store submodules together with the same state-accessor shell pattern as `inventoryStore.js`, and keeps browser loader state untouched.
- Expanded `esmTestHelpers.mjs` with a combined store public-API parity scenario covering master data, preferences, purchase/sale orders, linked finance, payments, returns, stock count, transfer, audit logs, void reversal, reports, movements, export rows, and snapshot output.
- Tests run after combined store cut: `node inventoryEsm.test.mjs`; `node inventoryStore.test.js`.
- Added `CUTS.md` as the short codenamed work tracker so future handoff can reference `M`, `S`, `L`, and `C` cuts without creating another "next step" thread.
- Completed `S1` app slimming cut with `appFormatters.js`.
- `appFormatters.js` now owns shared UI formatting, CSV, and escaping helpers: money/quantity/count/number/percent/date formatting, date parsing, inventory CSV shaping, CSV download/cell escaping, and HTML/attribute escaping.
- `app.js` keeps `downloadJson()` because it delegates to `backupControl` instead of behaving like a formatter/helper.
- Updated the sequential `index.html` loader to load `appFormatters` after `appSeedData` and before the app UI modules.
- `app.js` dropped from 1045 lines to 979 lines; `appFormatters.js` is 84 lines.
- Checks run after `S1`: `node --check appFormatters.js`; `node --check app.js`; `node --check appMaster.js`; `node --check appPurchases.js`; `node --check appSales.js`; `node --check appAdjustments.js`; `node --check appFinance.js`; `node --check appReports.js`; `node inventoryEsm.test.mjs`; `node inventoryStore.test.js`.
- Browser plugin verification could not complete in this session because the in-app browser control runtime exited during startup. Headless Edge launched with exit code 0 but did not emit DOM output with `--dump-dom`, so it was not counted as a full browser UI verification.
- Completed `S2` app slimming cut with `appTextBaseline.js`.
- `appTextBaseline.js` now owns `applyTextBaseline()`, static heading/report/card/table/select text setup, field labels, and placeholder baseline updates. `currentLanguage()`, `t()`, `confirmAction()`, and `interpolate()` remain in `app.js` because they are app-wide services, not baseline-only helpers.
- Completed `S3` app slimming cut with `appDocumentUi.js`.
- `appDocumentUi.js` now owns document/status rendering helpers: active/status badges, void metadata/detail panel, return metadata, document responsibility text, return/workflow/reassign/void/reversal buttons, and approval action labels/titles. Form collection and product/warehouse display helpers remain in `app.js`.
- Completed `S4` CSS organization cut without changing any CSS class names. Added a compact section index at the top of `styles.css` and moved the existing `.text-danger` rule from the file tail into the state styles area.
- `app.js` dropped from 1045 lines before S1 to 606 lines after S3. New UI helper files: `appFormatters.js` 84 lines, `appTextBaseline.js` 242 lines, `appDocumentUi.js` 129 lines.
- Checks run after `S2-S4`: `node --check appFormatters.js`; `node --check appTextBaseline.js`; `node --check appDocumentUi.js`; `node --check app.js`; `node --check appMaster.js`; `node --check appPurchases.js`; `node --check appSales.js`; `node --check appAdjustments.js`; `node --check appFinance.js`; `node --check appReports.js`; `node inventoryEsm.test.mjs`; `node inventoryStore.test.js`.
- In-app Browser verification still could not complete because the browser control runtime exited during startup with the same local Windows sandbox setup error. A headless Edge screenshot fallback also did not create an output file, so full browser UI verification remains outstanding.
- Completed `L1` folder layout plan and `L2` runtime JS file move.
- Runtime classic-script files now live under `core/`, `services/`, `ui/`, and `app/`; `esm/` remains unchanged and is still not loaded by the browser.
- Updated `index.html` sequential loader entries to folder-prefixed paths while keeping the same dependency order and the same `./${file}.js?v=${V}` loading mechanism.
- Updated CommonJS test references in `inventoryStore.test.js` and `inventoryEsm.test.mjs` to point at the moved CJS files.
- Appended a current runtime layout note to `README.md`, `AGENTS.md`, and `CLAUDE.md`; the older flat-layout sections still exist above it, but the dated 2026-06-04 note is now the authoritative quick map.
- Checks run after `L2`: `node --check` for all 28 runtime JS files under `app/`, `core/`, `services/`, and `ui/`; `node inventoryEsm.test.mjs`; `node inventoryStore.test.js`.
- Completed `C4` Claude read-only layout review before hook retirement. Claude reported no runtime blockers for loader order, CJS/ESM paths, or GitHub Pages static hosting. Logged usage: cost `$0.419055`, total tokens `174,999`.
- Completed `M10` as a strategy decision rather than a browser runtime cut: keep the browser on the classic sequential script loader because project rules still prohibit browser `import/export` modules. The no-build ESM parity files remain test-only until that rule changes.
- Completed `C5` Claude hook retirement at the user's request.
- Deleted `claudeCollabHook.mjs`, removed local `.claude-collab/` usage/dashboard artifacts, and removed the `.claude-collab/**` ignore rule because the hook workflow is no longer active.
- Current collaboration stance: Codex-only by default. Do not run Claude CLI/MCP or recreate a Claude hook unless the user explicitly asks for it again.
- Completed `V1-V4` final verification/hardening series.
- Added `LAYOUT.md` as the clean current folder/loader/test map for human handoff, avoiding edits to older mojibake-prone historical layout sections.
- Verified `LAYOUT.md` is visible to git via the `.gitignore` whitelist.
- Checks run after `V2`: loader file existence check (`28` files, `0` missing); `node --check` for all `28` runtime JS files under `app/`, `core/`, `services/`, and `ui/`; `node --check inventoryStore.test.js`; `node --check esmTestHelpers.mjs`; `node inventoryEsm.test.mjs`; `node inventoryStore.test.js`.
- Completed `V4` browser smoke verification with `browserSmokeCheck.mjs`.
- Headless Edge still could not expose a stable DevTools WebSocket in this local Windows environment, but visible Edge with a temporary profile and DevTools port `9888` succeeded.
- Browser smoke result: `ok: true`; page title `OpenStockFlow 進銷存系統`; ready state `complete`; `28` loader scripts; last script `./app/app.js?v=1.17.2`; app version `v1.17.2`; overview tab active; metric products `3`; required globals present; bad console/runtime event count `0`.

## Dependency Graph Draft

```text
inventoryUtils
  -> inventoryModelsMaster
  -> inventoryModelsFinance
  -> inventoryModels
       -> inventoryReports
       -> inventoryStore
            -> inventoryStoreMaster
            -> inventoryStoreFinance
            -> inventoryStoreTransactions

inventoryI18n
  -> inventoryMessages
  -> inventoryRenderers

inventoryAccess, inventoryAudit, inventoryBackup, inventoryStorage
  -> app.js orchestration

appSeedData
  -> app.js

appMaster, appPurchases, appSales, appAdjustments, appFinance, appReports
  -> app.js global functions and shared DOM state
```

Current state: `M1-M10`, `S1-S4`, `L1-L2`, `C1-C5`, and `V1-V4` are complete. Browser runtime stays on the classic sequential script loader; ESM parity modules remain test-only. Claude hook workflow is retired.

Next intended step: no active cut. Name the next scope before starting new work.

## Handoff Rules

- Codex may edit and run verification.
- Claude Code MCP/CLI is retired from the normal workflow. Do not run Claude or recreate a Claude hook unless the user explicitly asks for it again.
- Before long context or token pressure, append the current state, changed files, tests run, and next intended step here.
- Do not introduce npm, bundlers, or broad UI rewrites for this migration.
