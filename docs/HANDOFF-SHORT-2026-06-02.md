# StockFlow short handoff - 2026-06-02

## Current State

- App version: `1.17.2`
- Asset version: `1.17.2`
- localStorage schemaVersion: `11`
- Main app: `apps/inventory-system/`
- Latest full validation: `scripts/check.ps1` ended with `All checks passed.`

## Important Runtime Note

The in-app Browser may fail in this Windows environment with:

```text
windows sandbox failed: spawn setup refresh
```

Primary validation should use:

- Bundled Node syntax checks.
- `apps\inventory-system\inventoryStore.test.js`.
- `scripts\check.ps1`.
- Static UI marker checks.
- Data migration and backup validation checks.

## Completed Today

- Completed `v1.17.1` version closure.
- Completed `v1.17.2` responsibility visibility polish.
- Added purchase/sale document ownership fields.
- Passed target document context into purchase/sale row action permission checks.
- Added scoped supervisor safety actions:
  - Supervisors can reject unconfirmed documents within their permitted scope.
  - Supervisors can use `改由我負責` on `draft`, `submitted`, and `approved` documents within their permitted scope.
- Kept confirmed documents protected:
  - No supervisor voiding.
  - No direct confirmed-document edits.
  - No stock or finance reversal expansion.
- Updated handoff, architecture, main inventory spec, work log, tests, and check guards.

## Current Best Next Step

Do not start a large feature immediately. Next work should start from one of these:

1. Manual UI verification for `v1.17.2` if Browser works; use `docs/inventory/manual-ui-checklist-v1.17.2.md`.
2. `v1.17.3`: safer draft document edit UI.
3. `v1.18.0` planning: pick one larger domain only after reviewing risk.

## Pre-change Backups From Today

- `backups/pre-change/stockflow-prechange-20260602-074619-document-ownership-permission-context.zip`
- `backups/pre-change/stockflow-prechange-20260602-083431-version-1-17-1-supervisor-safe-actions.zip`
- `backups/pre-change/stockflow-prechange-20260602-085814-morning-light-handoff-planning.zip`
- `backups/pre-change/stockflow-prechange-20260602-090734-version-1-17-2-responsibility-visibility.zip`

## Restore Prompt For A Fresh Thread

Project is StockFlow at `D:\Codex\StockFlow`. Read `docs/HANDOFF-SHORT-2026-06-02.md`, `docs/HANDOFF-2026-06-02.md`, `docs/work-log-2026-06-02.md`, `docs/inventory-system-spec.md`, and `scripts/check.ps1` first. User prefers Traditional Chinese, non-technical UI language, spec alignment before coding, and pre-change zip backup before major edits. Browser validation may fail with `windows sandbox failed: spawn setup refresh`; rely on bundled Node syntax checks, `inventoryStore.test.js`, `scripts/check.ps1`, data checks, and static UI checks.
