# Holton Hero System / Codex Spec v0.1

Date: 2026-06-30  
Project: Holton Guardian App  
Source app: `App.tsx`, `src/types/holton.ts`, `src/data/holtonCatalog.ts`

## 1. Purpose

This document captures the current Hero System and Codex logic that already exists in the Holton Guardian App.

This is **not** a redesign. It is a stabilization map for the existing system so future Codex / app work can preserve the intended product logic.

## 2. Product Intent

The app is not just a card gallery. It is a guided behavior-support system where real task progress creates collectible/usable game objects.

Core loop:

```text
Mission / Challenge completion
→ Orbs / bonus resources
→ Tool cards / badges / guardian traces
→ Weekly Hero summon or Guardian progression
→ Hero / Guardian Codex record
→ Showcase / companion / retired / collection state
```

The child-facing experience should feel like:

```text
Do one real step
→ See visible response
→ Earn something
→ Keep a companion / hero / page in the world
```

The parent-facing experience should feel like:

```text
Guide the current round
→ Recover from interruption
→ Record what happened
→ Preserve continuity across sessions
```

## 3. Primary Runtime Systems

### 3.1 Mission Mainline

Mission phase states:

```ts
ready | challenge | sop | settle
```

Current flow intent:

1. `ready` — confirm the child is ready to enter the round.
2. `challenge` — time challenge / active round.
3. `sop` — step-by-step task support.
4. `settle` — reward, recovery, wrap-up, and return-to-mainline.

The Hero and Codex systems should not compete with this mainline. They should reinforce it after meaningful progress.

### 3.2 Economy Resources

Current resource families:

- `orbs`
- `bonusOrbs`
- `toolCardInventory`
- `guardianTraces`
- `guardianChallengeTokens`
- `collectedBadges`
- `heroUpgradeLevel`
- mission history / real session records

The economy is intentionally behavioral: rewards are tied to progress, recovery, and completion, not passive tapping.

## 4. Hero System

### 4.1 Hero Card Catalog

Hero cards currently live in `heroCards`.

Current Hero cards:

| ID | Name | Kind | Role |
|---|---|---|---|
| `focus-knight` | Focus Knight | support | 專注支援 |
| `calm-commander` | Calm Commander | support | 情緒穩定 |
| `mission-finisher` | Mission Finisher | support | 完成推進 |
| `restart-champion` | Restart Champion | support | 重啟支援 |
| `mindsteel-ranger` | Mindsteel Ranger | support | 結構守護 |
| `hero-upgrade-elite` | Hero Upgrade - Elite | ascend | 主角升階 |
| `holton-reward` | Holton Reward Hero Card | ascend | 主角獎勵 |
| `holton-ascend` | Holton Hero Ascend | ascend | 主角升階 |

### 4.2 Hero Codex Numbering

Hero Codex number is generated from catalog order:

```text
HC-01, HC-02, HC-03, ...
```

Current logic:

```ts
HC-${String(heroCards.findIndex(hero) + 1).padStart(2, "0")}
```

Important rule:

- `HC-xx` is a Codex display number.
- It should not be treated as gameplay identity.
- Stable gameplay identity is the hero `id`.

### 4.3 Hero Collection State

Stored as:

```ts
Record<string, HeroCollectionRecord>
```

Fields:

```ts
heroId: string
unlocked: boolean
summonCount: number
lastSummonedAtDay?: number
lastExpiredAtDay?: number
```

Meaning:

- `unlocked` = appears as collected / available in Hero Codex.
- `summonCount` = number of times summoned.
- `lastSummonedAtDay` = most recent summon day.
- `lastExpiredAtDay` = day service period ended.

### 4.4 Weekly Hero State

Stored as:

```ts
WeeklyHeroState
```

Fields:

```ts
heroId: string
daysLeft: number
usesLeft: number
summonedAtDay: number
retired?: boolean
```

Current default:

```text
Focus Knight
7 days
3 uses
summonedAtDay = 1
retired = false
```

### 4.5 Hero Service Period

Current rule:

```text
Weekly Hero service lasts 7 days.
```

Runtime expiration:

```ts
elapsedDays = daysInSystem - summonedAtDay
nextDaysLeft = max(0, 7 - elapsedDays)
if nextDaysLeft <= 0 → retired = true, usesLeft = 0
```

When the hero expires:

- `weeklyHero.retired = true`
- `weeklyHero.usesLeft = 0`
- `heroCollection[heroId].lastExpiredAtDay = daysInSystem`
- User-facing message says the hero has returned / needs re-summon.

### 4.6 Tool Card Crafting

Tool card inventory:

```ts
owned: number
craftedTotal: number
spentForSummon: number
craftCostOrbs: number
summonCostTools: number
```

Current default:

