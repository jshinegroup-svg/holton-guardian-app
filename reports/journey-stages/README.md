# Progressive journey artwork

User request Jerry23154, 2026-10-22: early journey pictures look unchanged; add visible variation across the other tasks/worlds.

## Delivered design

Three worlds × three chapters × six frames =54 scene states (45 completed steps plus9 dormant chapter scenes). Each atlas is3columns×2rows,512px square frames. Fixed-camera cumulative visual additions: leaf/lantern/flower/path/door; watercourse; life tree; sky base/bridge/gate; station/route/lighthouse.

`src/JourneyStageScene.tsx` displays one frame with small edge overscan to hide generated grid seams. Each chapter downloads one JPEG (~0.9MB average), so before/after toggles reuse the loaded sheet, not a separate download per frame. Total nine shipped sheets7,957,018bytes. Originals remain intact.

Replaces identical chapter photos plus simplified vector landmarks in completion reveal and journey recap; task journey window also shows current stage. Five small progress markers remain. Completion boundaries5/10/15 show the same chapter's final transition instead of comparing unrelated chapters. Static full-page background and world-map chapter scenery remain unchanged.

All task types share the same world-completion mechanism; no new reward, extra point debit, progress reset or account change. Forest step2 wording adjusted to match lit mushroom lamps. Existing saved counts immediately map to matching new artwork.

## Assets and prompts

- Built-in image_gen via imagegen skill (no CLI/API fallback).
- Complete prompts/reference paths/output provenance: [prompts.json](prompts.json).
- Shipped assets: `assets/worlds/journey-stages/{forest,sky,cosmos}-{0,1,2}.jpg`.
- Original generated PNG copies: `/Users/user/.openclaw/workspace/media/outbound/holton-journey-stages/originals/`.
- Only noncreative JPEG encoding used for delivery; cropping is game UI frame selection, not destructive image editing.

## Verification

Typecheck and web export passed. `model-check.cjs`:0..15 mapping, all-world increment/idempotence/cap, legacy world access. `browser-check.mjs`:320x568 and390x650, all45steps each (90cases), loaded correct chapter/frame, before/after and toggle-back, same-chapter boundary, saved counts/balance unchanged, dismiss and revisit journey map. Image sheets inspected; real rendered forest3 image and390px full reveal reviewed. Preview screenshots and generated artwork saved.

The old `reports/world-journeys/model-check.cjs` expects obsolete sky-first migration and fails on current forest-first behavior (0vs15); no new logic caused it. The focused current-model check passes. Browser fixtures use synthetic local data, not real player's saves. No physical iPhone or authenticated hosted gameplay claim.

V2 remains separate and untouched by this V1 change.
