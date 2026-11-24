# Vercel migration preparation — 2026-11-23

Authorized by Jerry (Telegram 24761). Existing Supabase and family data remain unchanged. No paid plan enabled; do not remove Render site or device-local data.

- Added Expo static export Vercel configuration; existing nested guardian-home files are served directly.
- Removed all 40 background music files from automatic PREPARE; files remain available in deployment.
- Dedicated content-hash music cache survives app releases. Downloads only requested tracks, validates bytes, supports iOS ranges and suffix ranges. First request downloads the whole selected track before serving; large tracks may take time. Cache may be evicted by browser.
- Automatic core package now 571 files / approximately 139 MiB. Non-music preload remains.
- Typecheck/export and migration browser checks passed (no music in PREPARE, one network download, repeated and offline range reads).
- Deployed 2026-11-24: https://holton-family-v2.vercel.app/ (Jerry H Hobby). Hosted checks passed below. Real-user login/account/child-data continuity still requires the user's original family account on the new origin. Local-only unsynced data cannot automatically cross origins.
- Includes previously committed homework batch confirmation 9d3f3d6.

## Handoff
- Saved/pushed on isolated branch `feat/vercel-migration`; Render deploy branch untouched.
- Vercel GitHub sign-in reports an existing account for the same email and requires original email login then linking GitHub. No account created or paid plan enabled. User must complete original-account login directly at https://vercel.com/login (never share codes/passwords in chat).
- Batch reward model regression passed.
- Legacy standalone guardian offline-check timed out waiting for guardianFace.ready before exercising offline mode; not counted as a pass. Hosted/embedded guardian regression remains pending.

## 2026-11-24 deployment continuation
- Authenticated Vercel Jerry H Hobby account via host-owned cookie sync (no credentials extracted).
- Previous standalone offline timeout was caused by intentional top-level playhouse redirect. Updated test to embed iframe like production; offline playhouse passed.
- Batch UI regression passed 320x740 and 844x390.

## 2026-11-24 production result
- User authorization Telegram 24777. Production project https://vercel.com/jerry-h/holton-family-v2, project ID prj_dB9o55PEXrEcaqLGKffObSIrHF6e, status Ready.
- Direct static export uploaded using Vercel Drop, then claimed/transferred into Jerry H Hobby and renamed holton-family-v2. Added permanent Production domain https://holton-family-v2.vercel.app/; do not distribute temporary tmp.now address.
- Uploaded dist at runtime commit 4cf7a94 (subsequent commits only tests/reports), exact hosted manifest/SW/house/song equality verified. Drop config retains headers but omits buildCommand/outputDirectory for prebuilt files. Repository vercel.json retains normal build settings for future Git integration.
- Supabase unchanged. Updated authentication Site URL to new origin; added new origin and /** redirect allowlist while retaining original Render entry. No database record/schema changes, no real family test writes, no paid upgrade.
- Hosted tests passed: homework-batch/ui-check.mjs (320/844; synthetic Supabase); home-play/ui-check.mjs (390/844; synthetic Supabase, earned entry, pause/resume, warning, expiration/return, reentry lock, child isolation, PIN escape); vercel-migration/live-check.mjs (public login, deployed artifact equality, 40 songs, selected-song range and offline/suffix replay).
- Local current home-play/UI and embedded offline tests passed. Older guardian-home-integration/check.mjs lacks earned playtime fixture, stops at time gate, and is not counted as a pass.
- GitHub account linked, but installing Vercel GitHub app requires human email verification. Automatic Git deployment NOT connected. Migration branches feat/vercel-migration and vercel-migration hold source; original Render branch/service untouched. Future updates: use direct deployment to this existing project or finish Git connection first; pushing migration branch alone does not deploy.
- User should log in with original family account and select existing child; do not create replacement family or clear old browser data. Actual family records and real iPhone playback remain user acceptance checks.