```text
owned = 2
craftedTotal = 2
spentForSummon = 0
craftCostOrbs = 6
summonCostTools = 5
```

Crafting rule:

```text
6 orbs → 1 tool card
```

If not enough orbs, show missing orb count.

When crafting succeeds:

- subtract `craftCostOrbs` from `orbs`
- increment `toolCardInventory.owned`
- increment `toolCardInventory.craftedTotal`

### 4.7 Weekly Hero Summon

Summon requirement:

```text
5 owned tool cards → summon selected weekly hero
```

If not enough tool cards, show missing card count.

When summon succeeds:

- subtract `summonCostTools` from owned tool cards
- increment `spentForSummon`
- set `weeklyHero.heroId = selectedHero.id`
- set `weeklyHero.daysLeft = 7`
- set `weeklyHero.usesLeft = heroRuleBook[selectedHero.id].baseUses`
- set `weeklyHero.summonedAtDay = daysInSystem`
- set `weeklyHero.retired = false`
- update `heroCollection[selectedHero.id]`
- increment `guardianChallengeTokens` by 1

Important product meaning:

```text
Summoning a hero is not only a collection action.
It also opens one Guardian challenge opportunity.
```

### 4.8 Hero Rule Book

Current rules:

| Hero ID | Skill | Base Uses | Effect Intent |
|---|---:|---:|---|
| `focus-knight` | Focus Retry | 3 | legal refocus / stop timer / return to task |
| `calm-commander` | Calm Shield | 3 | emotion buffer / stop timer / return calmly |
| `mission-finisher` | Finish Push | 3 | +1 orb and task completion push |
| `restart-champion` | Restart Boost | 3 | interruption recovery / restart support |
| `mindsteel-ranger` | Mindsteel Guard | 3 | structure stabilization, + task/emotion support |
| `holton-reward` | Reward Echo | 2 | completion bonus +1 orb |
| `holton-ascend` | Ascend Window | 2 | upgrade window / higher challenge support |

### 4.9 Hero Skill Use

Common rule:

- if hero is expired/retired → cannot use
- if `usesLeft <= 0` → cannot use
- otherwise decrement `usesLeft`

Hero-specific effects currently include:

- Focus Knight: stops running, increases focus power.
- Calm Commander: stops running, increases emotion power.
- Mission Finisher: adds orb, increases task power.
- Restart Champion: stops running, increases focus/task power.
- Mindsteel Ranger: stops running, increases task/emotion power.
- Holton Reward: adds orb.
- Holton Ascend: stops running, increases task/focus power.

UX rule:

```text
Every hero use must produce visible feedback in message state.
```

## 5. Guardian / Beast Codex

### 5.1 Guardian Beast Catalog

Current Guardian Beasts:

| ID | Name | Vibe | Challenge Cost |
|---|---|---|---:|
| `tidefin` | Tidefin Shark | 衝刺/行動型 | 10 |
| `stoneback` | Stoneback Tortoise | 穩定/防禦型 | 10 |
| `emberwing` | Emberwing | 熱啟/爆發型 | 20 |
| `steel-eagle` | Steel Eagle | 專注/高空視野型 | 20 |
| `bramblefang` | Bramblefang | 野性/突破型 | 30 |

Each beast has growth stages:

```text
Mini → Mid → Final → Legendary
```

Stage costs currently appear as:

```text
10 / 20 / 40 / 60
```

### 5.2 Guardian Codex Numbering

Guardian Beast number is generated from catalog order:

```text
GB-01, GB-02, GB-03, ...
```

Current logic:

```ts
GB-${String(guardianBeasts.findIndex(beast) + 1).padStart(2, "0")}
```

Important rule:

- `GB-xx` is display/codex number.
- Beast gameplay identity remains `beast.id`.

### 5.3 Guardian Catalog State

Stored as:

```ts
Record<string, GuardianCatalogRecord>
```

Fields:

```ts
beastId: string
status: "unknown" | "defeated" | "captured"
defeatedCount: number
capturedAtDay?: number
sourceEventTitle?: string
sourceEventFamily?: EventCard["family"]
sourceEventReward?: string
title: string
rarity: "Common" | "Rare" | "Epic" | "Legendary"
showcase: boolean
companion: boolean
```

Meaning:

- `unknown` = not yet encountered.
- `defeated` = encountered/defeated but not captured.
- `captured` = officially in Codex.
- `showcase` = currently displayed as Codex/hero visual focus.
- `companion` = weekly/active companion presence.

### 5.4 Codex Focus Logic

The home/Codex focus tries to prioritize:

1. newly captured guardians today
2. captured guardians
3. encountered but not captured guardians
4. unknown guardians if no progress exists

Product intent:

```text
The child should first see what was actually earned or changed today.
```

### 5.5 Showcase Rule

Guardian can be marked as showcase.

