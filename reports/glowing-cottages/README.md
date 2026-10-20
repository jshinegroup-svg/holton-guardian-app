# Real glowing cottages — 2026-10-20

Jerry requested actual house-shaped entrances, directly clickable, with initial light so parents know they can enter (Telegram22805).

Four independent illustrated cottages replace emoji cards: compass/map lodge, golden star/gift cottage, paw/shield companion lodge, heart/terracotta parent cottage. Whole building and real text plaque share one accessible button. The existing village background stays decorative; each foreground cottage is a real interactive target, not a link hidden in a backdrop.

Built-in image_gen generated the transparent RGBA 2×2 atlas `assets/worlds/village/cottages.png`. No raster editing; each cell is cropped at runtime. Exact final prompt in `image-prompt.json`. Soft welcome halo/window brightness runs 3 cycles (~8 seconds), then steady warm art remains. Touch presses scale down; desktop hover and keyboard focus remain visible. System/app reduced-motion setting disables animation but leaves warm windows. Original navigation and balances/records unchanged.

## Verification
TypeScript, scoped ESLint and web export passed. Browser QA uses isolated Chrome at320/390, not physical phones. `browser-check.mjs` checks four sprites, changing entry light/finite count, actual touch on building body + pressed feedback, keyboard Enter, both reduced-motion controls, all destination/return links, parent price defaults/override/reload, old-state no-write navigation, map locks, active/preparing/finishing resume, one award, wish cart/cancel/checkout/reload.

Public release verified: Pages `7da0c9a77bbb045fe17a9180714bd576fa739151`, run `39408580762` built successfully; public full browser suite PASS and cottage atlas SHA256 matches local. Screenshot `public-share-village-390.png` shows fresh-family zero state in isolated profile (390×950); no real user data modified. No physical-device claim.
