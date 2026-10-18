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

## Start / finish rituals — 2026-10-18
- User approved sequence: time card → original Task Starter-I → explicit ready/start → timed or untimed work → original Finish Line badge as cleanup card → explicit cleanup confirmation → points and world reward.
- Added persistent preparing/finishing phases. Preparing has no deadline; finishing freezes remaining time and awards nothing until confirmation. Back controls allow reselection before start and resumption after accidental completion. Parent task edits locked throughout preparing/active/finishing. Phase transitions scroll to the task card.
- Existing light records, balances, collection and pending draws retained without reset. Existing active tasks continue normally.
- TypeScript, component lint, export and browser regression at 390×844 passed: preparation wait/reload, back to picker, explicit timer start, finish/reload without reward, parent edit lock, resume/help, duplicate clicks, untimed resume, third/sixth and daily draws, pending/revealed reload, no overflow. Screenshots task-starter.png and finish-line.png inspected.
- Public verification: Pages commit 16bcc05 built successfully; public bundle matched export. Full ritual/reward browser regression passed on the public URL using isolated test storage; user data untouched.

## Guardian collection / Sunday exchange — 2026-10-18
- Approved guardian album with original five species × four stage images. Owned and unowned separated; full-card detail; free persistent companion selection on home and task. Core guardian identity remains independent.
- One-time migration for existing light saves reads old captured catalog (Mini) and stage-growth thresholds (earned stages), retaining light balance/history/core, never writing legacy snapshots. No assumed ownership for new profiles.
- User reports all five Mini already earned: parent action restores missing five starter cards once, with zero cost and no duplicates when legacy evidence is absent. Actual user device records cannot be inspected remotely; this action runs in their browser.
- No Sunday redemption ledger was found in legacy source. New Sunday exchange uses catalog stage values 10/20/40/60 as full per-card prices, requires previous stage, preserves lower cards. Asia/Taipei Sunday checked at render and transaction. Purchase debit and receipt saved atomically; double click guard; no re-purchase. Free companion changes do not alter core identity or inventory.
- Point display now states available balance and records points spent on new exchanges, avoiding ambiguity after spending.
- TypeScript/component lint/export passed. Isolated browser at 390×844 verified fresh profile, five-card restore/reload, free selection, home/task presence, positive and partial legacy migration, legacy byte preservation, existing light balance/history/core preservation, Sunday purchase once, insufficient funds, prerequisites, Monday blocked, refresh, no horizontal overflow. CDP Page domain explicitly enabled before virtual weekday checks. Original ritual/reward regression also passed. guardian-collection.png / guardian-detail.png inspected.
- Public release e5de03b built; live HTML references expected bundle. Full collection migration/restore/selection/exchange browser checks passed on the public site with isolated synthetic records and a virtual Sunday/Monday clock. Public test initially needed an explicit DOM-ready wait after navigation; rerun passed. No actual user records were read or modified.

## Contextual finish encouragement — 2026-10-18
- Approved expansion to 20 messages: normal 6, help-requested 6, daily goal 4, combined daily/help 4. Original badge/SOP artwork reused; narrative presentation is not a new collectible or bonus reward.
- Selected from actual round help flag and expected daily target completion. Help request persists through resume/reload, resets on next new round. Text recognizes expressing a need without claiming actual adult assistance, speed, or emotions.
- Excludes last three completed message IDs; prefers different artwork from last completion. Selected ID saved at finishing entry; reload/back to work preserves same choice unless help/daily context changes. Archived with completion and help flag. Existing finishing saves without a choice show original Finish Line fallback.
- Context-specific cleanup button still calls same guarded +1 settlement and existing world draw logic. Daily context only at target crossing, not all subsequent rounds. Core identity, companion, collection and exchange unchanged.
- Passed TypeScript, component/data lint, export, 200 selector cases across contexts, browser checks: variety, no early reward, stable reload/back, help resume persistence, next-round reset, combined daily/help, context upgrade after returning, fixed point rewards, merged milestone draw, no repeated daily reward after goal edit, mobile width. finish-help.png / finish-daily-help.png visually inspected.
- Public release 3158791 built and HTML references expected export. Same contextual browser scenarios passed on public URL in isolated storage: normal/help/daily/combined, persisted choice and help, unchanged points/world awards. No user browser data accessed.

## Four original help cards — 2026-10-18
- User chose existing four cards only: Time Freeze, Break Time-II, Energy Boost, Breather Mode-I. No new companion-help card. Four-card grid shown immediately after help pauses the task.
- Selected card shows original art and specific guide. Rest starts separate persisted 120-second deadline; expiry only displays reminder, never resumes task. Breath suggests three comfortable slow breaths without holding breath or mandatory countdown. Every option resumes only by explicit button; user may resume early or change card.
- Help selection IDs preserved across reload and saved with completed history; visible in finish context and parent log. Deduplicated per round, reset on new round. No fees, bonuses, penalties, automatic completion or automatic timer restart. Timed remaining seconds and untimed null deadline preserved.
- TypeScript, component lint, web export passed. Browser verified exactly four options, each selection/resume, pause and rest reload, virtual rest expiry, reminder without resume, breath without deadline, switch card cleanup, untimed, per-round reset, single +1 and history, no mobile overflow. Existing 20-message/world-reward regression also passed. help-menu.png inspected.
- Public release c3d0f16 built; HTML matched expected export. Full four-card browser checks passed against public URL in isolated storage with a virtual rest clock, including pause/reload, expiry reminder without auto resume, all four cards, fixed rewards, history/reset and untimed behavior. Actual user data untouched.
