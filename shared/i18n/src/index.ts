/**
 * Platformdan bagimsiz i18n kaynaklari. Web ve mobil ayni ceviri setini
 * tuketir; her uygulama kendi i18next instance'ini bu kaynaklarla baslatir.
 */

export const supportedLngs = ["en", "tr"] as const;
export type Language = (typeof supportedLngs)[number];

export const fallbackLng: Language = "en";

/** i18next varsayilan namespace'i. */
export const defaultNS = "translation";

const en = {
  appName: "turtle",
  nav: {
    dashboard: "Dashboard",
    components: "Components",
    settings: "Settings",
  },
  auth: {
    signIn: "Sign in",
    signUp: "Sign up",
    signOut: "Sign out",
    email: "Email",
    password: "Password",
    continueToAccount: "Sign in to continue.",
    noAccount: "No account? Sign up",
    haveAccount: "Already have an account? Sign in",
    signupTaken: "Registration received. You may need to verify your email.",
  },
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    loading: "Loading",
  },
  prefs: {
    theme: "Theme",
    language: "Language",
    light: "Light",
    dark: "Dark",
    system: "System",
  },
  demo: {
    title: "i18n & Theme",
    greeting: "Hello! This text is translated.",
  },
};

const tr: typeof en = {
  appName: "turtle",
  nav: {
    dashboard: "Panel",
    components: "Bilesenler",
    settings: "Ayarlar",
  },
  auth: {
    signIn: "Giris yap",
    signUp: "Kayit ol",
    signOut: "Cikis yap",
    email: "E-posta",
    password: "Sifre",
    continueToAccount: "Devam etmek icin giris yap.",
    noAccount: "Hesabin yok mu? Kayit ol",
    haveAccount: "Zaten hesabin var mi? Giris yap",
    signupTaken: "Kayit alindi. E-postani dogrulaman gerekebilir.",
  },
  common: {
    save: "Kaydet",
    cancel: "Vazgec",
    delete: "Sil",
    loading: "Yukleniyor",
  },
  prefs: {
    theme: "Tema",
    language: "Dil",
    light: "Acik",
    dark: "Koyu",
    system: "Sistem",
  },
  demo: {
    title: "i18n & Tema",
    greeting: "Merhaba! Bu metin cevrildi.",
  },
};

export const resources = {
  en: { translation: en },
  tr: { translation: tr },
} as const;
