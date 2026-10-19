# All guardian 2D character motion — 2026-10-19

## Delivery
19 new 17-second 960×1200 H.264/AAC movies, plus the unchanged approved Mini Tidefin v2 = 20 guardian/tier films. Shared approved Super Hero robot choreography; guardian-specific sprites, tier appearance and elemental effects. Web presentation only; existing transaction logic unchanged.

## Generation
Built-in imagegen, transparent raster sprite atlases; original guardian card images supplied as references. Exact prompts and source paths in *-prompt.txt; unmodified generated atlases in assets/. Stoneback original stage1 is labeled Mid and stage2 Mini; reference ordering and catalog mapping corrected, without changing ownership IDs or costs.

## Reproduction
Serve this folder on port 19100. Run node reports/all-guardian-motion/render.mjs from repository root. Requires Chrome and /opt/homebrew/bin/ffmpeg. CHECK_ONLY=1 captures action/bond screenshots without rendering. 16 isolated components per atlas; 4 poses per tier. Approved original robot atlas and soundtrack reused.

## Validation
- TypeScript passes. Scoped lint: no errors, three existing catalog array-type warnings.
- 20 unique movies, all 17 seconds, fully decoded without errors (media-validation.json).
- Guardian state model: atomic debit, idempotent grant, prerequisite/weekday/balance/phase guards pass.
- Isolated Chrome mobile checks recorded below; not physical iPhone certification.
- Local Chrome 320/390: all 20 card-to-film URLs and actual ended events pass (batch films played at 8×; original first film at normal speed). Preview has no writes; cancel/write-failure preserves wallet; repeated debit/grant; reload; tier cost; reduced motion; Monday restrictions and media-error recovery pass.
- Direct seek on a partially buffered local MP4 was flaky; batch verification instead plays through at 8× with a 45-second timeout, without synthetic ended events.
- Public Pages deployment d2b2b7e built successfully. All 20 public MP4 SHA-256 values match local exports. Network metadata load exceeded the old 20-second test timeout on first request; public checks allow 90 seconds for metadata/playback (production UI remains skippable).
- Public Chrome checks PASSED: all20 films play to actual ended event; isolated transactions/320/390/skip/reload/reduced-motion/error/weekday checks passed. Pages d2b2b7e, source d2f25f3. No physical-device test.
