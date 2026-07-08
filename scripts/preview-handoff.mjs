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
const environment = config.extra?.environment ?? "preview";
const previewProfile = easJson.build?.preview ?? {};
const previewBuildType = previewProfile.android?.buildType ?? "unknown";
const missing = [];

if (!owner) {
  missing.push("Expo account owner is not pinned yet.");
}

if (!projectId) {
  missing.push("EAS projectId is not linked yet.");
}

const lines = [
  "Holton Guardian preview-build handoff",
  `- App version: ${config.version}`,
  `- Environment: ${environment}`,
  `- Expo owner: ${owner ?? "<pending login/link>"}`,
  `- EAS projectId: ${projectId ?? "<pending eas project:init>"}`,
  `- Android package: ${config.android?.package}`,
  `- Preview artifact: Android ${previewBuildType.toUpperCase()}`,
  `- Preview distribution: ${previewProfile.distribution ?? "unknown"}`,
  `- Preview channel: ${previewProfile.channel ?? "unknown"}`,
];

if (missing.length > 0) {
  lines.push("", "Still blocked by external/human steps:");
  for (const item of missing) {
    lines.push(`- ${item}`);
  }
}

lines.push(
  "",
  "Exact next human actions:",
  "1. Log in to Expo:",
  "   npm run eas:login",
  "2. Link or create the EAS project:",
  "   npm run eas:init",
  "3. Optional: store the linked values locally in .env.local:",
  `   EXPO_PUBLIC_APP_ENV=${environment}`,
  `   EXPO_OWNER=${owner ?? "<your-expo-account>"}`,
  `   EAS_PROJECT_ID=${projectId ?? "<project-id-from-eas-init>"}`,
  "4. Build the first downloadable preview APK:",
  "   npm run build:preview:android",
  "",
  "What should no longer need local code changes:",
  "- Bundle/package identifiers are already configured.",
  "- Preview lane is already set to internal Android APK output.",
  "- Runtime version policy and OTA URL wiring are ready once projectId exists.",
  "- Local preflight can be re-run with: npm run preflight:preview-local",
);

console.log(lines.join("\n"));
