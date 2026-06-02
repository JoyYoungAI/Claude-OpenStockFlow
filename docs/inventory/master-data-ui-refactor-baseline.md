# Master data UI refactor baseline

## masterdata-ui-refactor-goal

Keep master data behavior stable while moving master data table and option rendering out of `app.js`.

This refactor must not change store behavior, form submission, edit flows, deactivate flows, permissions, audit events, backup data, or localStorage schema.

## masterdata-ui-refactor-boundary

Move these responsibilities into the master data UI layer:

- Product category option rendering.
- Department option rendering.
- Partner datalist rendering.
- Product category table rendering.
- Warehouse table rendering.
- Department table rendering.
- Employee table rendering.
- Partner table rendering.

Keep these responsibilities in `app.js`:

- Master data form submission.
- Edit state for product and partner forms.
- Deactivate click handlers.
- Permission checks.
- Audit recording.
- Shared badges and formatting helpers used outside master data.

## masterdata-ui-refactor-compatibility

The master data UI layer must support the existing global script style used by the inventory system.

The master data UI layer must expose a browser global and a CommonJS export so local checks can continue to load files with Node.

## masterdata-ui-refactor-validation

Required validation after the refactor:

- JavaScript syntax checks for inventory system files.
- Inventory store tests.
- Full `scripts/check.ps1`.

Browser validation remains optional in this environment because the in-app Browser sandbox is currently unavailable.
