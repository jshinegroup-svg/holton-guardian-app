# Tutorial skip confirmation

Requested by Jerry, Telegram 23140 (2026-10-22).

- Welcome skip/back and spotlight skip/Escape require one confirmation.
- Continue returns to the same lesson; Escape cancels confirmation.
- Explicit exploration saves a separate mainSkipped marker, not game progress.
- Village resume is shown only for newly recorded skipped main introductions, outside active tasks. Ready resumes the main walkthrough; preparing resumes the final start explanation without resetting or starting the task. Completed tasks use the existing replay ready transition.
- Main completion clears the resume marker. Legacy completed stores remain unchanged.
- Parent replay remains available. No PIN/auth/cloud/reward changes.

Verification: npm run typecheck; npm run export:web; node reports/trial-lock/skip-confirm-check.mjs. Browser suite covers 320x568, 390x650, 844x390, 768x1024; welcome and spotlight confirmation/cancel, Escape, persisted resume after reload, preparing resume, completion removal, full main/companion/music flow, unchanged balance, no premature timer. Browser simulation, not physical iPhone testing.
