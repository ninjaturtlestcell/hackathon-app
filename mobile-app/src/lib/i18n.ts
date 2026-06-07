import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import {
  defaultNS,
  fallbackLng,
  resources,
  supportedLngs,
  type Language,
} from "@shared/i18n";

const STORE_KEY = "app.language";

function deviceLanguage(): Language {
  const code = Localization.getLocales()[0]?.languageCode ?? fallbackLng;
  return (supportedLngs as readonly string[]).includes(code)
    ? (code as Language)
    : fallbackLng;
}

void i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage(),
  fallbackLng,
  supportedLngs: [...supportedLngs],
  defaultNS,
  interpolation: { escapeValue: false },
});

// Kullanicinin daha once sectigi dili geri yukle.
void AsyncStorage.getItem(STORE_KEY).then((stored) => {
  if (stored && stored !== i18n.language) {
    void i18n.changeLanguage(stored);
  }
});

/** Dili degistir ve kalici olarak sakla. */
export async function setLanguage(lng: Language) {
  await i18n.changeLanguage(lng);
  await AsyncStorage.setItem(STORE_KEY, lng);
}

export default i18n;
