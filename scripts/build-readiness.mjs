import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const configModule = require(path.join(projectRoot, "app.config.js"));
const config = configModule.expo ?? configModule.default?.expo ?? configModule.default ?? configModule;
const easJson = JSON.parse(fs.readFileSync(path.join(projectRoot, "eas.json"), "utf8"));
const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json"), "utf8"));

const errors = [];
const warnings = [];

const expect = (condition, message) => {
  if (!condition) errors.push(message);
};

const warn = (condition, message) => {
  if (!condition) warnings.push(message);
};

const formatBytes = (value) => {
  if (value < 1024) return `${value} B`;
  const kb = value / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
};

const walkFiles = (rootDirectory) => {
  const entries = [];

  const visit = (directory) => {
    for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolutePath = path.join(directory, item.name);
      if (item.isDirectory()) {
        visit(absolutePath);
        continue;
      }
      entries.push({
        absolutePath,
        relativePath: path.relative(projectRoot, absolutePath),
        size: fs.statSync(absolutePath).size,
      });
    }
  };

  if (fs.existsSync(rootDirectory)) {
    visit(rootDirectory);
  }

  return entries;
};

const assetPaths = [
  config.icon,
  config.splash?.image,
  config.android?.adaptiveIcon?.foregroundImage,
  config.android?.adaptiveIcon?.backgroundImage,
  config.android?.adaptiveIcon?.monochromeImage,
  config.web?.favicon,
].filter(Boolean);

for (const assetPath of assetPaths) {
  const absolutePath = path.join(projectRoot, assetPath);
  expect(fs.existsSync(absolutePath), `Missing asset: ${assetPath}`);
}

const previewProfile = easJson.build?.preview;
const previewIosSimulatorProfile = easJson.build?.["preview-ios-simulator"];
const previewIosDeviceProfile = easJson.build?.["preview-ios-device"];
const productionProfile = easJson.build?.production;
const testflightProfile = easJson.build?.testflight;

expect(config.slug === "holton-guardian-app", `Unexpected Expo slug: ${config.slug}`);
expect(config.scheme === "holtonguardian", `Unexpected app scheme: ${config.scheme}`);
expect(config.version === packageJson.version, `Expo version (${config.version}) should match package.json version (${packageJson.version}).`);
expect(config.ios?.bundleIdentifier === "com.holton.guardian", `Unexpected iOS bundle identifier: ${config.ios?.bundleIdentifier}`);
expect(config.ios?.buildNumber === config.version, `iOS buildNumber (${config.ios?.buildNumber}) should match Expo version (${config.version}) before the first managed release.`);
expect(config.android?.package === "com.holton.guardian", `Unexpected Android package: ${config.android?.package}`);
expect(Number.isInteger(config.android?.versionCode) && config.android.versionCode >= 1, `Android versionCode must be a positive integer. Received: ${config.android?.versionCode}`);
expect(config.runtimeVersion?.policy === "appVersion", "runtimeVersion.policy should stay set to 'appVersion'.");
expect(easJson.cli?.appVersionSource === "remote", `EAS appVersionSource should stay 'remote'. Received: ${easJson.cli?.appVersionSource}`);
expect(previewProfile?.distribution === "internal", "preview build profile must stay internal for direct installs.");
expect(previewProfile?.android?.buildType === "apk", "preview Android build must output an APK.");
expect(previewProfile?.channel === "preview", `preview build profile should publish to the preview channel. Received: ${previewProfile?.channel}`);
expect(previewProfile?.env?.EXPO_PUBLIC_APP_ENV === "preview", "preview build profile should keep EXPO_PUBLIC_APP_ENV=preview.");
expect(easJson.build?.development?.developmentClient === true, "development build should keep developmentClient=true.");
expect(productionProfile?.channel === "production", "production build should publish to the production channel.");
expect(productionProfile?.autoIncrement === true, "production build should keep autoIncrement=true.");
expect(previewIosSimulatorProfile?.channel === "preview", "preview-ios-simulator should publish to the preview channel.");
expect(previewIosSimulatorProfile?.ios?.simulator === true, "preview-ios-simulator must set ios.simulator=true.");
expect(previewIosSimulatorProfile?.env?.EXPO_PUBLIC_APP_ENV === "preview", "preview-ios-simulator should keep EXPO_PUBLIC_APP_ENV=preview.");
expect(previewIosDeviceProfile?.distribution === "internal", "preview-ios-device must stay internal for iPhone installs.");
expect(previewIosDeviceProfile?.channel === "preview", "preview-ios-device should publish to the preview channel.");
expect(previewIosDeviceProfile?.env?.EXPO_PUBLIC_APP_ENV === "preview", "preview-ios-device should keep EXPO_PUBLIC_APP_ENV=preview.");
expect(testflightProfile?.channel === "testflight", "testflight build should publish to the testflight channel.");
expect(testflightProfile?.autoIncrement === true, "testflight build should keep autoIncrement=true.");
expect(testflightProfile?.env?.EXPO_PUBLIC_APP_ENV === "testflight", "testflight build should keep EXPO_PUBLIC_APP_ENV=testflight.");
expect(typeof easJson.submit?.testflight === "object", "submit.testflight profile should exist for iOS TestFlight handoff.");

