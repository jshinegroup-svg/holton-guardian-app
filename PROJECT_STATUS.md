# Holton Hero System / Holton Guardian App — Project Status

Last updated: 2026-06-29

## 1. Project Summary

Holton Hero System is currently implemented as a **single-screen Expo / React Native app** focused on a child-first ADHD support flow.

The current product structure is already beyond concept stage. The live codebase contains a working first-pass implementation of:

- mission flow (`ready → challenge → sop → settle`)
- child / parent dual-mode UI
- core guardian (本命獸) creation and growth loop
- guardian world / codex / event layer
- support tools / transition / SOP / active skills
- hero / orb / badge / summon economy
- real-session capture and handoff/testing dashboard
- AsyncStorage persistence

The app is functional enough for continued iterative development, but it is still **highly monolithic** and needs cleanup before faster feature work can continue safely.

---

## 2. Current Code Location

### Primary app root
- `holton-guardian-app/`

### Live app entry
- `holton-guardian-app/App.tsx`
  - Current line count: ~10,570 lines
  - This is the real runtime entry for native + web builds.
  - It currently contains:
    - product data
    - types
    - state
    - persistence
    - view logic
    - handlers
    - reporting logic
    - styling

### Supporting config / scripts
- `holton-guardian-app/package.json` — scripts and dependencies
- `holton-guardian-app/app.config.js` — Expo config, bundle IDs, OTA settings
- `holton-guardian-app/README.md` — local run / build / handoff commands
- `holton-guardian-app/eas.json` — preview / simulator / device / TestFlight / production build lanes
- `holton-guardian-app/scripts/build-readiness.mjs` — local build sanity checks
- `holton-guardian-app/scripts/preview-handoff.mjs` — Android preview handoff helper
- `holton-guardian-app/scripts/ios-build-handoff.mjs` — iOS preview/TestFlight handoff helper
- `holton-guardian-app/scripts/card-asset-tool.py` — card asset audit / optimize tool
- `holton-guardian-app/scripts/card-coverage-audit.py` — card coverage audit tool

### Product / strategy docs already in repo
Relevant reports live under `reports/`, especially:
- `reports/holton-guardian-app-spec-v1-2026-05-02.md`
- `reports/holton-guardian-app-spec-v1-gap-check-2026-05-02.md`
- `reports/holton-product-architecture-map-v1-2026-05-03.md`
- `reports/holton-overall-integration-check-v1-2026-05-04.md`
- `reports/holton-time-challenge-module-v1-closure-2026-05-10.md`

---

## 3. Technology Stack

### App runtime
- Expo SDK 54
- React 19
- React Native 0.81
- React Native Web
- TypeScript

### Storage / local persistence
- `@react-native-async-storage/async-storage`

### Build / distribution
- Expo CLI
- EAS CLI
- Expo Updates

### Current build configuration
- iOS bundle ID: `com.holton.guardian`
- Android package: `com.holton.guardian`
- App version: `1.0.0`
- Owner: `jshinegroup`
- EAS project ID already present in `app.config.js`

---

## 4. Current Functional Map in Code

### A. Data / card catalogs
Defined near the top of `App.tsx`:
- `timeChallenges` — around `App.tsx:644`
- `heroCards` — around `App.tsx:654`
- `guardianBeasts` — around `App.tsx:665`
- `worldEvents` — around `App.tsx:737`
- `activeSkills` — around `App.tsx:750`
- `transitionCards` — around `App.tsx:756`
- `sopCards` — around `App.tsx:764`
- `supportTools` — around `App.tsx:773`

### B. App entry and core state
- `export default function App()` — around `App.tsx:1573`
- This section contains the full runtime state tree, including:
  - child / parent mode
  - mission phase
  - orb / badge / guardian progress
  - core guardian lifecycle
  - support assist state
  - testing mode
  - real-session capture state
  - persistence hydration flags

### C. Persistence
- Storage keys — `App.tsx:471-472`
- Hydration / snapshot load — starts around `App.tsx:3067`
- Snapshot save — around `App.tsx:3178-3268`
- Reset / cleanup path — around `App.tsx:4166`

