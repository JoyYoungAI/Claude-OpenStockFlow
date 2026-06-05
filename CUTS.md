# OpenStockFlow Cuts

Purpose: keep the next work items small, named, and easy to hand off.

Rule: use the code in discussion and commits. Do not invent a new "next step" name when an existing code fits.

## Current Pointer

- Last done: `V4` browser smoke test.
- Next: no active cut.
- Later: start a new code only when the next scope is named.

## Codes

| Code | Area | Status | Meaning |
| --- | --- | --- | --- |
| `M1` | ESM | Done | `esm/inventoryUtils.mjs` parity cut |
| `M2` | ESM | Done | `esm/inventoryModelsMaster.mjs` parity cut |
| `M3` | ESM | Done | `esm/inventoryModelsFinance.mjs` parity cut |
| `M4` | ESM | Done | `esm/inventoryModels.mjs` combined model parity cut |
| `M5` | ESM | Done | `esm/inventoryReports.mjs` parity cut |
| `M6` | ESM | Done | `esm/inventoryStoreMaster.mjs` parity cut |
| `M7` | ESM | Done | `esm/inventoryStoreFinance.mjs` parity cut |
| `M8` | ESM | Done | `esm/inventoryStoreTransactions.mjs` parity cut |
| `M9` | ESM | Done | `esm/inventoryStore.mjs` combined store parity cut |
| `M10` | ESM | Done | Keep browser on classic script loader; ESM parity remains test-only for now |
| `S1` | Slimming | Done | Extract low-risk shared formatters/helpers to `appFormatters.js` |
| `S2` | Slimming | Done | Extract static text baseline handling to `appTextBaseline.js` |
| `S3` | Slimming | Done | Extract access/workflow document UI helpers to `appDocumentUi.js` |
| `S4` | Slimming | Done | Organize CSS comments and state styles without class renames |
| `L1` | Layout | Done | Plan folder layout for human handoff |
| `L2` | Layout | Done | Move runtime JS into `core/`, `services/`, `ui/`, and `app/` |
| `C1` | Collaboration | Done | Claude CLI/MCP setup on this laptop |
| `C2` | Collaboration | Retired | Claude usage hook removed from the repo |
| `C3` | Collaboration | Retired | Local Claude usage dashboard artifacts removed |
| `C4` | Collaboration | Retired | Claude read-only review hook no longer used |
| `C5` | Collaboration | Done | Retire Claude hook and keep Codex-only workflow current |
| `V1` | Verification | Done | Add current layout guide for human handoff |
| `V2` | Verification | Done | Re-run loader, syntax, path, and test hardening checks |
| `V3` | Verification | Done | Record final verification state and remaining browser limitation |
| `V4` | Verification | Done | Add and run Edge browser smoke test |

## Update Rules

- Move only one pointer at a time.
- Mark a cut `Done` only after relevant tests/checks pass.
- Keep detailed implementation notes in `ESM_MIGRATION_WORKLOG.md`.
- Keep this file short; if it starts becoming a universe, split details back into the worklog.
