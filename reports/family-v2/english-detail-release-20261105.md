# English detail pass — 2026-11-05

Requested by Jerry: remaining Chinese in the English interface.

- Translate composite JSX labels before fragment fallback; translate known captured UI terms in bounded templates.
- Added village counters, chapter/step labels, world hints, wallet and exchange counters, task and music labels, sync/PIN/backup errors.
- English-only native card faces replace catalog/reward raster lettering. Original Chinese artwork and source assets remain unchanged. Starter companion portraits remain with an English bottom nameplate.
- Default reward input names display English without rewriting state; custom entries remain as entered. Backup and receipt dates follow the selected locale.
- No storage schema, timer, reward rules, auth or cloud mutation logic changed.

Verification: TypeScript and web export PASS. Lint has 0 errors (57 existing App.tsx warnings). English detail audit at 320/390 covers village, map, wishes/cart, companions, journey, tasks, rewards, music, preferences, history and backup with no Chinese UI found in those rendered views (player names and the Chinese language option excluded). Login at 320/390/900 PASS. Language/active timer preservation at 320/390/844/900 PASS. Chinese family/browser regression PASS. Commerce and backup tests at 320/390 PASS. Tests use synthetic mock-cloud fixtures, never live player records. Starter portrait and time card screenshot inspected.

English catalog cards are a new text-based presentation, not translated raster images. Legacy unused catalog prose is not claimed to be translated. User-entered names and notes intentionally remain unchanged.

## Live verification
Render source `705bd9f` live 2026-11-05 07:17 Taipei. Hosted AppEntry-f768040478f8c6a6b885ab3ffcb1a8e0.js matches local bytes, SHA256 94709ab1b6c7428779a473fe5e2b6e6ea25bdac6ab64516d8b7f021a484fefc1. Hosted detail audit PASS at 320/390; hosted login/persistence PASS at 320/390/900, synthetic cloud fixtures only.
