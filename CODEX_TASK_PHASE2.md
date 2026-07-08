# CODEX TASK — PHASE 2 MISSION MAINLINE CLOSURE

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
5. `reports/holton-time-challenge-module-v1-closure-2026-05-10.md`

If Phase 1 modular refactor has already been done, read the new extracted files first and preserve their boundaries.

---

## Goal
Strengthen the **mission mainline** so the app feels more like one coherent guided flow and less like a collection of adjacent systems.

This phase focuses on:
- `ready`
- `challenge`
- `sop`
- `settle`
- interruption / recovery / return-to-mainline behavior

This phase is **not** for broad redesign, new feature branches, or visual polish-first work.

---

## Product intent to preserve
The current locked intent is:

1. **time challenge is the real first child action**
2. **child-first / parent-second / system-third**
3. **visible reaction matters more than hidden state**
4. the app should help the user stay in the current round instead of drifting back into mode/selection confusion
5. after interruption or support, the user should know exactly where to return

Do not weaken these principles.

---

## Core problem to solve
The mission flow already exists, but some parts still risk feeling like:
- mixed selection state vs execution state
- too many adjacent explanation blocks
- recovery/support paths that are technically present but not always emotionally obvious
- “I pressed something, but I’m not sure what to do next” moments

This phase should make the mainline feel tighter, more legible, and more recoverable.

---

## Scope
Focus only on the mission mainline and direct supporting behavior.

In scope:
- ready check clarity
- challenge round clarity
- SOP continuity
- settle / wrap-up continuity
- interruption / support / return handling
- clearer current-step emphasis
- parent-mode guidance as it serves the mainline

Out of scope for this phase:
- large world-layer expansion
- guardian-world visual redesign
- broad core-guardian redesign
- major reporting/dashboard expansion
- navigation architecture changes

---

## Required work sequence

### Step 1 — Audit current mission-state readability
Inspect the current runtime behavior for:
- `ready`
- `challenge`
- `sop`
- `settle`

Confirm what the user sees in each state in:
- child mode
- parent mode

Identify places where:
- the next action is visually weak
- selection UI still leaks into execution moments
- parent assist obscures the mainline instead of serving it

Do not fix blindly. First understand and map the weak points.

---

### Step 2 — Strengthen active-round clarity
The round should feel like a real round once it starts.

Refine the mission flow so that during active execution:
- the current round is visually dominant
- unrelated pre-start information is minimized
- challenge state does not feel like selection mode
- the user always knows whether they are:
  - preparing
  - in round
  - regulating
  - returning
  - wrapping up

Preserve the already-locked time-challenge closure behavior from the prior dedicated pass.

---

### Step 3 — Tighten SOP continuity after interruption
Focus on the return path after:
- pause
- breather/regulation
- support-tool use
- parent assist use
- wrap-up return

The user should feel:
- “this is where I go back to”
- “this is the current step”
- “I am still in the same mission”

Improve the visibility and consistency of:
- blocked-step / return-step emphasis
- post-wrap-up continuation cues
- “come back here first” language or structure

---

### Step 4 — Reduce duplicate or competing guidance inside mainline states
Without deleting important meaning, reduce places where the app shows:
- repeated explanation
- adjacent guidance that competes with the current action
- parent/system text that weakens the child-facing mainline

The mission flow should feel guided, not crowded.

Important:
- do not over-shorten if clarity would be lost
- do not rewrite the whole product voice
- preserve current child-first intent

---

### Step 5 — Audit “unclear interaction” points inside mission flow only
Check for buttons/toggles/actions in the mission mainline that may cause:
- low-confidence transitions
- weak visual response
- uncertainty about what changed

Add or improve visible feedback where needed, especially when:
- support state opens/closes
- parent assist changes the layer
- return-to-mainline happens
- wrap-up continuation takes over

Again: this phase is about mainline confidence, not surface polish.

---

## Validation requirements
When done, verify that these flows still work clearly:

### Child mode
1. enter ready check
2. start challenge
3. continue through SOP
4. regulate if needed
5. return to the current step
6. settle and continue cleanly

### Parent mode
1. enter ready check / mission start path
2. open support/help only when needed
3. re-enter mainline without confusion
4. continue the same round
5. settle and hand off cleanly

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

- the mission flow feels more continuous
- interruption/recovery paths feel more intentional
- the user can tell what the current step is
- parent assist supports the mainline rather than competing with it
- no major regressions are introduced

---

## Output requirements
Provide a concise handoff summary with:

1. what was changed in the mission mainline
2. what weak points were found
3. what was deliberately left unchanged
4. any risky areas still needing follow-up
5. whether Phase 3 should next target core guardian or unclear interaction cleanup

---

## Final instruction to Codex
Be practical and conservative.
Do not turn this into a redesign pass.
Improve continuity, recovery clarity, and mainline confidence while preserving the current product structure.
