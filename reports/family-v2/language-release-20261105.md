# Adventure Squad — Chinese baseline and English interface

Requested by Jerry in Telegram 23599 / 23602 on 2026-11-05.

## Preserved baseline
- Original source: `a102426` (includes foldable layout release `53854d9`).
- Local Git tag: `baseline/zh-TW-20261105`.
- Full tracked-source archive: `backups/holton-family-v2-zh-TW-20261105-a102426.tar.gz` (external development volume; not added to Git).
- Existing report screenshots were left out of the release commit; prior modified/untracked evidence is not discarded.

## Change
- One maintained V2 app; Traditional Chinese remains the default.
- Login/registration/roster: Traditional Chinese / English selector, with selected accessibility state.
- Parents → Settings & tutorial: same selector for already signed-in solo players.
- Device/browser preference uses a dedicated `holton-family-v2::interface-language` key. It is not stored in child progress and is not account-wide.
- Exact UI dictionary, bounded label templates, localized React Native display components, localized DOM tutorial.
- Language changes subscribe in place: do not key/remount the game, change timer deadlines or issue save/reward requests.
- Existing task identifiers, historical data and player names are not rewritten. Images/video are original assets; embedded artwork text is not regenerated.
- Tutorial targets retain stable original semantic label attributes, independent of visible language.
- Explicit compact row heights preserve both players' buttons at small sizes with loaded image assets.
- Parent reset phrase is RESET in English and 重新開始 in Chinese.

## Verification
- TypeScript and Expo web export pass.
- Language regression: 320x568, 390x600, 844x390 and 900x700; persistence, active deadline preservation, separate point balances, original names/tasks and V1 sentinel preserved.
- Anonymous login: 320/390/900; selected language survives refresh, typed email/password survive switching, password masking and validation work, no horizontal overflow. No registration or email was sent.
- English solo and parent PIN: 320/390; village/task screens inspected, no unlocalized UI text in the tested task view.
- Existing Chinese regression, task-outcome and tutorial regressions are run before release; see final results below.
- Authentication/save tests use synthetic local fixtures and mocked cloud APIs, not production user progress.

Actor: assistant. Approval: explicit user request 23602. Trigger: implement bilingual interface while preserving Chinese version.

Final local results: existing Chinese browser regression PASS at 320/390/844/900; task-outcome and guide-refresh suites PASS at 320/390. Language/login/solo checks PASS. Screenshots reviewed for 320px duo and 390px login. The compact-row fix was verified against the original deployed baseline as well as loaded local assets.
