# Backup layer refactor baseline

## backup-refactor-goal

Keep backup and restore behavior stable while moving backup file helpers out of `app.js`.

This refactor must not change backup JSON shape, restore validation rules, schema migration, audit recording, or restore authorization.

## backup-refactor-boundary

Move these responsibilities into the backup layer:

- JSON backup download helper.
- Backup file reading and JSON parsing.
- Backup validation result handling callbacks.
- Backup summary HTML rendering.
- Backup filename creation.

Keep these responsibilities in `app.js`:

- Permission checks for export and restore.
- Calling `storage.createStorageEnvelope`.
- Calling `storage.validateBackupEnvelope`.
- Assigning the pending restore state.
- Replacing the active store during restore.
- Audit recording and final state persistence.

## backup-refactor-compatibility

The backup layer must support the existing global script style used by the inventory system.

The backup layer must expose a browser global and a CommonJS export so local checks can continue to load files with Node.

## backup-refactor-validation

Required validation after the refactor:

- JavaScript syntax checks for inventory system files.
- Inventory store tests.
- Full `scripts/check.ps1`.

Browser validation remains optional in this environment because the in-app Browser sandbox is currently unavailable.
