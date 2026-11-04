# English detail pass — 2026-11-05

Requested by Jerry: remaining Chinese in the English interface.

- Translate composite JSX labels before fragment fallback; translate known captured UI terms in bounded templates.
- Added village counters, chapter/step labels, world hints, wallet and exchange counters, task and music labels, sync/PIN/backup errors.
- English-only native card faces replace catalog/reward raster lettering. Original Chinese artwork and source assets remain unchanged. Starter companion portraits remain with an English bottom nameplate.
- Default reward input names display English without rewriting state; custom entries remain as entered. Backup and receipt dates follow the selected locale.
- No storage schema, timer, reward rules, auth or cloud mutation logic changed.

Verification: TypeScript and web export PASS. Lint has 0 errors (57 existing App.tsx warnings). English detail audit at 320/390 covers village, map, wishes/cart, companions, journey, tasks, rewards, music, preferences, history and backup with no Chinese UI found in those rendered views (player names and the Chinese language option excluded). Login at 320/390/900 PASS. Language/active timer preservation at 320/390/844/900 PASS. Chinese family/browser regression PASS. Commerce and backup tests at 320/390 PASS. Tests use synthetic mock-cloud fixtures, never live player records. Starter portrait and time card screenshot inspected.

English catalog cards are a new text-based presentation, not translated raster images. Legacy unused catalog prose is not claimed to be translated. User-entered names and notes intentionally remain unchanged.
