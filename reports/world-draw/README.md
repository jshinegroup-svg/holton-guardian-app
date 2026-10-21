# World draw card-back refresh

User-approved layout uses supplied black/gold WORLD EVENT CARDS image, preserved unedited at assets/world-draw/world-card-back.jpg. Source: Telegram 22927 second attachment (2026-10-21). No generated replacement art.

Compact centered heading/reason, full uncropped card back (up to 140x210), soft gold glow, encouragement, full-width action. Artwork scales with viewport height; modal remains scrollable for short screens and large text. Saved card reveals with a 580ms Y flip after its image loads. Reduced motion skips the flip. Existing draw persistence/randomization/collection/reward rules are untouched. Reloads of revealed draws show the same face directly.

Validation: npm run typecheck; base-path production export; actual isolated Chrome 390/320 x 640 browser suite, screenshots visually inspected. Both buttons/card fit; rapid five-click draw creates only one collection entry, no points awarded; reload keeps exact drawn card; accept dismisses pending draw only; reduced-motion draw passes. No real player storage touched.
