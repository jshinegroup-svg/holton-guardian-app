# Idle notebook text repaint — 2026-11-19

User 24544 reported stationary/no-touch flicker with video. Prior photo isolation did not fully address it.

Observed baseline: over 1,000 repeated native date-input type/name attribute writes in 6.5 seconds; photo node/source remained stable. This is a plausible WebKit repaint trigger, not proof of the physical iPhone root cause.

Fix: memoize native date control with stable change callback. Preserve dates, busy/timer disable rules, styles and all progress logic.

Verification: typecheck and web/offline export passed. Chromium mobile 320x740,390x844,844x390: zero idle subtree mutations and zero photo reload/removal. 65-second 390x844 run, native date editing, pageshow, explicit cloud refresh, close/back passed; synthetic child state unchanged. All backend requests isolated to synthetic fixtures. Real iPhone acceptance remains pending.