### D. Major UI sections in the live screen
Key section anchors include:
- home / entry selection — around `App.tsx:7038`
- parent review page — around `App.tsx:7105`
- real session capture — around `App.tsx:7334`
- testing mode dashboard — around `App.tsx:7574`
- daily handoff / test report — around `App.tsx:7825`
- mission main flow — around `App.tsx:7932`
- ready check — around `App.tsx:7948-7968`
- challenge card layer — around `App.tsx:7987`
- in-round support / skills — around `App.tsx:8164`
- SOP flow — around `App.tsx:8230`
- core guardian section — around `App.tsx:8335`
- world / codex section — around `App.tsx:8373`, `8923`
- parent assist layer — around `App.tsx:8426`
- weekly overview / world review — around `App.tsx:8852`
- guardian progress / challenge status — around `App.tsx:9306`
- world events — around `App.tsx:9360`
- ascension / badges / summon — around `App.tsx:9397`
- orb module — around `App.tsx:9433`

---

## 5. Completed / Landed Functionality

## 5.1 Core product structure
These are already materially present in code and product docs:

- Child-first product framing is already established.
- Three-layer architecture is already implemented conceptually and partially in UI:
  - core guardian / 本命獸
  - parent guidance layer
  - guardian world layer
- Home reading order was intentionally shifted so:
  - core guardian first
  - today / mission second
  - parent assist when blocked
  - world layer later

## 5.2 Mission flow
Current mission-phase structure exists in code:
- `ready`
- `challenge`
- `sop`
- `settle`

Landed behaviors include:
- Ready Check as explicit entry state
- challenge selection
- active challenge round state
- SOP-driven continuation
- settle / wrap-up path
- post-wrap-up continuation handling

## 5.3 Time challenge module
The time challenge flow was explicitly closed in a focused pass and is currently one of the most stable modules.

Landed behaviors include:
- selection state vs active-round state separation
- pause converted into real fullscreen timed state
- breather aligned with same regulation system
- mid-round challenge switching blocked / confirmed
- explicit cancel-current-round action
- orb reward table aligned to confirmed rule
- clearer active-round action hierarchy
- active-round display simplified to execution-focused UI

## 5.4 Core guardian / 本命獸 loop
The current app contains a substantial core guardian loop:
- guardian creation state
- provisional / bonded lifecycle
- naming / archetype / element / color choices
- quiz-based archetype recommendation
- weekly feed tracking
- total feed tracking
- level / stage progression
- feed-success expression state
- guardian reselect state
- guardian panel in parent layer

This is not just placeholder logic; the state model is already deep and central.

## 5.5 Hero / reward economy
The app already contains a first-pass hero economy:
- orbs / bonus orbs
- badges / ascend line
- hero rule book
- tool-card inventory state
- hero collection state
- weekly hero service / retirement-related state
- summon / progress representation

This module exists, but its closure / feedback / retirement UX is still incomplete.

## 5.6 Guardian world / codex / event layer
The world layer is already materially present:
- guardian beast catalog
- status model (`unknown`, `defeated`, `captured`)
- showcase / display logic
- world event data and images
- guardian traces / challenge eligibility state
- world progression / “leave something this round” framing

This has already evolved beyond a raw list and is intended as a guided world-entry layer.

## 5.7 Parent assist / direct support layer
The parent layer includes:
- parent-first home toggles
- support scenario selection
- support variants
- support tools
- direct card call path
- guidance modal / guide content
- reminder mode / timed support flow
- return-to-mainline handling after regulation

## 5.8 Real-session capture / testing dashboard
A substantial operator/testing layer exists:
- simulated vs real session split
- real session state records
- workflow stage tracker (`prep`, `entry`, `main`, `recovery`, `packup`)
- interruption / assist logging
- next-action draft fields
- daily real-test review
- failure / recovery taxonomy
- handoff-ready report generation in app UI

This is one of the major later-stage additions and is already embedded into the app.

## 5.9 Persistence
AsyncStorage persistence is in place with:
- v3 storage key
- legacy key fallback/migration path
- save-on-change snapshot logic
- reset path

