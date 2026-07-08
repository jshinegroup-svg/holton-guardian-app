import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const configModule = require(path.join(projectRoot, "app.config.js"));
const config = configModule.expo ?? configModule.default?.expo ?? configModule.default ?? configModule;
const easJson = JSON.parse(fs.readFileSync(path.join(projectRoot, "eas.json"), "utf8"));

const owner = config.owner;
const projectId = config.extra?.eas?.projectId;
const previewSimulator = easJson.build?.["preview-ios-simulator"] ?? {};
const previewDevice = easJson.build?.["preview-ios-device"] ?? {};
const testflight = easJson.build?.testflight ?? {};
const missing = [];

if (!owner) {
  missing.push("Expo account owner is not pinned yet.");
}

if (!projectId) {
  missing.push("EAS projectId is not linked yet.");
}

missing.push("Apple Developer login/team selection and signing credentials still require a human in Expo/EAS.");

const lines = [
  "Holton Guardian iOS build handoff",
  `- App version: ${config.version}`,
  `- iOS bundleIdentifier: ${config.ios?.bundleIdentifier}`,
  `- iOS buildNumber: ${config.ios?.buildNumber}`,
  `- Expo owner: ${owner ?? "<pending login/link>"}`,
  `- EAS projectId: ${projectId ?? "<pending eas project:init>"}`,
  `- Preview simulator profile: channel=${previewSimulator.channel ?? "unknown"}, simulator=${previewSimulator.ios?.simulator === true ? "true" : "false"}`,
  `- Preview device profile: channel=${previewDevice.channel ?? "unknown"}, distribution=${previewDevice.distribution ?? "unknown"}`,
  `- TestFlight profile: channel=${testflight.channel ?? "unknown"}, autoIncrement=${testflight.autoIncrement === true ? "true" : "false"}`,
  "",
  "Still blocked by external/human steps:",
  ...missing.map((item) => `- ${item}`),
  "",
  "Recommended order once Expo/Apple auth is available:",
  "1. Local gate (already safe to re-run anytime):",
  "   npm run preflight:standalone",
  "2. Log in and link the Expo/EAS project:",
  "   npm run eas:login",
  "   npm run eas:init",
  "3. Build an iOS simulator preview first (fastest no-device smoke test):",
  "   npm run build:preview:ios:simulator",
  "4. Build an internal iPhone preview for real-device install/testing:",
  "   npm run build:preview:ios:device",
  "5. When device testing is stable, produce the TestFlight candidate:",
  "   npm run build:testflight:ios",
  "6. After the build finishes, submit the latest iOS build to TestFlight:",
  "   npm run submit:testflight:ios",
  "",
  "What each profile is for:",
  "- preview-ios-simulator → credential-light Simulator .app build for quick UI smoke testing on a Mac.",
  "- preview-ios-device → internal iOS build for real iPhone install/testing after signing is set up.",
  "- testflight → store-style iOS build with auto-increment, ready to submit to App Store Connect / TestFlight.",
  "",
  "Optional .env.local snippet after eas:init:",
  `EXPO_PUBLIC_APP_ENV=preview`,
  `EXPO_OWNER=${owner ?? "<your-expo-account>"}`,
  `EAS_PROJECT_ID=${projectId ?? "<project-id-from-eas-init>"}`,
];

console.log(lines.join("\n"));
