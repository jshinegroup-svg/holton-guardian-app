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

## World-card point exchange — 2026-10-18
- User authorized designing a daily/every-other-day exchange and accepting zero-point cards. Implemented manual batch preview/confirmation, max one successful exchange per Taipei calendar day; cards never expire, so waiting two or more days is allowed.
- Inspected all ten original world card images. Bonus Energy explicitly +1; Future Signal says +1 maybe; Surprise Gift has unspecified gift; Double Mission art does not specify a multiplier. Explicit new app rules: Bonus +1, Future +1 fixed, Surprise +2 fixed, Double Mission multiplies current positive-card batch ×2, max one per batch. Other six cards are story-only / zero points. These are declared app rules, not claims of original printed numbers.
- Extra multiplier cards carried forward. A multiplier alone gives no payout and is not consumed. Zero-only batches do not consume daily allowance. Only positive cards and one used multiplier are marked redeemed; all card art stays in collection. Existing light collection eligible once because previous versions awarded no world-card points.
- Preview lists contributing cards and formula, excludes wallet balance/task earnings from multiplication. Confirmation atomically saves wallet credit, redeemed draw IDs, and dated immutable receipt lines. Guards against repeated clicks, same-day exchange, duplicate IDs, and stale missing item markers via receipt ledger.
- Child home and album have exchange entry. Parent can view same receipt ledger. Daily point panel separates task earnings from world-card credits. Draw reveal now describes redemption value, not immediately awarding points.
- TypeScript, lint, export and pure rules/browser checks passed: exact +8 example, multiplier carryover, zero no-op, duplicate IDs, Taipei midnight, two-day accumulation, old cards, repeat click/reload, receipt totals, balance and task-history retention, mobile layout. Existing mission/help/encouragement/world-draw regression passed. Preview/receipt screenshots inspected. Test harness transpilation uses ES2022 for Map iterator semantics.
- Public release 30a8282 built; public HTML references expected export. Full exchange regression passed on public URL using isolated synthetic cards and test clock: old collection, formula, atomic credit/receipt, same-day lock, two-day wait, carried multiplier, zero reward, refresh and mobile. User records untouched.

## Home exchange reminder — 2026-10-19
- User accepted non-disruptive reminder rather than automatic redemption. Inline home banner appears only in ready/done child view with positive redeemable points and no daily exchange lock, draw modal, collection modal or exchange modal.
- Go action opens preview only; explicit confirm still required. Later action saves dismissal for current Taipei day. Refresh/new cards on same day do not re-prompt; next day eligible again. Manual exchange entry remains available after dismissal.
- No migration/reset and no automatic credit, card consumption or timer mutation. Zero/story-only and multiplier-only collections do not prompt. Preparing, active, help-paused and finishing phases never show reminder.
- TypeScript, component lint/export and browser checks passed for eligibility, go/preview/confirm separation, daily dismissal/reload, next-day return, all excluded phases/modals, explicit exchange, daily lock, zero/multiplier-only, and 390px overflow. world-reminder.png visually inspected. Local preview server was restarted before successful browser test.
- Public release dca6eb9 built and bundle matched. Public smoke passed: home eligibility, preview without automatic credit, later/dismiss persistence after reload and new same-day cards, next-day return, parent exclusion. Isolated test profile only.

## Energy wallet artwork — 2026-10-19
- User requested orb appearance inside the orb balance frame, leaving layout choice to implementation. Reused existing Bonus Energy original card art as left thumbnail; right large available balance and unit. Existing warm panel, task/world totals, goal and draw progress retained.
- Visual only; no storage/reward/exchange changes. Numeric font scales with digit count because web Text auto-fit alone clipped six-digit balances.
- TypeScript, component lint, web export passed. Browser visual checks at 390 and 320 widths: original image loaded, no page overflow, 999999 balance fits without clipping. energy-wallet-390.png inspected; screenshots use synthetic balance 28.
- Public release a66d1b5 built and bundle matched; public browser verified original image loading, 390/320 widths and six-digit balance fit using isolated synthetic data.

## 2026-10-19 Energy arithmetic cards
- User clarified supplied +5 blue / +20 gold cards represent balance addends, not changed rewards. Added read-only EnergyMath: tens plus remainder, small totals split evenly; zero/one/large totals stay exact. Native framed fallback supports arbitrary values without showing an incorrect printed denomination.
- Added original supplied cards and built-in image_gen +6/+7/+8/+9 variants in assets/cards/energy-math/. Verified all generated numerals visually. Full generation prompt: Edit target attached blue ENERGY BOOST card; single standalone portrait 2:3; match cream paper, blue rounded border/header, glowing blue orb and typography; change ONLY bottom +5 to +N (N=6,7,8,9); keep ENERGY BOOST, artwork/layout unchanged; full uncropped counting card. Original built-in outputs retained.
- Existing actual wallet, task rewards, world exchange multipliers and guardian prices unchanged. No quiz gate. Typecheck, component ESLint and web export passed.
- Published Pages 8939baf (built), bundle a56ea57760e3bc84ed42f834a71b677b. Isolated public browser verified original/generated images, 320/390 widths, totals 0/1/7/10/26/27/28/29/100/105/999999, accurate equations and no wallet mutation.

## 2026-10-19 Golden 40 denomination
- User requested missing 40 card. Built-in image_gen edit of energy-20.jpg saved as assets/cards/energy-math/energy-40.png; visually confirmed +40, golden orb, teal frame and DOUBLE ENERGY heading.
- Prompt: Edit supplied golden DOUBLE ENERGY counting card; single portrait 2:3; change ONLY bottom +20 to +40; preserve heading, cream texture, teal frame/header, golden orb, layout, typography and colors; full uncropped card. Arithmetic denomination only, not new reward rule.
- Registered 40 image in EnergyMath; 40–49 balances now use this card. No balance/reward/storage changes. Typecheck, component ESLint and production web export passed.
