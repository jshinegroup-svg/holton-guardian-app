# Friends trial and local parent PIN — 2026-10-21

Status: implementation and local checks only; NOT deployed. Current GitHub Pages remains unchanged.

## Included
- Server validates shared trial password before serving any exported HTML, JS, images or music. Only login HTML and `/healthz` are public.
- Protected host environment supplies password (minimum 12 characters); NEVER use EXPO_PUBLIC variables for credentials.
- Opaque random session cookie: HttpOnly, Secure on hosted HTTPS, SameSite=Strict, seven-day maximum. Sessions are in memory: restarts/redeploys/Render sleep require login again. Changing the trial password by redeploy invalidates all sessions.
- Per-connection-IP plus global login throttle; bounded request size, origin validation, hidden paths/traversal/symlink containment, no request-body/credential logging. Single-instance trial only, not commercial account infrastructure. Behind Render proxy the per-IP limit may group families; global limit intentionally bounds trial login load.
- First use requires local parent setup before gameplay; six-digit PIN entered twice, random recovery code shown once and acknowledged. Stored separately from game state, PBKDF2-SHA256/210000 iterations + random salt; no plaintext PIN or recovery code persisted.
- Every parent entry requires verification; modify PIN requires current PIN. Recovery replaces PIN and rotates recovery code without clearing game data. Five failures impose a persisted one-minute delay. This is a local child-deterrent lock, not a defense against browser developer-tools manipulation.
- Leaving parent settings, hiding tab, or two-minute inactivity closes settings. No persistent parent-unlocked session. Inactive task timer/progress unaffected.
- Parent PIN does not travel in game backups. New browser/device needs new setup. If both PIN and recovery code are lost, there is no automatic recovery in this version; do not clear all browser data. Support must first preserve game data.

## Verification
- `npm run typecheck`: PASS.
- root-base Expo export: PASS.
- `node reports/trial-lock/server-check.mjs`: PASS unauthorized index/assets/source denial; authenticated cookie/index; source/hidden path denial; wrong password and rate limit.
- `node reports/trial-lock/browser-check.mjs`: local isolated Chrome profile. PASS first setup; wrong/correct PIN; change; recovery rotation; persistence; no points loss; 320/768/1024/1366 widths; no plaintext credentials stored; retry delay. Background locking also checked. No real family storage used. Physical iPad not tested.
- Do not publish this branch into gh-pages: server protection cannot run there.

## Proposed deployment: Render Free Web Service
Official reference: https://render.com/docs/free (checked 2026-10-21).
Free tier sleeps after 15 minutes idle and can take about one minute to wake. Included runtime/bandwidth/build quotas apply; no promise of unlimited free service. 178 MB export includes music, so monitor bandwidth. Use only for friend trials; no automatic paid upgrade authorized.

1. Owner signs into https://dashboard.render.com/ using their own account; connect GitHub and select this feature branch. No account passwords/tokens sent in chat.
2. Create Node **Web Service**, not Static Site, free plan; build `npm ci && npm run export:web`, start `node server/trial-server.mjs`. `render.yaml` records the configuration, automatic deployment off.
3. In Render's protected environment editor enter `TRIAL_ACCESS_PASSWORD` (new shared trial secret), `PUBLIC_ORIGIN` (the assigned HTTPS origin, no trailing slash). Keep EXPO_PUBLIC_BASE_URL empty. No secrets committed to GitHub or provided in a command/URL. Platform dashboard is the safe external setup path; there is no authenticated Render connector available in this session.
4. Test new URL on clean browser: unauthenticated asset requests denied; login, local PIN setup, restore test backup, actual task completion and world-card flow, music playback, PIN relock, mobile/tablet layout. Verify cookies are Secure. No public new URL delivered until this passes.
5. Coordinate friends exporting old progress before migrating. Keep their original files. On new origin set parent PIN, then use existing Parent → Backup to restore. Compare points, collections and task state.
6. After backup migration is confirmed, retire old public gameplay endpoint. Repository is currently PUBLIC: access-gating a hosted site does not hide publicly downloadable source/assets. Decide whether to make repository private or move deployment/source into a private repo before claiming exclusive distribution; changing repository visibility not performed.

Remaining external requirements: owner Render account connection, safe dashboard password configuration, public smoke test and migration coordination. No hosted auth or website protection claimed yet.
