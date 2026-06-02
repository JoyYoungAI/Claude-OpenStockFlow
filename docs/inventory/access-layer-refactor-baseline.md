# Access layer refactor baseline

## access-refactor-goal

Keep behavior stable while moving permission policy out of the main app file.

This refactor is intentionally structural. It must not change visible workflows, role labels, module visibility, field masking, document lifecycle rules, audit behavior, backup behavior, or localStorage data shape.

## access-refactor-boundary

Move these responsibilities into the access layer:

- Role definitions.
- Operation permission matrix.
- Module permission matrix.
- Field permission matrix.
- `canPerform(action, context)`.
- Department and supervisor scope checks.
- Permission denial wording helpers.
- Role label helpers.

Keep these responsibilities in `app.js`:

- Current employee loading and saving.
- UI event binding.
- Rendering tabs, tables, forms, and disabled buttons.
- Recording audit events after permission checks.
- Calling store methods.

## access-refactor-compatibility

The access layer must support the existing global script style used by the inventory system.

The access layer must expose a browser global and a CommonJS export so local checks can continue to load files with Node.

## access-refactor-validation

Required validation after the refactor:

- JavaScript syntax checks for inventory system files.
- Inventory store tests.
- Full `scripts/check.ps1`.

Browser validation remains optional in this environment because the in-app Browser sandbox is currently unavailable.