Product meaning:

```text
Showcase is not just decoration.
It is the “put this card on the table / front page” action.
```

The UI message should confirm when a newly captured guardian is displayed.

## 6. Core Guardian System

The app also has a persistent core guardian / bonded companion layer.

Core Guardian state includes:

- `empty`
- `provisional`
- `bonded`

Associated state includes:

- selected guardian ID
- custom name / line
- personality / element / color choices
- archetype / state variant
- level
- weekly feed count and target
- total feed count
- week index
- reselect window and reselect count

Important current rules:

- provisional guardian can be reselected under constraints
- bonding is a more permanent state
- feeding progresses weekly relationship / level
- core guardian should support the mission, not become a competing second mission

## 7. Codex Surfaces

### 7.1 Hero Codex

Hero Codex should show:

- `HC-xx`
- hero name
- rarity
- role
- power
- unlocked / locked state
- summon count
- current weekly hero state if applicable
- remaining uses / service time if active

### 7.2 Guardian Codex

Guardian Codex should show:

- `GB-xx`
- beast name
- vibe
- rarity
- status
- defeated count
- captured day
- showcase / companion state
- stage progress if applicable

### 7.3 World / Codex Home

World home should answer:

```text
What changed today?
What should I look at first?
What is currently with me in the mission?
```

It should not overload the first screen with all collection data.

## 8. Persistence Boundaries

Persistence currently uses extracted helpers in `src/lib/persistence.ts`.

Important rule:

```text
Do not change snapshot key or persistence schema casually.
```

The Phase 1 refactor intentionally preserved the storage behavior.

Spec implication:

- future Codex schema changes need explicit migration plan
- do not rename state fields just to make the code prettier
- if splitting storage later, preserve backwards compatibility

## 9. Current UX Principles to Preserve

1. **Mission first** — Hero/Codex supports the mission, not replaces it.
2. **Visible reaction matters** — every earned item / summon / hero effect needs visible feedback.
3. **Child-first wording** — the child needs to know the next action, not the full system model.
4. **Parent second** — parent guidance should clarify recovery and return-to-mainline.
5. **Codex is proof of progress** — not a passive archive.
6. **Retired does not mean deleted** — expired heroes remain part of collection history.
7. **IDs are stable** — `id` is gameplay identity; `HC-xx` / `GB-xx` are display numbers.

## 10. Known Gaps / Next Decisions

### 10.1 Hero Retirement UX

Current system tracks retirement, but future spec should decide:

- Is retired hero shown in a separate section?
- Can retired heroes be re-summoned immediately if requirements are met?
- Should retired cards get a visual stamp / archive style?

### 10.2 Tool Card vs Badge Language

The app currently has:

- tool card inventory
- badges as summon materials / milestones
- UI wording that sometimes says tool cards, badges, or summon token

Need decide the canonical product language:

```text
Option A: Orbs → Tool Cards → Hero Summon
Option B: Orbs → Badges → Summon Token
Option C: Orbs → Tool Cards, Badges are separate milestones
```

Current implementation is closest to Option C but UX copy is not fully normalized.

### 10.3 Hero Selection Eligibility

Current summon logic depends on selected hero having a `heroRuleBook` entry.

Need decide:

- Should all Hero cards be summonable?
- Are `ascend` cards summonable weekly heroes, milestones, or upgrades?
- Should locked heroes appear in summon list or only Codex?

### 10.4 Guardian Challenge Loop

Current summon grants +1 guardian challenge token.

Need clarify:

- What exactly consumes the token?
- What transforms `defeated` into `captured`?
- Does capture require orbs, challenge success, or world event?

### 10.5 Codex Data Model

Current data is state-heavy in `App.tsx`.

Future refactor could split:

```text
heroCatalog
heroRuntimeState
heroCollectionState
guardianCatalog
guardianRuntimeState
codexSelectors
```

But this should happen only after the product terms above are confirmed.

## 11. Recommended Next Step

Do **not** jump directly into new features.

Recommended sequence:

1. Confirm this spec with Jerry.
2. Normalize product language for Hero summon materials.
3. Decide retired hero display behavior.
4. Decide whether `ascend` cards are summonable weekly heroes or milestone cards.
5. Then ask Codex to do a small Phase 1.5 refactor:
   - move hero initial state into dedicated module
   - move guardian initial state into dedicated module
   - add selector helpers for Codex display
   - keep behavior unchanged

## 12. Suggested Codex Phase 1.5 Brief

```text
Read `reports/holton-hero-system-codex-spec-2026-06-30.md`.
Do not add features.
Do not change product logic.
Do not change persistence schema.
Extract Hero/Codex initial states and pure selectors from App.tsx into dedicated modules.
Keep HC/GB numbering behavior unchanged.
Run npm run typecheck after each step.
```
