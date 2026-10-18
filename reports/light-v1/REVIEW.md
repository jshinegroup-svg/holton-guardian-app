# Holton Hero 輕量版 A — 2026-10-18

Status: implemented locally; not published. User selected A (retain guardian + orbs, simplify child/parent workflows).

- Child: one task → start → complete; help pauses timer with one coaching sentence; completion adds exactly one orb and ends round.
- Parent: task and 1–60 minute duration, coaching sentence, today's completion records. Active task cannot be overwritten.
- No codex, card draw, evolution, feeding or multiple currencies in light interface.
- New key `holton-guardian-app::light-v1`; first load reads existing guardian and orb balance. Old snapshot keys are read-only. Existing history remains in original snapshot, not displayed as light history.
- Original implementation retained as LegacyApp in App.tsx. Reverting default entry restores original interface; light data remains separately stored.
- Local only, device/browser storage. Not cross-device sync. Parent entrance is navigation, not authentication.

## Verification
- TypeScript passes; new component ESLint passes; repository lint has pre-existing warnings but no errors.
- Expo web export succeeds.
- Browser viewport 390×844: no horizontal overflow; task-start screenshot inspected.
- Invalid 0 minute input rejected; valid task saved.
- Start → help → reload restores paused task; resume works.
- Double completion click grants only one orb and one history item; reload preserves completed state.
- Parent shows today's completed task.
- Synthetic legacy snapshot import preserves guardian name and 23 orbs; legacy snapshot stays byte-for-byte unchanged.
- Actual iPhone hardware not tested; public site unchanged.

Screenshots: child-ready.png, child-done.png, parent.png. Example task is test data only.
