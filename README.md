# Holton Guardian App

Standalone Expo app for Holton family missions, hero progress, guardian-beast unlocks, and operator test/handoff flows.

## What is in here

- `App.tsx` is the live app entry used for native and web builds.
- `assets/` holds release icons plus Holton card art used in the app.
- `app.config.js` is the Expo config source of truth for bundle IDs, splash/icons, OTA policy, and optional env-driven EAS linking.
- `.env.example` shows the small set of optional local env vars used by `app.config.js`.
- `eas.json` now defines six practical lanes:
  - `development` → internal dev client
  - `preview` → internal downloadable Android APK
  - `preview-ios-simulator` → fastest iOS smoke-test build for the Simulator
  - `preview-ios-device` → internal signed iPhone build for real-device testing
  - `testflight` → store-style iOS beta build for App Store Connect / TestFlight
  - `production` → store/release channel build
- `scripts/build-readiness.mjs` verifies the standalone-build prerequisites that can be checked locally, including Android + iOS profile sanity and a quick asset-weight audit.
- `scripts/card-asset-tool.py` audits or recompresses the large card PNG library without needing Expo/EAS auth.
- `scripts/preview-handoff.mjs` prints the Android preview handoff.
- `scripts/ios-build-handoff.mjs` prints the iOS simulator / device / TestFlight handoff.
- `docs/first-preview-build-checklist.md` is the general handoff checklist for the first Expo/EAS preview build.
- `docs/ios-preview-testflight-checklist.md` is the iOS-specific handoff and TestFlight checklist.

## Local commands

```bash
npm install
npm run start
npm run doctor
npm run typecheck
npm run lint
npm run config:public
npm run export:web
npm run build:readiness
npm run assets:audit
npm run assets:optimize:cards
npm run preflight
npm run preflight:standalone
npm run preflight:preview-local
npm run handoff:preview
npm run handoff:ios
```

## Build-readiness flow

### Fast path before a preview build

```bash
npm run preflight:preview-local
```

That single command runs:

1. `npm run preflight` → Expo doctor + TypeScript + ESLint across the project
2. `npm run build:readiness` → asset / bundle ID / EAS profile sanity checks
3. `npm run config:public` → prints the resolved public Expo config
4. `npm run export:web` → produces a local static bundle in `dist/`

Use it when you want one local go/no-go pass before handing off to Expo/EAS.

Then run:

```bash
npm run handoff:preview
npm run handoff:ios
```

Those two handoffs print the remaining human-only steps separately for Android preview and iOS preview/TestFlight.

### Minimal standalone-build gate

If you only want config/build sanity without generating the web bundle:

```bash
npm run preflight:standalone
```

What it covers locally:

- Expo doctor, TypeScript, and ESLint
- Public Expo config generation
- App icon / splash / adaptive-icon asset references
- Bundle/package IDs, runtime policy, and version/build-number sanity
- EAS Android preview profile sanity (`internal` + `apk`)
- EAS iOS preview/TestFlight profile sanity (`preview-ios-simulator`, `preview-ios-device`, `testflight`)
- Asset-payload warnings so oversized card art is visible before store-facing builds
- A per-family card-art footprint summary plus helper commands for dry-run auditing/recompression
- Whether `owner` / `projectId` / Apple-team context are still pending human setup

If that command passes, the local project is in good shape for Expo login/project linking.

## Card-asset maintenance

The app ships a large PNG card-art library, so there are now two local helpers:

```bash
npm run assets:audit
npm run assets:optimize:cards
```

- `assets:audit` is a dry run. It reports current card size, estimated optimized size, biggest files, and the heaviest card families.
- `assets:optimize:cards` rewrites oversized PNGs in place using a conservative 640x960 max size plus palette compression. It is meant for card art that renders around 100-180 px in the app, so it trims a lot of wasted source resolution before preview/store builds.

Recommended use:
1. Run `npm run assets:audit` after adding or replacing card art.
2. If the audit shows the payload jumping again, run `npm run assets:optimize:cards`.
3. Re-run `npm run build:readiness` to confirm the warning count drops.

## Optional local env setup

If you want env-driven config instead of editing tracked files:

```bash
cp .env.example .env.local
```

Recognized values:

- `EXPO_PUBLIC_APP_ENV` → defaults to `preview` when unset
- `EAS_PROJECT_ID` → optional local override after project linking
- `EXPO_OWNER` → optional local owner pin

## Next human steps for standalone builds

1. Log in to Expo
   ```bash
   npm run eas:login
   ```
2. Link/create the EAS project
   ```bash
   npm run eas:init
   ```
   - If you prefer env-driven config, copy the returned project ID into `.env.local` as `EAS_PROJECT_ID=...`.
3. Build an internal preview artifact for Android
   ```bash
   npm run build:preview:android
   ```
   - The preview profile is configured to output an **APK** for easier direct install/testing.
4. For iOS, walk the lanes in order
   ```bash
   npm run build:preview:ios:simulator
   npm run build:preview:ios:device
   npm run build:testflight:ios
   npm run submit:testflight:ios
   ```
   - Start with the simulator build first.
   - Move to the device preview only after Apple signing/team setup is available.
   - Use the `testflight` lane for App Store Connect / TestFlight, not the internal preview profile.
5. Print the exact remaining human-only handoff steps
   ```bash
   npm run handoff:preview
   npm run handoff:ios
   ```
6. Optional: inspect the locally exported static preview in `dist/`
   ```bash
   npm run preflight:preview-local
   open dist/index.html
   ```
7. When credentials are ready, build production artifacts
   ```bash
   npm run build:production:android
   npm run build:production:ios
   ```

## Real-session review focus

The real-session / daily-handoff layer now emphasizes operator actionability, not just raw counts.

Current local-only reporting improvements:

- Live real sessions now have a lightweight workflow-stage tracker (`準備 / 進場 / 主流程 / 補救 / 收尾`) so field notes are anchored to where the session actually is.
- Daily digest includes a failure/recovery taxonomy line plus average handoff coverage, so the operator can see both the main breakdown and whether the session records are actually ready to pass on.
- Each real session export includes an `Operator priority`, `Session focus`, `Workflow stage`, `Handoff coverage`, and a compact `FAILURE / RECOVERY MAP` block.
- The in-app review area surfaces same-day taxonomy cards, stronger timeline labels, and per-session handoff completeness scores.
- Operator summary rows now include failure/recovery totals per operator, making handoff bias and rescue load easier to spot.

These are local heuristics built from session events and notes; they still need field validation against real caregiver workflows.

## Handoff docs

For the exact post-local sequence, use:

- `docs/first-preview-build-checklist.md`
- `docs/ios-preview-testflight-checklist.md`

## Notes

- iOS bundle ID: `com.holton.guardian`
- Android package: `com.holton.guardian`
- Current app version: `1.0.0`
- EAS version source is remote, so store build numbers/version codes can auto-increment in cloud builds.
- OTA runtime policy is tied to the app version (`runtimeVersion.policy = appVersion`).
- `updates.url` is injected automatically once `EAS_PROJECT_ID` is available.

## External dependencies still required

These cannot be finished locally without human credentials/access:

- Expo account login
- EAS project linking (`projectId` assignment)
- Apple signing/team selection
- TestFlight / App Store Connect permissions
- Google Play signing or upload-key decisions
- Any final naming/package-ID changes before first public release
