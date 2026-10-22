# Guardian exchange schedule setting

User authorization: Jerry23143 (2026-10-22).

- 家長小屋 → 設定與教學 replaces 偏好與舊卡, including tutorial text.
- 僅限星期日兌換 defaults on for missing/legacy data. Only boolean false removes the Taipei weekday restriction.
- Shared date helper used by UI and the atomic begin-challenge transaction. Cost, stage prerequisites, sufficient balance, active-task lock, single debit and single grant remain unchanged.
- Setting persists, survives reset, and is included in validated portable backups. Old backups without it retain default Sunday behavior.
- Existing receipt source `sunday` remains the backward-compatible paid guardian receipt category; actual acquisition timestamp remains accurate. World-card daily exchange limit unchanged.
- Verification: typecheck/export; exchange-days-model.cjs (Taipei midnight boundaries, defaults, strict bool, guards, duplicate safety, new/legacy backup roundtrip); exchange-days-check.mjs at320/390 (Thursday UI blocked by default, switch off, reload, actual challenge with reload mid-flow and exact10point debit, re-enable blocked). Synthetic local browser data only; actual iPhone not tested.
