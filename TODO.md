# Holton Hero System — TODO

Last updated: 2026-06-29

This TODO is meant for the next Codex handoff. It is intentionally practical and execution-oriented.

---

## P0 — Immediate

### [ ] 1. Create safe module boundaries around `App.tsx`
**Why:** Current app logic is too concentrated in one file.

**Tasks:**
- [ ] extract type definitions from `App.tsx`
- [ ] extract static card / catalog data
- [ ] extract AsyncStorage snapshot helpers
- [ ] extract mission helper functions
- [ ] extract real-session review / taxonomy helpers
- [ ] extract at least 3-5 major presentational sections into components

**Done when:**
- [ ] `App.tsx` is materially smaller
- [ ] `npm run typecheck` passes
- [ ] runtime behavior is unchanged

---

### [ ] 2. Audit active child/parent mainline for regression risk
**Why:** The project already has many states and toggles.

**Tasks:**
- [ ] verify `ready → challenge → sop → settle` still reads correctly in child mode
- [ ] verify the same chain still works in parent mode
- [ ] verify pause / breather / support return paths
- [ ] verify post-wrap-up continuation path
- [ ] identify any “click happened but visible state didn’t clarify enough” actions

**Done when:**
- [ ] mainline has no obvious ambiguous transitions
- [ ] all major CTAs have visible results

---

## P1 — Core mission product quality

### [ ] 3. Tighten SOP continuity after interruptions
**Tasks:**
- [ ] inspect current blocked-step / return-step behavior
- [ ] make the “come back here first” cue consistently visible
- [ ] reduce duplicate guidance while preserving clarity
- [ ] ensure support return never loses the next step

---

### [ ] 4. Re-test time challenge closure behavior after refactor
**Tasks:**
- [ ] confirm active-round state is still separate from selection state
- [ ] confirm mid-round challenge switching is still blocked/confirmed
- [ ] confirm cancel-current-round still works
- [ ] confirm pause / breather fullscreen return path still works
- [ ] confirm orb rewards still match locked rule

**Locked reward rule:**
- 3 min = 1 orb
- 5 min = 1 orb
- 10 min = 2 orbs
- 15 min = 3 orbs
- 20 min = 4 orbs
- 25 min = 5 orbs
- Mission Quest = 5 orbs

---

## P2 — Core guardian / emotional center

### [ ] 5. Improve core guardian first-read clarity
**Tasks:**
- [ ] review home entry around core guardian card
- [ ] make current guardian status easier to read
- [ ] verify creation / recommendation / naming flow still feels coherent
- [ ] reduce stat-heavy feel where it weakens emotional bond

---

### [ ] 6. Strengthen feed-success feedback chain
**Tasks:**
- [ ] verify feed-success expression state always triggers correctly
- [ ] ensure visible happy reaction is obvious enough
- [ ] make weekly feed progress feel more “alive” and less dashboard-like
- [ ] confirm post-feed return state still supports the mainline instead of distracting from it

---

### [ ] 7. Validate guardian persistence consistency
**Tasks:**
- [ ] create guardian
- [ ] feed guardian
- [ ] reopen app
- [ ] verify stage / level / weekly feed / name / archetype all persist correctly
- [ ] verify reset behavior does not leave partial stale state

---

## P3 — Guardian world usability

### [ ] 8. Improve world entry readability
**Tasks:**
- [ ] inspect current world-entry information order
- [ ] keep “world comes after core guardian” priority intact
- [ ] make current recommended next look clearer
- [ ] reduce any leftover “functional list” feeling

---

### [ ] 9. Improve codex / collection state presentation
**Tasks:**
- [ ] visually differentiate unknown / defeated / captured more clearly
- [ ] make showcase / latest-result framing easier to read
- [ ] evaluate whether rarity needs stronger treatment now or later

---

### [ ] 10. Evaluate single-beast detail page feasibility
**Tasks:**
- [ ] decide whether to implement now or defer
- [ ] if implemented, keep it lightweight and collection-oriented
- [ ] do not let it destabilize the current mainline

---

## P4 — Parent assist quality

### [ ] 11. Reduce parent-layer information overload risk
**Tasks:**
- [ ] inspect which parent cards are too text-heavy
- [ ] shorten “first thing to do” guidance
- [ ] preserve short-action-first behavior
- [ ] keep longer explanation secondary

---

### [ ] 12. Re-check support tool vs parent advice interaction
**Tasks:**
- [ ] verify “direct call card” path is clearer than “I don’t know what to do” path
- [ ] verify support-tool toggles do not hide critical next actions
- [ ] simplify if two neighboring parent flows feel redundant

---

## P5 — Real-session / operator layer

### [ ] 13. Document what belongs to caregiver operations vs child runtime
**Tasks:**
- [ ] list real-session fields that are essential
- [ ] list fields that can be optional or deferred
- [ ] identify what should later move into a separate operational surface

---

### [ ] 14. Validate handoff summary output
**Tasks:**
- [ ] ensure review board and handoff text are internally consistent
- [ ] ensure failure/recovery taxonomy reads clearly
- [ ] ensure operator priority / next action language is actionable

---

## P6 — Build readiness / environment

### [ ] 15. Run full preflight when preparing next device share
**Tasks:**
- [ ] `npm run doctor`
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build:readiness`
- [ ] `npm run export:web`

---

### [ ] 16. Verify preview build lane only when needed
**Tasks:**
- [ ] confirm Expo auth state
- [ ] confirm EAS project linkage
- [ ] use Android preview first when fast device sharing is needed
- [ ] treat iOS/TestFlight as separate credential-dependent path

---

## Nice-to-have / Later

### [ ] 17. Clean leftover scaffold ambiguity
**Tasks:**
- [ ] decide whether `app/` Expo Router starter files are still needed
- [ ] either remove dead scaffold or formally migrate architecture later

### [ ] 18. Add explicit changelog / handoff convention
**Tasks:**
- [ ] define one small changelog format for future Codex passes
- [ ] keep handoff notes short and module-based

---

## Current “don’t break these” rules

- [ ] preserve child-first structure
- [ ] preserve time challenge as the real first child action
- [ ] preserve visible reaction over hidden state
- [ ] preserve core guardian as emotional main character
- [ ] preserve one-module-at-a-time development rhythm
- [ ] do visual polish last, not first

---

## Fast restart commands

```bash
cd /Users/user/.openclaw/workspace/holton-guardian-app
npm install
npm run typecheck
npm run start
```

Useful extra checks:

```bash
npm run lint
npm run doctor
npm run build:readiness
npm run export:web
```
