# First Preview Build Checklist

Use this after the local-only work is done and someone is ready to finish the Expo/EAS side.

## 1) Run the local gate

```bash
npm run preflight:preview-local
```

Expected result:
- Expo doctor passes
- TypeScript passes
- ESLint passes
- build-readiness ends with `Status: ready for Expo login / EAS project linking.`
- `dist/` is regenerated successfully

## 2) Read the build-readiness warnings on purpose

The warnings are expected to surface the items that still need a human or later optimization:
- missing Expo owner
- missing EAS project ID
- fallback app environment
- missing Apple team context for future iOS builds
- any new oversized card-art payload

If card-art warnings show up again, run:

```bash
npm run assets:audit
```

Then, if the audit confirms the payload regressed:

```bash
npm run assets:optimize:cards
npm run build:readiness
```

Large art warnings do **not** block the first preview APK, but they are a good signal for avoiding bloated installs / slower OTA downloads.

## 3) Print the human handoff once the local gate is green

```bash
npm run handoff:preview
npm run handoff:ios
```

Expected result:
- current bundle/package IDs are echoed back
- missing owner/project ID are called out explicitly if still pending
- the Android preview path and the iOS simulator / device / TestFlight paths are printed separately
- an optional `.env.local` snippet is shown for local pinning

## 4) Link Expo / EAS

```bash
npm run eas:login
npm run eas:init
```

Then either:
- keep the linked values in Expo/EAS state only, or
- copy the project ID into `.env.local` as `EAS_PROJECT_ID=...`

Optional local owner pin:

```bash
EXPO_OWNER=your-account-name
```

## 5) Build the first downloadable Android preview

```bash
npm run build:preview:android
```

What this repo is already configured for:
- profile: `preview`
- distribution: `internal`
- artifact: Android `apk`
- channel: `preview`

That makes the first handoff easier because testers can install the APK directly.

## 6) For iOS, use the dedicated checklist

Read and follow:
- `docs/ios-preview-testflight-checklist.md`

Fast summary:
- `npm run build:preview:ios:simulator` → safest first iOS smoke test
- `npm run build:preview:ios:device` → internal iPhone build once signing is ready
- `npm run build:testflight:ios` → TestFlight candidate
- `npm run submit:testflight:ios` → submit latest iOS build to App Store Connect / TestFlight

## 7) Before production builds

Re-check these decisions before store-facing artifacts:
- final Expo owner
- final EAS project ID
- Apple team/signing selection
- Google Play signing/upload-key path
- whether `com.holton.guardian` remains the final public bundle/package ID
- whether any newly added card-art files still need compression for smaller installs / faster OTA updates

## 8) If the build fails remotely

Start with:
```bash
npm run config:public
npm run build:readiness
npm run handoff:preview
npm run handoff:ios
```

If those still pass locally, the likely blockers are external:
- account auth
- project linking
- signing credentials
- App Store Connect / TestFlight permissions
- remote EAS environment differences
