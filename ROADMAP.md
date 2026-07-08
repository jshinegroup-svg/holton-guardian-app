# Holton Hero System — Roadmap

Last updated: 2026-06-29

This roadmap is optimized for **Codex handoff** and follows the currently locked product priority:

1. SOP / 任務中主流程
2. 本命獸入口與陪跑鏈
3. 世界展示 / 事件卡實際可用性
4. 按了沒反應的入口
5. 最後才補純視覺微調

---

## Phase 0 — Stabilize the codebase before new expansion

### Goal
Reduce regression risk so future feature work is faster and safer.

### Deliverables
- split `App.tsx` into smaller files without changing user-visible behavior
- isolate static data, types, helpers, and persistence
- establish clear feature boundaries

### Suggested extraction order
1. `src/data/` or `src/catalog/`
   - time challenges
   - hero cards
   - guardian beasts
   - world events
   - active skills / transition / SOP / support tools
2. `src/types/`
   - move large type definitions out of `App.tsx`
3. `src/lib/persistence/`
   - AsyncStorage snapshot load/save/reset
4. `src/lib/mission/`
   - mission flow helpers
   - reward rules
   - phase transition helpers
5. `src/lib/review/`
   - real-session taxonomy / handoff / daily review helpers
6. `src/components/holton/`
   - section-level presentational components

### Exit criteria
- `npm run typecheck` passes
- `npm run lint` passes
- no visible behavior regression in main child / parent flows
- `App.tsx` meaningfully smaller and easier to navigate

---

## Phase 1 — Mission mainline closure

### Goal
Make the core mission path feel fully intentional, especially around continuation and recovery.

### Focus
- `ready → challenge → sop → settle`
- post-wrap-up continuation
- “return to the blocked step” flow
- reduce ambiguity during in-progress rounds

### Concrete work items
- tighten SOP step continuity after pause / support / wrap-up
- verify the current “return to this step first” logic is always visible at the correct time
- reduce redundant explanatory text during active mission flow
- make mission progress state clearer for both child and parent modes
- audit mission actions for any dead or confusing button states

### Exit criteria
- a user can start, regulate, return, and finish a round without losing the mainline
- no ambiguous mid-round branch that feels like “selection mode” again
- parent assist never hides what the immediate next step is

---

## Phase 2 — Core guardian entry and feed-success chain

### Goal
Strengthen the emotional center of the product: the core guardian should feel alive, visible, and tightly coupled to progress.

### Focus
- core guardian entry
- guardian creation / naming / recommendation
- feed-success reaction
- growth readability

### Concrete work items
- improve guardian entry framing on home
- verify the first-feed / weekly-feed / total-feed experience is clear
- make feed-success reaction harder to miss
- make guardian stage / level / weekly target easier to read at a glance
- ensure parent layer and child layer both reinforce the guardian relationship, not just system stats

### Exit criteria
- first-time user can understand why the core guardian matters
- feed → reaction → growth feels explicit
- the core guardian remains the emotional main character

---

## Phase 3 — Guardian world usability, not just presence

### Goal
Turn the existing world layer into something genuinely usable and rewarding, while preserving the rule that the core guardian remains primary.

### Focus
- world entry
- codex readability
- world events
- collected / defeated / unknown differentiation

### Concrete work items
- improve current world-entry navigation hierarchy
- strengthen visual differences between unknown / defeated / captured beasts
- make “this round left what behind?” feel more concrete
- make world events more legible as clues / traces / progression drivers
- optionally add a single-beast detail view if it can be done without destabilizing the mainline

### Exit criteria
- a child / parent can enter the world layer and immediately understand what to look at
- the world layer feels like progression, not a data wall
- world events are visibly meaningful

---

## Phase 4 — Interaction reliability / dead-entry cleanup

### Goal
Eliminate flows that look clickable or important but do not produce sufficiently clear feedback.

### Focus
- any button / entry that feels unresponsive
- toggle states that hide the mainline
- mode-switch ambiguity

### Concrete work items
- test every high-importance CTA in child and parent mode
- identify “pressed but nothing obvious happened” interactions
- add stronger inline feedback for hidden-state transitions
- simplify or remove low-value toggles that increase confusion

### Exit criteria
- every high-importance action yields visible and immediate feedback
- no critical action depends on hidden context the user cannot see

---

## Phase 5 — Visual polish last

### Goal
Only after structure and behavior are stable, improve fit-and-finish.

### Focus
- spacing
- density
- hierarchy
- collection look
- mode clarity

### Good candidates
- guardian world collection visuals
- rarity framing
- card density tuning
- home emphasis / hierarchy refinement
- handoff / review board clarity

### Exit criteria
- polish improves comprehension rather than adding noise
- no visual pass should reopen unstable logic

---

## Parallel Track A — Real-session capture validation

This is important, but should not be allowed to destabilize the child-first core flow.

### Goal
Validate whether the operator/session-capture layer is useful in actual caregiver workflows.

### Work items
- field-test whether logging burden is too high
- identify which real-session fields are essential vs optional
- separate operational review from child-facing UI where possible
- consider extracting real-session review into a dedicated surface later

### Rule
Treat this as a **parallel validation track**, not the first thing to expand further.

---

## Parallel Track B — Build / distribution readiness

### Goal
Keep the project ready for preview / device testing without blocking core product work.

### Already present
- Expo config
- EAS profiles
- preview scripts
- iOS handoff scripts
- asset audit tools

### Next operational steps when needed
- Expo login
- EAS project linking if required
- Android preview build
- iOS simulator build
- iOS device build
- TestFlight setup once Apple-side access is available

---

## Recommended Codex execution strategy

### Best first Codex sprint
Sprint 1:
- modular refactor only
- no feature expansion unless required to keep behavior intact

Sprint 2:
- mission mainline polish
- child / parent visible feedback cleanup

Sprint 3:
- core guardian emotional loop polish

Sprint 4:
- guardian world practical usability pass

---

## Anti-roadmap: what NOT to do next

Do not start with:
- total redesign from scratch
- moving everything to a new navigation architecture first
- broad visual redesign before behavior is stable
- adding many new product branches before splitting `App.tsx`
- over-expanding reporting / analytics while the core mainline still needs cleanup

---

## Short version

If Codex only remembers one sentence, it should be this:

> First make the codebase safer, then strengthen the mission mainline, then strengthen the core guardian bond, then make the guardian world more usable, and only polish visuals after that.
