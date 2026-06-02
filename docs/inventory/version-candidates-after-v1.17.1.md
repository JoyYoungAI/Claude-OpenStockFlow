# Version candidates after v1.17.1

This planning note records possible next slices after `v1.17.1`. It is not a commitment to implement all items.

## Recommended Near-term Path

Stay in `v1.17.x` until the formal-operation baseline feels stable in the UI. The next slice should be small, visible, and reversible.

## v1.17.2 Candidate: Responsibility Visibility Polish

Goal:

- Make document responsibility easier to inspect without expanding lifecycle risk.

Candidate scope:

- Show a non-intrusive responsibility label on purchase and sale rows.
- Show owner employee and owner department in document detail or row metadata.
- Keep `改由我負責` limited to `draft`, `submitted`, and `approved`.
- Keep confirmed documents protected.
- Add static UI checks for ownership text and disabled reasons.

Do not include:

- Full line-item editing.
- Confirmed-document edits.
- Supervisor voiding.
- Stock or finance reversal changes.

## v1.17.3 Candidate: Draft Document Edit Safety

Goal:

- Allow carefully scoped corrections before documents become effective.

Candidate scope:

- Edit draft purchase and sale document headers.
- Edit draft ownership fields.
- Audit before/after summaries.
- Keep submitted documents requiring reject before editing.
- Keep confirmed documents protected.

Do not include:

- Editing confirmed quantities, cost, price, warehouse, receivable, payable, or payment impact.
- Retrospective cost recalculation.

## v1.18.0 Candidate Options

Pick only one larger domain for `v1.18.0`.

### Option A: Transfer Lifecycle

Why:

- `v1.15.x` added transfer core, UI, and reports.
- Transfer void/reversal is still a natural gap.

Scope:

- Transfer status and void request.
- Reversal transfer event.
- Report display for original and reversal transfer links.

Risk:

- Inventory impact must remain balanced across warehouses.

### Option B: Finance Reversal And Settlement Safety

Why:

- `v1.16.x` added receivable, payable, and payments.
- Reversal and settlement rules are the next operational gap.

Scope:

- Payment reversal.
- Receivable/payable adjustment notes.
- Better settlement history.

Risk:

- Cashflow and balance reports must not silently drift.

### Option C: Cloud-sync Preparation

Why:

- The app is still browser-local.
- Future multi-user use needs server-side ownership, audit, and conflict rules.

Scope:

- Draft server contract notes.
- Local conflict simulation.
- Import/export mapping for departments, employees, scopes, and ownership.

Risk:

- Too much architecture too early can slow down operational UI stabilization.

## Current Recommendation

Choose `v1.17.2 Responsibility Visibility Polish` first. It reinforces the work already completed in `v1.17.1`, gives manual testers something concrete to verify, and avoids opening confirmed-document lifecycle risk.
