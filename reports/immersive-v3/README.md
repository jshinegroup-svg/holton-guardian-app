# Immersive revision 3 — 2026-10-19

Reference: user's three-scene screenshot attached 2026-10-19. Real interface, not screenshot-as-UI.

- Original challenge and support card images preserved, framed in a decorative stone pedestal.
- Gold-trimmed scene title, teal beveled interactive controls, crystal clock.
- Home, focus and rest have distinct static painterly backgrounds.
- Existing tier rewards, pauses, cleanup confirmation and persistence unchanged.
- Controls retain semantic labels and touch sizes; scrolling remains available on small screens and large text.
- Parent PIN/recovery work is separate and not included in this visual deployment. No live recovery service configured.

## Generated assets
Built-in imagegen skill, no external CLI. Originals kept in generated_images/01a151df-1701-7363-8794-9cf25de24b98/.

card-pedestal.png: Front-view freestanding carved warm ivory stone card frame with antique gold bevels, turquoise crystal finial, moss and three-step plinth, pink crystals at corners. Empty central opening for original card. No text, no card image, no scenery. Follow-up: preserve frame and remove inside/outside background to transparent alpha.

island-v3.png: Portrait 9:16 lush richly detailed painterly fantasy floating-island courtyard, blue sky, distant floating castles/waterfalls, turquoise portal at left, leafy top corners, mossy pale stone foreground, pink crystals and flowers. Calm center for real UI. No text/characters/cards/UI.

focus-v3.png: Portrait 9:16 serene twilight floating-island platform, violet layered mountains/castles, peach horizon, teal river, mossy circular stone foreground, golden branches and tiny pink crystals. Subdued center, no UI/text/characters/cards.

rest-v3.png: Portrait 9:16 sun-dappled woodland resting camp, curved branches overhead, turquoise distant waterfall, mossy path, backpack and mug at bottom edges, pink flowers/cyan crystals. Open center, no UI/text/characters/cards.

## Checks
Run npm run typecheck, scoped eslint, web export, reports/immersive-v3/browser-check.mjs with isolated Chrome storage. Screenshots contain synthetic test data, not real user wallet.
