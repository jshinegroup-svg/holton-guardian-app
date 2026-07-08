import AsyncStorage from "@react-native-async-storage/async-storage";

import type { PersistedAppState } from "../types/holton";

export const STORAGE_KEY = "holton-guardian-app::snapshot-v3";
export const LEGACY_STORAGE_KEYS = ["holton-guardian-app::snapshot-v2", "holton-guardian-app::snapshot-v1"];

export async function loadPersistedAppState() {
  let raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      raw = await AsyncStorage.getItem(legacyKey);
      if (raw) break;
    }
  }

  return raw ? (JSON.parse(raw) as Partial<PersistedAppState>) : null;
}

export function savePersistedAppState(payload: PersistedAppState) {
  return AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearPersistedAppState() {
  return AsyncStorage.multiRemove([STORAGE_KEY, ...LEGACY_STORAGE_KEYS]);
}
