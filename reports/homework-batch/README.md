# Batch homework review — 2026-11-23

User 24741 authorized select-many then one-PIN confirmation; no 30-second unlock window. Review list is readable before authentication, including child/date, reported status and task details. Select all/clear/single-task available. Existing ability for adults to verify unreported work retained and clearly labeled.

Exact selected snapshots captured before the PIN. One atomic revisioned save validates no selected task changed, was confirmed/waived/removed, or date claimed/future/timer active. Success clears selection and returns to map; every later action needs authentication. Cancel/background removes pending authorization. Existing draw receipts and home-play rules unchanged. Homework guide updated.

PASS: typecheck, web export, diff check; model tests for batch atomicity, stale snapshot, duplicate IDs, duplicate confirmations, waived/claimed/future/timer guards, draw credits and +2min/+10min/15min rules; local UI at320x740 and844x390 for batch/cancel/reauth/single/select-all/clear/sibling/reward/viewport. Screenshot visually inspected. Tests use synthetic family APIs only, no real progress changed.

Deployment BLOCKED: Render service srv-dbcqjvgm7kps73ck4rng explicitly shows Workspace suspended, free5GB bandwidth exhausted, last live b7f5b8f. Production GET returned503 Service Suspended. Account owner must resolve billing/usage before deploy. No billing changes attempted. This release is not live and hosted regression has not run.
