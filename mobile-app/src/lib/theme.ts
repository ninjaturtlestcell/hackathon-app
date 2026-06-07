import AsyncStorage from "@react-native-async-storage/async-storage";
import { colorScheme } from "nativewind";

export type ThemePref = "light" | "dark" | "system";

const STORE_KEY = "app.theme";

/** Saklanan tema tercihini dondurur (varsayilan: system). */
export async function getStoredTheme(): Promise<ThemePref> {
  const value = (await AsyncStorage.getItem(STORE_KEY)) as ThemePref | null;
  return value ?? "system";
}

/** Uygulama acilisinda saklanan tercihi NativeWind'e uygular. */
export async function loadStoredTheme() {
  colorScheme.set(await getStoredTheme());
}

/** Tema tercihini ayarla ve kalici sakla. */
export async function setThemePreference(pref: ThemePref) {
  colorScheme.set(pref);
  await AsyncStorage.setItem(STORE_KEY, pref);
}
