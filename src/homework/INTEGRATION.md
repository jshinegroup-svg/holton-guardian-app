# Homework integration — 2026-11-12

Branch: feat/homework-integration. Base: 47ade02. Production source and deployment untouched.

- Optional `LightState.homework` lives in the existing per-child revisioned save, not prototype browser storage.
- Parent preferences enables/disables entrance. Existing accounts default off. Disabling preserves all records/rewards.
- `HomeworkAdventure` uses the same LightApp button renderer and ParentPinGate. No demo data migration.
- Claim commits the date receipt, +10 wallet, one history event and one existing journey step in one change. Future/empty/unconfirmed/claimed/active-task days cannot claim.
- Pending save retries use existing operation IDs; conflict must explicitly resolve through existing repository recovery.
- Focus/rest timer stores deadline, pause remainder, date and task. Returning to ordinary tasks requires ending that timer. Duo start excludes homework screen/timer.
- Photos/PDF are scoped per child/date but device-local; no OCR. UI explicitly describes device-local attachment storage. Existing original card art unchanged.
- Preview build `EXPO_PUBLIC_HOMEWORK_PREVIEW=1 npm run export:web` uses isolated storage, fake child and fake rewards, never renders FamilyApp or calls its cloud load/save. It requires its own local parent PIN setup; do not reuse or import real account credentials.
- Normal build with flag absent/0 keeps FamilyApp and existing account integration. Not deployed; actual customer-cloud end-to-end has not been run. Repository concurrency tests use a simulated cloud.
- 8+ subjects overflow into an accessible list below the seven star nodes; all tasks still required for reward.

Checks:
- npm run typecheck
- node scripts/homework/model-check.cjs
- node scripts/homework/repository-check.cjs
- node scripts/homework/browser-check.mjs (Chrome CDP; isolated browser profile)
- Preview and normal account-mode Expo web builds.

Before production rollout: review this integrated preview, then enable for chosen children. Keep source branch backup; do not roll back newer saves by overwriting them with pre-homework snapshots.

## 2026-11-12 — Shared task carousel (Jerry chose A)
Removed the standalone promotional entry. Homework Quest is now the last card in the existing circular time/custom-card deck, rendered by the original CardPedestal. Its selected mode hides the timed-task picker/custom minutes and presents Enter homework mode; entry never starts a timer. Returning retains the selected homework card in the current session. Timed state remains separate; selecting a timed card restores its controls. Parent enable/disable remains in force; duo timed-start is unavailable while homework is selected. Preview only, no production deployment.

## 2026-11-12 — Star board mobile layout correction
Aligned date/progress/hint/reward text with separate artwork plaques using bounded, vertically centered regions and explicit line heights. Set text-size-adjust to 100% to prevent mobile text inflation. Subject labels wrap within their badges. Map actions now use two columns: notebook/review, preparation/history, with compact readable labels. Artwork and reward behavior unchanged.
