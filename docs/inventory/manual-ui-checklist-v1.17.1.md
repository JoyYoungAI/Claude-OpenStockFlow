# StockFlow v1.17.1 manual UI checklist

Use this checklist when Browser or a real browser is available. This is a manual verification aid only; do not treat it as a spec change.

## Setup

- Open `apps/inventory-system/index.html`.
- Confirm the header shows `v1.17.1`.
- If testing from old browser data, export a full JSON backup first.
- Click `重設範例資料` only when it is safe to replace current local data.

## Header And Access

- Confirm the local employee selector is visible.
- Select `小明` and confirm the role shows sales behavior.
- Select `大頭` and confirm the role remains sales but supervisor-scoped actions appear only on sales documents in the sales department.
- Select `採購主管` and confirm supervisor-scoped actions appear only on purchase documents in the purchasing department.
- Select `稽核同事` and confirm write actions remain visible but disabled with clear reasons.

## Purchase Documents

- Open `3 採購進貨`.
- Save a purchase order as draft.
- Confirm the row shows `送審` and, for scoped purchasing supervisor, `改由我負責` when the document is not already owned by that supervisor.
- Submit the draft.
- As purchasing supervisor, reject the submitted document and confirm a reason is required.
- Confirm rejected documents do not affect stock or payable totals.
- Confirm confirmed purchase documents do not show `改由我負責`.
- Confirm `作廢` remains restricted to owner.

## Sales Documents

- Open `4 銷售出貨`.
- Save a sale order as draft.
- Confirm the row shows `送審` and, for scoped sales supervisor, `改由我負責` when the document is not already owned by that supervisor.
- Submit the draft.
- As sales supervisor, reject the submitted document and confirm a reason is required.
- Confirm rejected documents do not affect stock or receivable totals.
- Confirm confirmed sales documents do not show `改由我負責`.
- Confirm `作廢` remains restricted to owner.

## Reports And Finance Sanity

- Open `6 庫存報表`.
- Confirm rejected or draft documents are not counted as effective stock movement.
- Confirm confirmed purchase and sale documents still appear in movement details.
- Open `E2 財務`.
- Confirm draft, submitted, approved, and rejected documents do not create receivables or payables.
- Confirm confirmed documents with receivable/payable options still create finance records.

## Backup And Restore

- Export a full JSON backup.
- Confirm the backup preview includes departments, employees, permission scopes, purchases, and sales.
- Restore the same backup.
- Confirm purchase and sale rows still keep their workflow status and row actions.

## Text And UI Quality

- Confirm disabled buttons explain why the action is unavailable.
- Confirm action labels use non-technical language.
- Confirm no visible mojibake appears in the header, buttons, forms, lists, reports, or backup preview.
- Confirm mobile width does not cause button text overlap in purchase and sales rows.

## Stop Conditions

Stop and log findings before coding if any of these appear:

- A supervisor can act on a confirmed document.
- A supervisor can act outside their department scope.
- A user can approve or reject their own document unexpectedly.
- Draft or rejected documents affect stock, receivables, or payables.
- Backup restore loses ownership, workflow status, or audit history.
