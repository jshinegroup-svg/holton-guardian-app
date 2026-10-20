# Card library and wish shop performance — 2026-10-21

Jerry22898 requested applying time-card optimization to other cards, especially wish shop.

Audited card assets referenced by catalog, shop and energy math. Left already-small assets and previously optimized time cards unchanged. Preserved all originals. Created42 non-destructive mobile derivatives,900px long edge JPEG75 (alpha sources would retain PNG). Total89,231,108B ->7,991,067B (~91% reduction):20 core-guardian stages,5 guardian cards,5 energy math,12 large reward/custom images. Reward subset24,447,516B ->1,920,805B; already-small game card unchanged. Full manifest in asset-sizes.json.

DeferredCardImage in shop/settings reserves the exact image layout, mounts native Image once within450px of viewport using IntersectionObserver on web, and retains it after scrolling away. Native/unsupported-browser fallback loads normally. Applies to catalog art and custom style previews. No global eager preload of large libraries. No changes to prices, transactions, stored data, timers or card art designs.

Typecheck/export, lint, transaction model and actual390/320 Chrome checks: initial1of13 shop images, all13 loaded/decoded on scroll, no reload on backscroll, custom styles correct, selection/removal no debit, double-click checkout charged once, reload receipts unchanged. All42 exported derivative files fetched and decoded in browser. Screenshot review of shop/custom art passed. Physical iPhone latency unmeasured.