warn(Boolean(config.owner), "Expo owner is not set yet. That is fine until the human logs in and links the project.");
warn(Boolean(config.extra?.eas?.projectId), "EAS projectId is not set yet. Run `npx eas project:init` (or set EAS_PROJECT_ID) before the first cloud build.");
warn(Boolean(process.env.EXPO_PUBLIC_APP_ENV || process.env.APP_ENV), `No explicit app environment detected in shell. Using fallback environment: ${config.extra?.environment ?? "preview"}.`);
warn(Boolean(process.env.APPLE_TEAM_ID), "APPLE_TEAM_ID is not set in the shell. That is normal locally, but real iOS device / TestFlight builds will still need Apple team selection during EAS credential setup.");

const assetFiles = walkFiles(path.join(projectRoot, "assets"));
const totalAssetBytes = assetFiles.reduce((sum, file) => sum + file.size, 0);
const largestAssetFiles = [...assetFiles].sort((a, b) => b.size - a.size).slice(0, 5);
const oversizedAssetFiles = assetFiles.filter((file) => file.size >= 700 * 1024);
const cardAssetFiles = assetFiles.filter((file) => file.relativePath.startsWith("assets/cards/"));
const cardAssetBytes = cardAssetFiles.reduce((sum, file) => sum + file.size, 0);
const cardAssetGroups = Object.entries(
  cardAssetFiles.reduce((groups, file) => {
    const [, , family = "other"] = file.relativePath.split("/");
    groups[family] = (groups[family] ?? 0) + file.size;
    return groups;
  }, {})
).sort((a, b) => b[1] - a[1]);

warn(totalAssetBytes < 80 * 1024 * 1024, `Assets folder is ${formatBytes(totalAssetBytes)}. Run \`npm run assets:audit\` if preview/install size starts to feel heavy.`);
warn(oversizedAssetFiles.length <= 6, `Found ${oversizedAssetFiles.length} oversized asset(s) at or above 700 KB. Largest: ${largestAssetFiles[0]?.relativePath ?? "n/a"} (${formatBytes(largestAssetFiles[0]?.size ?? 0)}). Run \`npm run assets:audit\` for a focused report.`);
warn(cardAssetBytes < 45 * 1024 * 1024, `Card art alone is ${formatBytes(cardAssetBytes)}. If more art is added later, re-run \`npm run assets:optimize:cards\` before store-facing builds.`);

const lines = [
  "Holton Guardian build-readiness report",
  `- Environment: ${config.extra?.environment ?? "preview"}`,
  `- Expo owner: ${config.owner ?? "<pending login/link>"}`,
  `- EAS projectId: ${config.extra?.eas?.projectId ?? "<pending eas project:init>"}`,
  `- Version: ${config.version}`,
  `- iOS bundleIdentifier: ${config.ios?.bundleIdentifier}`,
  `- iOS buildNumber: ${config.ios?.buildNumber}`,
  `- Android package: ${config.android?.package}`,
  `- Android versionCode: ${config.android?.versionCode}`,
  `- Preview Android artifact: ${previewProfile?.android?.buildType ?? "unknown"}`,
  `- Preview iOS simulator: ${previewIosSimulatorProfile?.ios?.simulator === true ? "enabled" : "missing"}`,
  `- Preview iOS device distribution: ${previewIosDeviceProfile?.distribution ?? "unknown"}`,
  `- TestFlight channel: ${testflightProfile?.channel ?? "unknown"}`,
  `- Asset references checked: ${assetPaths.length}`,
  `- Assets folder size: ${formatBytes(totalAssetBytes)}`,
  `- Card art size: ${formatBytes(cardAssetBytes)}`,
];

if (cardAssetGroups.length > 0) {
  lines.push("- Card-art family totals:");
  for (const [family, bytes] of cardAssetGroups.slice(0, 6)) {
    lines.push(`  - ${family}: ${formatBytes(bytes)}`);
  }
}

if (largestAssetFiles.length > 0) {
  lines.push("- Largest assets:");
  for (const assetFile of largestAssetFiles) {
    lines.push(`  - ${assetFile.relativePath} (${formatBytes(assetFile.size)})`);
  }
}

if (warnings.length > 0) {
  lines.push("", "Warnings:");
  for (const warning of warnings) lines.push(`- ${warning}`);
  lines.push("- Asset helpers: `npm run assets:audit` for a dry report, `npm run assets:optimize:cards` to recompress oversized card PNGs in place.");
}

if (errors.length > 0) {
  lines.push("", "Errors:");
  for (const error of errors) lines.push(`- ${error}`);
  console.error(lines.join("\n"));
  process.exit(1);
}

lines.push("", "Status: ready for Expo login / EAS project linking.");
console.log(lines.join("\n"));
