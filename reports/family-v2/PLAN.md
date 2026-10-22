# HOLTON family V2 implementation contract

Baseline: v1.0-single-20261022 / 3ef0898. Worktree: /Users/user/holton-family-v2.
V1 production remains untouched. No V2 code is deployed.

## Agreed scope
Family account, persistent login, parent PIN, child nickname/age, private independent progress, cloud save, basic analytics, solo and same-phone duo UI. No 3+ overview. Latest user said dual-device; clarification pending before implementing device/session/UI topology.

## Foundation
Dedicated Supabase project (organization selection pending); never mutate classroom project's schema.
Family owner authentication with RLS isolation. Child saves use optimistic revisions plus operation idempotency; event insertion and save share one transaction. Conflicts must prompt reload, not silently overwrite another device. A completed task event can only be inserted once.
Current JSON state payload is an owner-authorized save, NOT a tamper-proof rewards economy. Competitive/paid rewards are out of scope.

## Planned integration
1. Account shell: register/login/logout/reset, persisted refresh session, explicit cloud configuration status.
2. Child profile picker: nickname/age; family-scoped parent lock and child-scoped tutorials/storage.
3. Extract LightApp state storage from singleton into per-child repository. Preserve existing catalog, task rules, rewards and backup parser.
4. Duo view (pending clarification): independent task engines, one shared music owner, per-child settlement and full individual collection view.
5. Cloud upload: durable local pending save, retry same operation ID, conflict handling; no saved badge before server acknowledgment.
6. V1 import: explicit file + target child, keep original export; do not read or mutate V1 keys implicitly. Never overwrite existing cloud progress automatically.
7. Basic family analytics and owner-only administration, aggregated age cohorts; no global analytics accessible to ordinary family users.

## Acceptance checks
Two accounts cannot read/write each other's children/saves/events. Child A completion does not change B. Concurrent saves conflict safely; lost-response retry does not issue another reward/event. Refresh/logout/login preserves uploaded data. Offline changes clearly marked pending. Invalid import preserves existing data. V1 regression still passes and production origin untouched. Phone 320/390 and tablet layouts, music ownership, PIN gate, age-at-event, analytics denominators verified.

## Remaining infrastructure
Supabase dedicated project + auth redirect/email configuration, separate V2 preview hosting and protected configuration. Production secrets never in repository/chat. A 30-day inactivity policy is a proposed UX goal, not yet verified provider configuration or an implemented guarantee.

## Checkpoint 2026-10-22
TypeScript full typecheck PASS. Repository regression 5/5 PASS (sibling/V1 isolation, lost-response idempotency, stale-save conflict, owner mismatch, profile validation). SQL migration is prepared but NOT applied or database-tested; no available local Postgres runtime. No auth UI/duo UI integrated yet. npm ci succeeded; Supabase SDK install failed ENOSPC. Removed only newly generated V2 node_modules to recover space, leaving source, V1 and all backups intact. Dependency setup must be restored after disk capacity is resolved.
