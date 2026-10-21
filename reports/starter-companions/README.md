# Starter companions and tap reactions

- New installs/reset runs choose Pip, HOP or BOMO; choice is persisted and has no ordinary switch control.
- Version marker distinguishes existing raw saves (default Pip) from pending new/reset choices (do not auto-assign).
- Earned selected guardian remains; missing/unowned selection falls back to starter, never an unearned guardian.
- Reset remains parent-gated, creates recovery backup, preserves existing preferences/name, clears starter choice.
- Backup schema accepts old snapshots and all three new IDs. Old snapshot restoration retains current starter where available.
- Approved concept sheets reused with non-destructive half-sheet framing. Mobile JPEG derivatives included; originals retained outside app checkout.
- Tap artwork: 400ms subtle bounce, soft highlight, 2-second short reply. Repeated taps ignored while active. No storage, scoring, audio, or clock mutation. Reduced motion displays only text. Cleanup on unmount/context change.
- 48 authored replies: 12 each Pip/HOP/BOMO and 12 shared by earned guardians; ready/focus/rest/done each have 3 rotating short lines.

## Checks

- `npm run typecheck`
- `EXPO_PUBLIC_BASE_URL=/holton-guardian-app npm run export:web`
- `node reports/family-tools/model-check.cjs`
- `node reports/starter-companions/replies-check.cjs`
- `node reports/starter-companions/browser-check.mjs`
- `node reports/starter-companions/reaction-check.mjs`
- Prefix browser scripts with `SKY_TEST_URL=https://jshinegroup-svg.github.io/holton-guardian-app/` for public verification.

Browser scripts use isolated Chrome profiles and seeded test data, never actual player data. Checks cover fresh/legacy/active migration, three choices, reload, reset/cancel/reselection, earned guardian preservation,320/390 layout, phase-specific replies, debounce, reduce-motion, and unchanged timer/points. Screenshots are test fixtures, not user progress. Physical-phone testing is not claimed.

## Species voices and parent early completion (22923)

- Five guardian species now each have12 distinct lines (3 per ready/focus/rest/done mood), including gentle species-based jokes. All four stages route to their species. Three starters keep12 each with one playful line added:96 character lines total. Unknown IDs retain a12-line neutral fallback.
- Parent→任務與目標→允許提早完成 is an immediate persisted boolean, default off for new/legacy players. Off keeps half-duration/untimed10-minute threshold. Strict true bypasses elapsed gate only; phase/help guards, countdown, finishing sequence and once-only rewards unchanged.
- Parent preference survives adventure reset and validates/roundtrips in backups. Importing an old backup without the flag uses the safe off default.
- Verification: typecheck/export; replies-check.cjs; early-finish-model.cjs; family-tools/model-check.cjs; early-finish-check.mjs (320/390, parent switch live on/off, reload, help, both timing modes, single reward, reset preservation, all5 voices in task and collection).
