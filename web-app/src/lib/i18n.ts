"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { defaultNS, fallbackLng, resources, supportedLngs } from "@shared/i18n";

// Initialize i18n without language detector to avoid SSR hydration issues
// Language will be detected and changed on the client side in Providers
if (!i18n.isInitialized) {
  void i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: fallbackLng, // Start with fallback language
      fallbackLng,
      supportedLngs: [...supportedLngs],
      defaultNS,
      interpolation: { escapeValue: false },
    });
}

export default i18n;
