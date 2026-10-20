# Family onboarding and progress tools

- Skippable first-use guide; existing saves are not forced through onboarding.
- Parent anti-mistap confirmation by two-second hold or accessible arithmetic; not authentication.
- Weekly Taipei-time footprints based on real task/help records and pending wishes.
- Versioned local JSON export/import, strict validation and replacement preview; no merging or cloud sync.
- Restore and restart retain one browser-local pre-operation snapshot, written before replacing the main save. Long-term retention requires downloading a backup.
- Restart clears game progress while preserving wish settings, daily goal and animation preference. Exact confirmation is required; active tasks/challenges block replacement.

Validation: typecheck, scoped ESLint, model-check.cjs, browser-check.mjs and regression/browser-check.mjs. Isolated synthetic browser data only. Mobile widths 320/390 are browser emulation, not physical-device testing. Browser tests cover actual download/file import, storage-write failures, cancellation, restore/reset/recovery, gate input and existing task/shop/map flows.

The four differentiated architecture concepts are a proposal only; this release retains the existing integrated village artwork.