Also verified on 2026-06-29:
- `npm run typecheck` passes

---

## 6. Incomplete / Partially Complete Areas

## 6.1 Code architecture / maintainability
The biggest technical problem now is not missing vision; it is **monolithic implementation**.

Current issues:
- `App.tsx` is too large (~10.5k LOC)
- product logic, state logic, persistence, UI, styling, and reporting are mixed together
- difficult for Codex or any developer to change one area without accidental regressions
- no clean modular boundary between:
  - mission flow
  - guardian flow
  - world flow
  - parent assist
  - reporting / testing

## 6.2 Core guardian polish not fully closed
Core guardian is strong conceptually, but still needs:
- clearer visual success states
- stronger feed / growth feedback
- cleaner child-facing readability
- more stable “main hero / emotional center” presentation

## 6.3 Hero loop closure still incomplete
Older gap-check documents remain directionally correct here.
Still weak / partial:
- expiry reminder clarity
- retirement state visibility
- skill usage feedback clarity
- stronger writeback into history / review
- full persistence consistency validation after repeated reopen/reset cycles

## 6.4 Guardian world is present but not yet product-polished
Still missing / partial:
- stronger codex / collection visual system
- rarity framing
- silhouette / unknown-state polish
- better showcase layout
- single-beast detail page / share-ready presentation

## 6.5 Parent layer density needs ongoing control
The parent layer is useful, but can easily regress into:
- too much text
- too many parallel choices
- slower field usage

This is a product risk even if technically “working.”

## 6.6 Real-session layer needs operational validation
The operator / session capture layer is significant, but still likely needs:
- real caregiver field validation
- simplification of logging burden
- clearer separation between dev/test tools and production caregiver UI
- eventual extraction from the main child-facing runtime surface

## 6.7 Expo Router skeleton exists but is not the active architecture
The repo still contains `app/` and tab-router starter files, but the live product is described in README as using `App.tsx` as the active entry.

That means there is still architectural ambiguity / leftover scaffold debt.

---

## 7. Locked Product Decisions To Preserve

These decisions should be treated as current canon unless Jerry explicitly changes them:

1. **Child-first / parent-second / system-third layering**
2. **Time challenge is the real first child action**
3. **Visible on-screen reaction matters more than hidden internal state changes**
4. **Physical-card ritual front layer + app control layer + guardian-world layer**
5. **One module at a time**; do not scatter polish across multiple unfinished areas
6. Current active priority order:
   1. SOP / 任務中主流程
   2. 本命獸入口與陪跑鏈
   3. 世界展示 / 事件卡實際可用性
   4. 按了沒反應的入口
   5. 最後才補純視覺微調
7. For handoff/progress language, Jerry prefers concrete status, not vague strategy narration

---

## 8. Current Development Health

### What is healthy
- product direction is already coherent
- codebase still runs and typechecks
- major loops already exist in code
- enough logic is present for Codex to continue implementation

### What is fragile
- monolithic file structure
- high regression risk for indiscriminate edits
- too many concerns in one runtime screen
- some later features are mixed into the same surface as core child flow

---

## 9. Best Immediate Next Step for Codex

### Recommended first task
**Refactor without changing product behavior.**

Before building major new features, Codex should first do a controlled internal split of `App.tsx` into modules.

Suggested first refactor targets:
1. extract static data catalogs
2. extract shared types
3. extract persistence helpers
4. extract mission-flow helpers
5. extract real-session reporting helpers
6. extract presentational subcomponents for major sections

This gives safer ground for all later feature work.

### If feature work must happen before refactor
Then the best feature-first order is:
1. mission/SOP continuity polish
2. core guardian entry + feed-success chain polish
3. guardian world usefulness / event visibility
4. dead/unclear interactions
5. visual polish last

---

## 10. Quick Reality Check for a New Developer

If you are a new developer or Codex agent picking this up:

- do **not** assume this is an early stub
- do **not** assume the right next move is a redesign from scratch
- do **not** aggressively add new product branches before reducing `App.tsx` risk
- do preserve the existing child-first product logic
- do treat the current codebase as a real vertical slice with technical debt, not a blank canvas
