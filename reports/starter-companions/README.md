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
