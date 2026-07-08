# CODEX TASK — PHASE 4 GUARDIAN WORLD USABILITY

Project: Holton Guardian App / Holton Hero System  
Path: `/Users/user/.openclaw/workspace/holton-guardian-app`
Last updated: 2026-06-29

---

## Read first
Before starting this phase, read:

1. `PROJECT_STATUS.md`
2. `ROADMAP.md`
3. `TODO.md`
4. `CODEX_TASK_PHASE1.md`
5. `CODEX_TASK_PHASE2.md`
6. `CODEX_TASK_PHASE3.md`
7. `reports/holton-product-architecture-map-v1-2026-05-03.md`
8. `reports/holton-overall-integration-check-v1-2026-05-04.md`
9. `reports/holton-guardian-world-entry-first-screen-v1-2026-05-03.md`
10. `reports/holton-guardian-world-entry-guided-first-screen-v1-2026-05-03.md`

---

## Goal
Strengthen the **guardian world layer** so it becomes more usable, more legible, and more rewarding — without stealing the main character role from the core guardian.

This phase focuses on:
- world entry readability
- “what should I look at now?” clarity
- codex / collection usability
- event card usefulness
- progression visibility

This phase is **not** for turning the world layer into a bigger, louder, more distracting system than the core guardian or mission mainline.

---

## Locked product intent to preserve
These rules are current canon:

1. **本命獸負責愛與內化；其他守護獸負責世界與延伸動機**
2. the world layer is a **second motivation layer**, not the main emotional center
3. home should still prioritize:
   - core guardian first
   - today/mainline second
   - parent support when needed
   - world layer after that
4. the world layer should feel like a **guided world entry**, not a raw data wall
5. visible progression matters more than hidden logic

Do not make the guardian world overpower the core guardian on home.

---

## Core problem to solve
The guardian world layer already exists, but the current risk is that it can still feel like:
- a set of adjacent collection panels
- a catalog wall
- a feature-rich layer without enough “what now?” clarity

The user should instead feel:
- this round left something behind
- I can see what I unlocked / encountered / moved toward
- I know where to look next
- the world layer is rewarding, but not overwhelming

---

## Scope
In scope:
- world entry structure
- collection / codex readability
- status differentiation (`unknown`, `defeated`, `captured`)
- event-card practical usefulness
- showcase / latest-result / next-look hierarchy
- progression cues and visual legibility

Out of scope:
- large new world systems
- new beast families or new card ecosystems
- full art overhaul
- redesigning the core guardian layer
- expanding analytics/reporting instead of product usability

---

## Required work sequence

### Step 1 — Audit current world-reading order
Inspect the current world section and answer:
- what the user sees first
- what feels like the primary action / focus
- whether the latest result is obvious
- whether the codex wall reads as a wall instead of a guided path
- whether event cards feel meaningful or merely decorative

Do not start by adding more. First identify where the user’s attention currently goes.

---

### Step 2 — Improve world-entry hierarchy
Refine the world-entry flow so the user can more easily understand:
- what was left by this round
- what is newly available
- what is worth opening next
- what is still locked / unknown

Prioritize hierarchy over density.

The world layer should answer:
- “What happened?”
- “What can I see now?”
- “What should I look at next?”

Do not turn the entry into a denser dashboard.

---

### Step 3 — Strengthen codex / collection state readability
Improve the visibility of the three major collection states:
- unknown
- defeated
- captured

Potential work areas:
- silhouette treatment
- status framing
- rarity cues if already supported by existing data
- showcase emphasis
- cleaner visual separation between collection states

Important:
- this is a usability pass, not a broad art pass
- make the current states easier to perceive and understand

---

### Step 4 — Make event cards more practically useful
The world-event layer should feel tied to progression, not just like a flavor insert.

Improve clarity around:
- why an event matters
- what it leaves behind
- whether it is a clue, trace, encounter path, or progression signal
- how it relates to beasts / world expansion

Do not overcomplicate the rule system.
Instead, make the current system’s meaning more visible.

---

### Step 5 — Improve “latest result” and showcase usefulness
The world layer should give the user a stronger sense of:
- what this round produced
- what new thing is now visible
- what should be shown / remembered

Potential targets:
- latest capture / latest progress area
- showcase emphasis
- “this round left something behind” framing
- stronger next-step cue within the world layer

---

### Step 6 — Keep the world layer secondary to the core guardian
After any usability changes, verify that the world layer still behaves as:
- rewarding
- motivating
- explorable

but not:
- emotionally primary
- louder than the core guardian on home
- more visually dominant than the mission mainline

This phase succeeds only if the guardian world becomes clearer **without stealing the product center of gravity**.

---

## Validation requirements
When done, verify:

### Child-facing validation
1. complete or simulate a round
2. enter world layer
3. immediately understand what changed / what was left behind
4. identify one clear thing to look at next
5. understand collection-state differences without reading too much text

### Parent-facing validation
1. open the world layer after the mainline
2. confirm it reads as a useful second layer
3. confirm it does not overpower the core guardian or mission flow

### Required commands
Run at minimum:

```bash
npm run typecheck
npm run lint
```

If practical:

```bash
npm run doctor
```

---

## Success definition
This phase succeeds if:

- the world layer is easier to enter and understand
- codex / collection states are more legible
- event cards feel more meaningfully tied to progression
- the user can tell what to look at next
- the world layer becomes more useful without becoming the main character

---

## Output requirements
Provide a concise handoff summary with:

1. what changed in the guardian world flow
2. how world-entry hierarchy improved
3. how collection states became clearer
4. how event cards became more usable
5. what was intentionally left for later

---

## Final instruction to Codex
Treat this as a usability-and-meaning pass, not a content-expansion pass.
Make the guardian world easier to read, easier to value, and easier to navigate — while preserving the core guardian as the emotional center of the app.
