const projectId =
  process.env.EAS_PROJECT_ID ||
  process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
  "838483da-86b0-4ca2-a79f-308b189e92ce";
const owner = process.env.EXPO_OWNER || "jshinegroup";
const appEnv = process.env.EXPO_PUBLIC_APP_ENV || process.env.APP_ENV || "preview";

/** @type {import('expo/config').ExpoConfig} */
const expoConfig = {
  name: "Holton Guardian",
  slug: "holton-guardian-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "holtonguardian",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  description: "Holton Guardian companion app for family missions, hero progress, and daily guardian routines.",
  primaryColor: "#1D4ED8",
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.holton.guardian",
    buildNumber: "1.0.0",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: "com.holton.guardian",
    versionCode: 1,
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: "single",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-font",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
  ],
  extra: {
    environment: appEnv,
    ...(projectId ? { eas: { projectId } } : {}),
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  updates: {
    fallbackToCacheTimeout: 0,
    ...(projectId ? { url: `https://u.expo.dev/${projectId}` } : {}),
  },
  ...(owner ? { owner } : {}),
};

module.exports = {
  expo: expoConfig,
};
