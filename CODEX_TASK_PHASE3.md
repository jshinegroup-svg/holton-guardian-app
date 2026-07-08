# CODEX TASK — PHASE 3 CORE GUARDIAN MAINLINE

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
6. `reports/holton-product-architecture-map-v1-2026-05-03.md`
7. `reports/holton-overall-integration-check-v1-2026-05-04.md`

If prior refactor work already happened, preserve the extracted module boundaries instead of collapsing them back into one file.

---

## Goal
Strengthen the **core guardian / 本命獸主線** so it feels unmistakably like the emotional center of the product.

This phase focuses on:
- core guardian entry on home
- creation / naming / recommendation readability
- feed-success reaction clarity
- guardian growth readability
- “this is my companion” feeling instead of “this is another system block”

This phase is **not** for broad world-layer expansion, analytics expansion, or visual-polish-for-its-own-sake.

---

## Locked product intent to preserve
These principles are current canon and must not be weakened:

1. **本命獸是主角，不是世界層的一部分**
2. **首頁先看本命獸，再看今天怎麼開始，再看家長層，最後才進世界層**
3. **Visible on-screen reaction matters more than hidden internal state**
4. **本命獸負責愛與內化；其他守護獸負責世界與延伸動機**
5. child-first / parent-second / system-third still applies

Do not allow the guardian world or system stats to steal the core guardian’s role.

---

## Core problem to solve
The current core guardian implementation is deep in state and logic, but it can still read too much like:
- a progress module
- a stat panel
- a subsystem among many subsystems

This phase should make the user feel more clearly:
- I have a companion
- this companion reacts to me
- feeding/growth matters
- this is the emotional through-line of the app

---

## Scope
In scope:
- core guardian home entry
- creation / quiz / recommendation readability
- guardian feed loop
- guardian growth cues
- guardian-first framing on home and nearby parent layer
- feed-success visual / emotional feedback

Out of scope for this phase:
- guardian world overhaul
- new guardian species/system branches
- broad reporting/dashboard work
- general redesign of unrelated modules
- changing the mission-flow architecture from Phase 2

---

## Required work sequence

### Step 1 — Audit current guardian-first reading order
Inspect the current home flow and confirm:
- what the child sees first
- what the parent sees first
- whether the core guardian visually reads as the emotional anchor
- where stats, controls, or adjacent systems dilute that role

Map the weak points before changing them.

Questions to answer during audit:
- Is the guardian immediately legible as “my companion”?
- Is the first guardian message emotionally clear?
- Does the home layout reinforce guardian-first, or merely include it?

---

### Step 2 — Improve core guardian entry clarity on home
Refine the home experience so the core guardian section does a better job of:
- introducing the companion
- anchoring the current emotional/main-character layer
- making the next relevant guardian-related action obvious

Potential targets:
- guardian section title/subtitle clarity
- positioning of guardian line / copy
- balance between guardian presence and surrounding stat blocks
- stronger distinction between guardian identity vs dashboard metrics

Important:
- do not redesign the whole home screen
- improve emphasis and legibility, not complexity

---

### Step 3 — Tighten creation / naming / recommendation readability
The guardian creation flow already exists. Improve its clarity and emotional coherence.

Focus on:
- recommendation/result readability
- naming flow clarity
- confirming why this guardian matches the child
- reducing any “quiz result = raw system output” feeling

The result should feel closer to:
- “this is your companion”
than:
- “the system assigned you a state/archetype record”

Do not overcomplicate with extra branches.

---

### Step 4 — Strengthen feed-success reaction and post-feed emotional feedback
This is one of the most important parts of the phase.

When the user feeds the guardian, the app should make that moment feel more explicit and satisfying.

Improve:
- visibility of feed-success reaction
- guardian expression change clarity
- immediate “it noticed / it responded” feeling
- transition back after feed-success so it still supports the mainline instead of creating confusion

Remember:
- visible reaction > hidden state mutation

Do not weaken the current mission/mainline focus while improving this.

---

### Step 5 — Improve growth readability without turning it into a dashboard
The guardian already has:
- level
- weekly feed
- total feed
- stage progression
- weekly target

The problem is not absence of data; it is the risk that growth reads like system administration.

Improve readability so the user can more naturally understand:
- how the guardian is doing
- whether it grew
- what today’s care contributed
- what the next meaningful milestone is

Do not overload the user with more stat UI.
Prefer clearer structure and emphasis over more numbers.

---

### Step 6 — Check guardian presence in parent mode
In parent mode, confirm the guardian is still helping the caregiver maintain the emotional center.

The parent layer should not reduce the guardian to a hidden side panel.

Check:
- whether the guardian panel supports the flow or feels secondary
- whether the parent can still perceive the guardian as the child’s companion rather than admin data
- whether parent-layer guidance accidentally outshines the guardian layer too much

Do not let parent tools bury the core guardian identity.

---

## Validation requirements
When done, test at minimum:

### Child-facing validation
1. open home
2. identify the core guardian immediately
3. understand what the guardian is / why it matters
4. feed the guardian
5. observe visible guardian response
6. understand current growth/progress without reading it like a dashboard

### Parent-facing validation
1. open parent mode
2. confirm guardian is still legible as emotional center
3. confirm guardian-related help does not compete destructively with mission/mainline guidance

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

- the core guardian feels more like the main character
- the feed-success loop feels more emotionally obvious
- growth is easier to understand without more dashboard clutter
- child and parent both perceive the guardian as central, not peripheral
- the world layer still remains secondary to the guardian on home

---

## Output requirements
Provide a concise handoff summary with:

1. what changed in the core guardian flow
2. where the guardian-first reading order was strengthened
3. how feed-success was improved
4. what was intentionally not changed
5. whether the next best phase should be guardian-world usability or unclear-interaction cleanup

---

## Final instruction to Codex
Protect the emotional role of the core guardian.
Do not turn this into a generic polish pass.
The purpose is to make the companion relationship clearer, more visible, and more felt — while preserving the existing product architecture.
