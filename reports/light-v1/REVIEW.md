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

## Publication — 2026-10-18
User explicitly approved 上線. Deployed to original GitHub Pages URL with base path `/holton-guardian-app`.
- Pages commit: eab382da45a2a458637cb24e399e97b4967d6e28; GitHub status built.
- Previous deployment d4c9f8e retained in history; old assets retained.
- Public browser verification at 390×844: task save → start → help → resume → complete → reload; 12 imported orbs became 13 with one record, completion persisted, guardian image loaded, no horizontal overflow.
- Automated selector for back navigation initially failed; used accessibility reference and reran complete flow successfully.
- Test records exist only in isolated verification browser, not user's device.

## Card-first revision — 2026-10-18
User requested original card artwork and duration selection remain visible. Added seven original time challenge cards (3/5/10/15/20/25 minutes and untimed), horizontal card picker, selected state, active-task card artwork, and optional next-round selection. Parent custom task/time remains available. Rewards remain light mode +1 per round, stated alongside cards. Optional cardId stored alongside existing state and history without resetting prior records.
Checks: typecheck and component ESLint pass; Expo export passes. Browser 390×844: visible card click and start uses 3 minutes; untimed selection/help/resume/reload keeps null deadline; completed history includes selected card; reward added once; no page horizontal overflow. Card screenshot inspected. Off-screen automation clicks required explicit scrollIntoView; flow passed with real clicks after scrolling.

## Visible points + world card rewards — 2026-10-18
- Prominent total orbs, today's earned orbs, daily task count and next-draw progress.
- Parent daily completion target defaults to 3; configurable 1–20 alongside task settings. This is a count of completed rounds, not a named-task checklist.
- Every three new completions (progress carries across days) or first daily target completion queues a draw. Coincident triggers merge into one draw; daily goal changes cannot claim twice on the same date.
- Original world-card art, explicit tap to draw, persistent reveal and collection. Cards are commemorative; legacy effects are not applied. Existing orb balances/history retained; no retroactive draws for older completions.
- Completion, pending entitlement and random reveal are saved atomically to the light snapshot. Existing busy guard prevents rapid duplicate actions. Reload preserves pending and revealed rewards.
- Passed TypeScript, component ESLint, web export, browser regression at 390×844: third/sixth rewards, daily target independent of third, simultaneous merge, goal edit guard, double clicks, refresh before/after reveal, collection and viewport overflow. Screenshots rewards.png/world-draw.png. Test harness tmp/reward-smoke.mjs uses isolated browser storage.
- Publication verified: GitHub Pages build 28efeae succeeded; the same browser regression passed against the public URL in an isolated profile. No user browser data was accessed.
