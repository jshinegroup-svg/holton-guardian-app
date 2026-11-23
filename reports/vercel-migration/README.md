# Vercel migration preparation — 2026-11-23

Authorized by Jerry (Telegram 24761). Existing Supabase and family data remain unchanged. No paid plan enabled; do not remove Render site or device-local data.

- Added Expo static export Vercel configuration; existing nested guardian-home files are served directly.
- Removed all 40 background music files from automatic PREPARE; files remain available in deployment.
- Dedicated content-hash music cache survives app releases. Downloads only requested tracks, validates bytes, supports iOS ranges and suffix ranges. First request downloads the whole selected track before serving; large tracks may take time. Cache may be evicted by browser.
- Automatic core package now 571 files / approximately 139 MiB. Non-music preload remains.
- Typecheck/export and migration browser checks passed (no music in PREPARE, one network download, repeated and offline range reads).
- Pending: authenticated Vercel deployment and hosted checks, login/account/child-data continuity on the new origin. Local-only unsynced data cannot automatically cross origins. Do not claim migration complete.
- Includes previously committed homework batch confirmation 9d3f3d6.
