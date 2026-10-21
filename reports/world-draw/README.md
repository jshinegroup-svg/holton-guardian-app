# World draw card-back refresh

User-approved layout uses supplied black/gold WORLD EVENT CARDS image, preserved unedited at assets/world-draw/world-card-back.jpg. Source: Telegram 22927 second attachment (2026-10-21). No generated replacement art.

Compact centered heading/reason, full uncropped card back (up to 140x210), soft gold glow, encouragement, full-width action. Artwork scales with viewport height; modal remains scrollable for short screens and large text. Saved card reveals with a 580ms Y flip after its image loads. Reduced motion skips the flip. Existing draw persistence/randomization/collection/reward rules are untouched. Reloads of revealed draws show the same face directly.

Validation: npm run typecheck; base-path production export; actual isolated Chrome 390/320 x 640 browser suite, screenshots visually inspected. Both buttons/card fit; rapid five-click draw creates only one collection entry, no points awarded; reload keeps exact drawn card; accept dismisses pending draw only; reduced-motion draw passes. No real player storage touched.

Public verification: dc5397a2589c45bbdca75487286ae41a bundle matched; full PUBLIC browser suite PASS; screenshots refreshed and visually inspected. Source85dd34d; Pages668586c retains historical hashed assets for cached clients.

## Ceremony (Jerry22936)
- Waiting: 3.6s gentle breathing radial gold aura, +/-3px float and six soft glints.
- Saved result: 2.5s choreography, first 1s particles gather and card expands 5.5%, then Y flip with expanding gold ring, then details fade in. Buttons stay disabled during reveal. Cold image load waits with status; reload of saved draw skips ceremony. Reduced motion skips all continuous/reveal/departure animation. No audio.
- Collect: 260ms shrink/fade, guarded against repeated activation; storage failure restores card/button for retry. Original parent persistence/random choice/point rules unchanged.
- Local typecheck/export and 320/390 suite pass, including details hidden during reveal and reload mid-animation preserving the exact card; screenshots inspected.

Ceremony PUBLIC verification PASS: bundle c5525599dacef3f187a71b8c9feacfd1; Pages89f6722 run39550478460 successful. 320/390 layout, details timing, mid-animation reload, five clicks once, collect, reduced-motion immediate/no-ring, unchanged balance.

Jerry22939 requested a slower reveal: total2.5s, gathering1s, existing reduced-motion and persistence unchanged.
