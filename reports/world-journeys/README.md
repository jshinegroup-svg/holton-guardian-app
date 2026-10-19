# World map and story journeys — 2026-10-19

## Approved scope
User approved discussed story design and asked to complete it for playtesting. Delivered a shared world-map home, three playable themed task worlds (Sky Base, Forest Sanctuary, Cosmic Expedition), three five-completion chapters per world, and permanent step records. All worlds use existing original physical challenge/help/finish cards and existing companion collection. This release adds distinct environments/stories, NOT new world-specific guardian catalogs or real-time exploration controls.

## Rules
- Initial map chooses a world; in-flight preparation/active/help/cleanup reloads restore the actual task directly, not the map. World changes only from ready/done; entering world moves to ready without charging or granting anything.
- Each confirmed cleanup contributes one journey step in the current world, regardless of minutes, task type, help or rest. Task reward, task history and journey step are persisted together in the existing transaction. No new currency, no spending, no resets or streak requirements.
- Every5 completions ends a chapter; Sky15 unlocks Forest, Forest15 unlocks Cosmos. Cosmos15 finishes the three-world journey and shows a commemorative title. Completed worlds remain freely visitable; further tasks there still grant normal rewards but cannot advance another world's journey.
- Migration credits unique dated historical task receipts to Sky up to15; retains ALL history, points and collection. Extra old tasks do not pretend the child already explored Forest/Cosmos. Migration idempotent, no retroactive points.
- Each of45 steps has a story sentence, saved progress and dynamic vector landmark overlays. Chapter map reveals completed sentences while future step details remain hidden. Landmarks represent progress; painterly scenery remains calm/static.
- At completion a three-second fade-in story card can be skipped. Reduced-motion shows static card with Continue. Event persists across reload until dismissed, without repeating grant. Existing world-card draw takes priority, then pending story is shown. Progress view always available outside tasks.
- Shared wish shop, guardian challenge, balance, history, and collection retained. Original20 battle movies unchanged.

## Assets
Built-in image_gen created assets/worlds/journeys/{map,forest,cosmos}.png; full prompts in prompts.json. No original card altered. Sky scenes retained. Forest/Cosmos focus/rest apply darker calm overlays to their own environment. Small state-dependent landmarks are inline SVG UI overlays (not replacement raster scenery). RN-web re-encodes utf8 SVG data URLs, so use charset=utf-8 with encoded source; verified naturalWidth230 in browser.

## Verification
- Typecheck and scoped lint pass, Expo export succeeds.
- Model tests cover45steps, chapter/world boundaries, idempotent migration, unique historical receipts, no carryover, active switching lock, capped completion, duplicate IDs, shared data preservation.
- Isolated390/320 Chrome covers fresh map/locks, actual task/help/cleanup for all three worlds, no credit before cleanup, double-click single reward/step, write failure atomicity, reload/pending story, step5 and15, world-card draw priority, all unlocks/free revisit, history migration, active recovery, reduced and timed reveal. Landmarks confirmed loaded and screenshots visually reviewed.
- Adapted prior wish cart/catalog suites verify entry through map, mixed checkout, custom card config/snapshots and prior data. Initial old helper accessed document.body before DOM existed; guarded body and reran. Not a product failure.
- Tests use isolated browser storage only, not user's phone. No physical iPhone claim.
