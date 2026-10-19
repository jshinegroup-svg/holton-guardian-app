# Full wish catalog — 2026-10-19

User reported missing original rewards and promised magic scroll/chest cards. Built on released wish cart branch, not the unpublished authentication/treasury branch. No auth functionality claimed or changed.

## Inventory
Google Drive Rewards System has 11 images: ten reward fronts plus one gold Rewards System chest cover. Original four toy/drink/family/movie remain unmodified. Added six intact original fronts: snack (source filename typo Snake, image verified SNACK), indoor, outdoor, any activity, outdoor adventure, any game. Cover extra.png is used as gold custom-card art, not an invented eleventh reward.

Original Drive IDs and filenames recorded in prompts.json. No sharing permission changes. New custom scroll.png and crystal.png generated with built-in image_gen; complete prompts in prompts.json; gold chest uses user's existing Drive image. Final assets assets/cards/rewards/ and assets/cards/rewards/custom/.

## Behavior
Additive catalog merges missing IDs without replacing old titles, prices, enabled states, receipts, or balance. Ten originals available in settings, disabled until explicitly enabled; no automatic price/debit change. Suggested prices clearly labeled new recommendations; not historical prices. Three unnamed custom slots, extensible to five, with chosen gold/scroll/crystal illustration, editable title/price/optional agreement. Only named, enabled, priced items shown in shop. Custom card names rendered as legible caption within card component. Shop includes reminder to open Settings for additional cards.

Existing multiselect cart retained, one of each per batch, atomic final checkout. New receipts store item ID, title, price, style, agreement, balance before/after. Subsequent edits do not mutate receipts. Changes to terms/style between preview and transaction reject entire batch. Existing historical records unchanged.

## Verification
TypeScript, scoped ESLint, web export; model checks: additive idempotent migration, snapshots, stale terms, atomic checkout and duplicate guard. Isolated Chrome tests: old four-card migration to 10 + 3, preservation of custom old price and receipt, six new cards enabled, custom title/price/terms/style, 5-slot maximum, empty hidden, mixed original/custom batch debit, reload, immutable receipts, 320px layout. Prior cart tests pass. Screenshots inspected. Not physical iPhone verification; test data never touches user's device.
