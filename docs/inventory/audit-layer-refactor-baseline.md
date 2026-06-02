# Audit layer refactor baseline

## audit-refactor-goal

Keep audit behavior stable while moving audit presentation and export helpers out of `app.js`.

This refactor must not change audit storage, audit event timing, actor fields, backup retention, report visibility, or CSV column meaning.

## audit-refactor-boundary

Move these responsibilities into the audit layer:

- Audit filter option collection.
- Sensitive read event payload creation.
- Audit CSV row formatting.
- Audit action, result, and risk labels.
- Audit action, result, and risk badges.

Keep these responsibilities in `app.js`:

- Calling `store.recordAuditEvent`.
- Adding current user, employee, department, and role context.
- Deciding whether an event should immediately persist.
- Rendering the audit table shell and wiring audit UI events.

## audit-refactor-compatibility

The audit layer must support the existing global script style used by the inventory system.

The audit layer must expose a browser global and a CommonJS export so local checks can continue to load files with Node.

## audit-refactor-validation

Required validation after the refactor:

- JavaScript syntax checks for inventory system files.
- Inventory store tests.
- Full `scripts/check.ps1`.

Browser validation remains optional in this environment because the in-app Browser sandbox is currently unavailable.
