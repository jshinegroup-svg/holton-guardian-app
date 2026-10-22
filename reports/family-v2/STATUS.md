# Family V2 checkpoint — 2026-10-22

## Location and scope
Authoritative V2 checkout: `/Volumes/HOLTON-Dev/holton-family-v2` (standalone clone).
Image backing file: `/Volumes/Jerry 2026/HOLTON/HOLTON-Dev.sparsebundle` (APFS, grows as used, max40GB).
External SSD is ExFAT; it was NOT reformatted. Existing files untouched. Old internal V2 worktree remains a historical checkpoint; do not develop/deploy it accidentally.
Branch: feat/family-duo-v2. V1 tag/production unchanged.
Confirmed: one phone, two children; no simultaneous multi-device UI or 3+ overview.

## Implemented
Supabase email/password session shell, registration/verification prompt, password reset UI, family-scoped parent PIN, child nickname and age creation/editing, selecting one or two players.
Child-scoped saves and tutorial keys; V1 singleton is never implicitly imported.
Duo independent task panels, expand individual game and return without stopping sibling task, one music owner. Personal collection/shop and V1 explicit backup/import retained. V2 task metadata omitted from portable V1 export.
Cloud revision conflict prevention, durable pending write and same-operation retry. Pending writes require reload/retry before more mutations (not a full offline mode).
Event capture: visits, task start/completion, time-card/guardian selections, estimated interaction time. Age stored at event ingestion. Family statistics, age cohorts, task completion cohort rates, return visits and card usage summary. Global summary requires explicit app_admins membership; no admin has been provisioned yet.

## Infrastructure
Supabase project hzihwjpjcbsuqipaeeit, holton-family-v2, Tokyo; org mgddmebhajjkcvlxpzzx, user-approved US$0/month quote. Both SQL migrations applied. Public publishable key only in client, no privileged credentials.
Render separate static preview setup in progress; V1 server untouched.

## Verification
Full TypeScript typecheck PASS; Expo web export PASS.
Repository unit regressions 5/5 PASS (prior foundation).
Actual database transactions, rolled-back synthetic fixtures: own-family reads only; cross-family writes rejected; retry idempotent; stale revision rejected; usage ingestion and own summary work; ordinary account denied global summary.
Chrome browser mock-cloud suite at320/390/900 PASS: two independent timers, sibling balances unchanged, one completion event, expand/back, reload, V1 sentinel unchanged, no horizontal overflow or JS errors. Screenshot390 visually reviewed.
Browser test session/network fixtures are local test harness only, NOT an app auth bypass.
Real email delivery, actual human signup/login, hosted authenticated end-to-end and physical iPhone checks are NOT verified yet.

## Remaining gates
Supabase dashboard login by owner required for auth site/redirect URLs and email configuration; connector cannot manage these settings. Default built-in email restrictions may prevent invited outside families registering until SMTP is configured. Never collect credentials in chat.
After owner registers and identity is confirmed, provision only the owner's auth UUID into app_admins. Global statistics are intentionally inaccessible until then.
Session persists/refreshes; previously proposed explicit30-day inactivity expiration is not yet enforced. Do not promise exact30-day expiry.
Full V1 live-data migration requires export from actual phone; no real child progress copied.

## Security advisory review
[RPC definer advisory](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable): intentional owner-checking RPC with fixed empty search_path; cross-family denial tested.
[No-policy advisory](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy): child_operations/app_admins are intentionally inaccessible directly to clients, only accessed by checked functions.
These are not proof of an independently audited or tamper-proof rewards system. JSON progress is owner-authorized.
