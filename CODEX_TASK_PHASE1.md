# CODEX TASK — PHASE 1 SAFE REFACTOR

Project: Holton Guardian App / Holton Hero System  
Path: `/Users/user/.openclaw/workspace/holton-guardian-app`
Last updated: 2026-06-29

---

## Read first
Before making changes, read these files:

1. `PROJECT_STATUS.md`
2. `ROADMAP.md`
3. `TODO.md`
4. `README.md`

These files define the current product state, refactor priority, and guardrails.

---

## Goal
Safely modularize the oversized `App.tsx` **without changing visible product behavior**.

This phase is **not** for feature expansion, redesign, or product-logic changes.

The goal is to make future development safer and faster by reducing the amount of unrelated logic packed into one file.

---

## Current context
- `App.tsx` is currently ~10.5k lines.
- It mixes:
  - types
  - static card/catalog data
  - state
  - persistence
  - helpers
  - review/reporting logic
  - UI rendering
  - styles
- The live app already contains real product logic for:
  - mission flow
  - child / parent modes
  - core guardian loop
  - guardian world / codex / events
  - support tools and parent assist
  - real session capture / handoff review
  - AsyncStorage persistence

This is a live vertical slice with technical debt, **not** a blank-slate prototype.

---

## Hard rules
Must preserve:

1. child-first product structure
2. current mission flow behavior
3. current persistence format and keys
4. current child / parent mode behavior
5. current visible UI behavior as much as possible
6. current locked product order:
   - SOP / mission mainline first
   - core guardian entry + feed chain second
   - world usability third
   - broken/unclear interactions fourth
   - visual polish last

Do **not**:
- redesign UI
- rewrite product logic
- migrate navigation architecture
- switch to Expo Router as the main runtime architecture
- add new features unless strictly required to preserve behavior during refactor
- change storage keys or snapshot schema unless absolutely necessary

---

## Required refactor sequence
Work in this order.

### Step 1 — Extract type definitions
Create a dedicated type file, for example:
- `src/types/holton.ts`

Move large type definitions out of `App.tsx`, including but not limited to:
- mission / outcome / history types
- hero / hero inventory / hero rules types
- guardian / core guardian / catalog types
- event / tool card / support guide types
- real session / handoff / review types
- persistence snapshot types

Keep naming stable unless there is a clear reason to improve it.

---

### Step 2 — Extract static catalog data
Create dedicated data files, for example:
- `src/data/timeChallenges.ts`
- `src/data/heroCards.ts`
- `src/data/guardianBeasts.ts`
- `src/data/worldEvents.ts`
- `src/data/toolCards.ts`
- `src/data/supportGuides.ts`

At minimum, move these out of `App.tsx`:
- `timeChallenges`
- `heroCards`
- `guardianBeasts`
- `worldEvents`
- `activeSkills`
- `transitionCards`
- `sopCards`
- `supportTools`
- guide maps if cleanly separable

Do not alter business rules embedded in the data unless necessary for import hygiene.

---

### Step 3 — Extract persistence helpers
Create a file such as:
- `src/lib/persistence.ts`

Move out:
- `STORAGE_KEY`
- `LEGACY_STORAGE_KEYS`
- snapshot load / hydrate helpers
- snapshot save helpers
- reset / cleanup helpers

Important:
- preserve existing snapshot structure
- preserve backward fallback behavior for legacy keys
- avoid changing the meaning of saved fields

---

### Step 4 — Extract pure helper functions
Create files such as:
- `src/lib/formatters.ts`
- `src/lib/mission-helpers.ts`
- `src/lib/review-helpers.ts`
- `src/lib/guardian-helpers.ts`

Prioritize moving:
- label functions
- formatter functions
- dedupe helpers
- taxonomy helpers
- stage/status/risk helper functions
- summary/fingerprint/reproducibility helpers

Only extract **pure functions** first.
Do not prematurely extract deeply stateful handlers if that raises regression risk.

---

### Step 5 — Extract low-risk presentational components
Create component files such as:
- `src/components/holton/SectionTitle.tsx`
- `src/components/holton/ProgressBar.tsx`
- `src/components/holton/HandoffSummarySection.tsx`
- `src/components/holton/ParentAdviceSection.tsx`
- `src/components/holton/WorldSummarySection.tsx`

Start with low-risk display-only sections.
Avoid over-fragmenting the UI in one pass.

The goal is to reduce `App.tsx` surface area while preserving behavior.

---

## Validation requirements
After refactor, run:

```bash
npm run typecheck
npm run lint
```

If practical, also run:

```bash
npm run doctor
```

Refactor is not complete unless the project remains in a healthy local state.

---

## Output requirements
When finished, provide a concise handoff summary including:

1. what files were created
2. what was moved out of `App.tsx`
3. what was intentionally left in `App.tsx` and why
4. current remaining technical risks
5. recommended next refactor or feature-safe next step

---

## Success definition
This phase succeeds if:

- `App.tsx` is materially smaller
- the project is easier to navigate
- behavior is unchanged from the user’s perspective
- future mission/core-guardian/world work becomes safer

This phase does **not** need to maximize extraction.
A conservative, behavior-safe refactor is preferred over an aggressive one.

---

## Final instruction to Codex
Be conservative.
Prefer a smaller safe refactor over a large risky one.
Do not “improve” product behavior unless a change is necessary to preserve correctness during modularization.
