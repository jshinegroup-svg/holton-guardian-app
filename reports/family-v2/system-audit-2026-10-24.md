# HOLTON V2 practical-use audit — 2026-10-24

Request: Telegram 23354; test realistic use, reproduce faults, fix autonomously.
Environment: authoritative V2 checkout; local Expo web export; desktop Chrome with touch/mobile viewport simulation. Synthetic family/auth/cloud fixtures only. No real family progress, account password or PIN changed.

## Fixed
1. A stale tab could borrow another tab's newer local-cache revision and overwrite cloud progress. Each repository now retains its own observed revision; the stale write is rejected.
2. Revision conflicts had no exit other than repeated failing retries. Added explicit, cancellable “use latest cloud” flow. The rejected local pending snapshot is archived per operation before replacing local cache; no merge, cloud overwrite, or duplicate award. Offline/owner-mismatch recovery preserves the pending operation.
3. Family bootstrap reads could remain waiting and offered only refresh after failure. Reads now have bounded/aborted requests and an in-page retry.
4. Backup restore/reset response loss incorrectly promised that progress was unchanged, and did not immediately enter sync recovery. It now uses the same pending-operation retry flow; messages acknowledge uncertain outcome.
5. Reset omitted sound variant, reminder duration, sound/music volume, and last custom duration. Those preferences are preserved.
6. Backup copy now distinguishes a local exported file from a restore/reset that updates this child's shared cloud state.
7. The new conflict confirmation initially overlapped the sibling panel at 320px; reproduced by a real pointer click test and fixed with a bounded scrollable recovery panel.
8. Fixed source ESLint children-prop error. Existing warnings retained instead of unrelated refactoring.

## Verification matrix
- TypeScript and Expo web export: PASS.
- ESLint: source tree 0 errors / 17 warnings; existing package lint scope 0 errors / 57 warnings.
- Node logic tests: 22/22 PASS, including exact reward thresholds, elapsed/pause/wrap-up accounting, help limits, request timeout, PIN recovery/concurrency/cooldown, backup compatibility, repository retry/idempotency, stale-tab protection and conflict recovery failure.
- Additional model scripts: forest-first 45-step journey, guardian challenge debit/grant/reload/eligibility, atomic multi-wish checkout and stale-term guards: PASS.
- Existing browser suites: family/duo roster at 320/390/844/900; task outcomes; help/retry; custom 1–999 minutes; sound settings; PIN entry; tutorial; untimed rewards; sync geometry; anonymous public login.
- Added auth-flow-check.mjs: mocked signup verification, wrong/correct login, reset request validation, PKCE recovery and new-password validation. No real email sent.
- Added conflict-recovery-check.mjs: family load failure/retry, conflict/retry/cancel/confirm, pending archive, next task/reload and sibling preservation at 320/390. Screenshot320 inspected.
- Added commerce-backup-check.mjs: cart cancellation, atomic checkout + lost response, world-card exchange/daily lock/collection retention, weekly report, actual JSON download, corrupt backup rejection, restore confirmation/cancel, restore response-loss retry, reset cancel and explicit reset preserving audio settings, sibling isolation at 320/390.
- Production database read-only metadata inspection: RLS enabled on families, children, child_saves, child_operations, usage_events and app_admins; relevant definer RPCs have fixed empty search_path. No database migration or data mutation performed in this audit.

## Limits / not claimed
- This is bounded regression coverage, not proof of every possible state or a security certification.
- Physical iPhone/Android, actual Safari/WebKit, lock-screen/background suspension, incoming calls and audible speaker volume were not tested. Audio scheduling/recovery assertions use mocked media APIs.
- Real SMTP delivery, human account signup/reset mail, and fully authenticated production data round-trips were not executed. Auth fixtures verify client flows, not email delivery.
- Cross-device sync is not live collaboration; stop concurrent play on the same child. Conflicts are rejected and require explicit selection of cloud state. Conflict archives remain in the original browser and have no automatic merge/import UI.
- PIN remains per browser; if both PIN and recovery code are lost there is still no email-linked PIN recovery.
- Source lint warnings remain; native/TestFlight builds are outside the currently deployed web-app audit.

## Re-run
Run `npm run typecheck`, `npm run export:web`, the Node rules under `reports/family-v2`, then `node reports/family-v2/<suite>-check.mjs` from the repository root. Browser fixtures require this host's Chrome and Playwright installation. `TEST_BASE_URL` tests hosted assets while keeping auth/progress requests intercepted. Auth tests use only synthetic credentials and do not print them.

Release verification is recorded below after deployment.

## Released and verified
Source0833d6b deployed live via Render dep-dbe948rrjlhs73et74n0 (1m27s). Public AppEntry-d20ca5b9b411ecf56f9bf7312943db7a.js SHA256 7afa660b964480a8b6c613cd7ec4ca21aa82737dddd0cb90917fd83f7c1be1ad matches local export exactly. Hosted-assets/mock-cloud conflict and commerce/backup/reset suites PASS at320/390; anonymous public login PASS. URL: https://holton-family-v2.onrender.com/index.html?v=0833d6b-release . No real authenticated production mutations.
