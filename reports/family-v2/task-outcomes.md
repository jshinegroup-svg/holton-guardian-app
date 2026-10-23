# Task timeout outcomes — 2026-10-23

Authorized by Jerry: implement the proposed completed / keep going / stop unfinished flow.

- Timed focus reaches duration: show three actions; untimed focus uses a 10-minute check-in, not a forced deadline.
- Complete keeps existing finishing ceremony and reward transaction.
- Keep going persists the same session; help-card usage does not reset, no reward is issued.
- Stop records unfinished, actual focused seconds (excluding help pauses), selected help cards, reward zero. No balance, journey, daily completion, or draw progress increment. Named encouragement replaces success presentation.
- Parent daily and weekly records distinguish outcomes; legacy records remain completed. New backup fields round-trip and legacy journey migration excludes unfinished attempts.
- Uses existing pending-operation retry and task_cancelled telemetry; no database migration.

Verification:
- TypeScript and web export passed.
- 11 node tests: backup roundtrip, weekly/journey exclusion, help-card limits, request timeout, idempotent retry, ownership and revision protection.
- task-outcome-check.mjs: 320/390 mobile viewports, focus-screen choices, continue/reload, response-lost stop and retry once, no rewards/progress, next task reset, completed path, duo sibling isolation.
- Existing browser-check.mjs: 320/390/844/900 regression passed; timers, completion, profile names and bubbles, duo/solo navigation.
- Browser emulation, not a physical iPhone test.
