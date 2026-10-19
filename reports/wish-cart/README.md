# Wish cart feedback — 2026-10-19
User requested immediate tactile/visible selection, per-item cancellation, multiple selections and one final bottom confirmation. Built on latest released guardian-motion branch; intentionally excludes unpublished login/treasure work.

Cards and explicit buttons toggle one copy of each wish. Pressed scale/color, gold selected border, check label, aria-pressed state, inline count/total. Bottom summary lists all wishes with remove/clear controls, total and post-debit balance. Only final confirmation writes. Atomic all-or-none batch rejects stale price/name, disabled items and insufficient total; submitting guard prevents duplicate clicks. Receipts retain existing shape, one per item. Original artwork, wallet, history and battle assets preserved.

Validation: TypeScript, scoped lint, web export, transaction-check.cjs; isolated Chrome check.mjs passes mobile card/button toggle, selected accessible state, cancel/remove/clear without debit, combined balance, two-item duplicate-click checkout, reload persistence, 320px no horizontal overflow. Screenshots visually inspected at 390px. Not physical iPhone testing. No user device data touched.
