# iOS Preview + TestFlight Checklist

Use this after the local-only work is green and someone is ready to finish the Apple / Expo auth side.

## 1) Re-run the local gate

```bash
npm run preflight:standalone
npm run handoff:ios
```

Expected result:
- Expo doctor passes
- TypeScript passes
- ESLint passes
- build-readiness ends with `Status: ready for Expo login / EAS project linking.`
- the iOS handoff lists the simulator, device, and TestFlight paths separately

## 2) Understand the three iOS lanes before logging in

This repo now has three distinct iOS build paths:

1. `preview-ios-simulator`
   - command: `npm run build:preview:ios:simulator`
   - use when you want the fastest UI smoke test on a Mac simulator
   - no physical iPhone install is involved

2. `preview-ios-device`
   - command: `npm run build:preview:ios:device`
   - use when you want an internal signed build for real iPhone testing
   - still requires Apple signing / team setup in EAS

3. `testflight`
   - command: `npm run build:testflight:ios`
   - use when the app is stable enough to upload to App Store Connect / TestFlight
   - this is the right lane for beta distribution, not the internal preview profile

## 3) Link Expo / EAS first

```bash
npm run eas:login
npm run eas:init
```

After `eas:init`, either:
- leave the linked values inside Expo/EAS state, or
- copy the project ID into `.env.local` as `EAS_PROJECT_ID=...`

Optional local owner pin:

```bash
EXPO_OWNER=your-account-name
```

## 4) Do the safest first iOS build: simulator

```bash
npm run build:preview:ios:simulator
```

Why start here:
- fastest way to prove the iOS shell opens
- catches many obvious UI/config issues before Apple device-signing complexity enters the picture
- keeps the first remote build low-risk

## 5) Then move to a real-device internal build

```bash
npm run build:preview:ios:device
```

This is the first build that depends on Apple credential choices.

Human decisions that may be required in the Expo/EAS prompts:
- Apple Developer login
- team selection
- signing certificate/profile creation or reuse
- tester-device registration path if EAS asks for it

## 6) Once device testing is stable, create the TestFlight candidate

```bash
npm run build:testflight:ios
```

What this repo is already configured for:
- profile: `testflight`
- channel: `testflight`
- `autoIncrement: true`
- env: `EXPO_PUBLIC_APP_ENV=testflight`

That keeps beta/TestFlight distribution separate from the internal preview lane.

## 7) Submit the latest iOS build to TestFlight

```bash
npm run submit:testflight:ios
```

Notes:
- this uses the `submit.testflight` profile from `eas.json`
- App Store Connect permissions still need to exist on the human account
- any missing Apple auth will surface here, not in local checks

## 8) Re-check these decisions before the first TestFlight push

- final Expo owner
- final EAS project ID
- Apple team/signing selection
- whether `com.holton.guardian` remains the final public iOS bundle ID
- whether the visible app name and metadata are final enough for external testers
- whether any heavy card-art additions should be recompressed before wider beta distribution

## 9) If the remote iOS build fails

Start locally with:

```bash
npm run config:public
npm run build:readiness
npm run handoff:ios
```

If those still pass locally, the likely blockers are external:
- Expo account auth
- EAS project linking
- Apple team/signing credentials
- TestFlight / App Store Connect permissions
