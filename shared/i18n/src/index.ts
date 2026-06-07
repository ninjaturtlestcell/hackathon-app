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
  appName: "Turtle",
  nav: {
    home: "Home",
    dashboard: "Dashboard",
    components: "Components",
    profile: "Profile",
    settings: "Settings",
    admin: "Admin",
  },
  auth: {
    signIn: "Sign In",
    signUp: "Sign Up",
    signOut: "Sign Out",
    email: "Email",
    password: "Password",
    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "********",
    continueToAccount: "Sign in to continue.",
    noAccount: "No account? Sign up",
    haveAccount: "Already have an account? Sign in",
    forgotPassword: "Forgot password?",
    signupTaken: "Registration received. You may need to verify your email.",
    reset: {
      title: "Reset Password",
      subtitle: "We'll send a reset link to your email.",
      sendLink: "Send Link",
      sent: "Link sent. Check your email.",
      backToLogin: "Back to sign in",
    },
    update: {
      title: "New Password",
      subtitle: "Set a new password for your account.",
      newPassword: "New password",
      submit: "Update Password",
      minLength: "Password must be at least 8 characters",
    },
  },
  dashboard: {
    title: "Dashboard",
    welcome: "Welcome. Open Components from the side menu to see the UI kit.",
  },
  components: {
    title: "Components",
    subtitle: "The design system's components and their variants.",
  },
  profile: {
    title: "Profile",
    subtitle: "Manage your profile.",
    fullName: "Full name",
    fullNamePlaceholder: "Your name",
    changeAvatar: "Change photo",
    saved: "Profile updated",
    uploadError: "Upload failed",
  },
  admin: {
    title: "Admin",
    rbacWorks: "RBAC works",
    rbacDescription:
      "Only users whose role is admin can see this page. Other roles are redirected to the dashboard.",
  },
  landing: {
    badge: "Next.js + Expo + Supabase monorepo",
    title: "Turn your idea into a product, fast",
    subtitle: "Web and mobile share the same Supabase and theme layer.",
    getStarted: "Get Started",
    start: "Start",
    goToApp: "Go to app",
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
  datePicker: {
    rangePlaceholder: "Pick a date range",
  },
};

const tr: typeof en = {
  appName: "Turtle",
  nav: {
    home: "Ana Sayfa",
    dashboard: "Panel",
    components: "Bileşenler",
    profile: "Profil",
    settings: "Ayarlar",
    admin: "Admin",
  },
  auth: {
    signIn: "Giriş Yap",
    signUp: "Kayıt Ol",
    signOut: "Çıkış Yap",
    email: "E-posta",
    password: "Şifre",
    emailPlaceholder: "ornek@eposta.com",
    passwordPlaceholder: "********",
    continueToAccount: "Devam etmek için hesabına giriş yap.",
    noAccount: "Hesabın yok mu? Kayıt ol",
    haveAccount: "Zaten hesabın var mı? Giriş yap",
    forgotPassword: "Şifremi unuttum",
    signupTaken: "Kayıt alındı. E-postanı doğrulaman gerekebilir.",
    reset: {
      title: "Şifre Sıfırlama",
      subtitle: "E-postana sıfırlama bağlantısı gönderelim.",
      sendLink: "Bağlantı Gönder",
      sent: "Bağlantı gönderildi. E-postanı kontrol et.",
      backToLogin: "Girişe dön",
    },
    update: {
      title: "Yeni Şifre",
      subtitle: "Hesabın için yeni bir şifre belirle.",
      newPassword: "Yeni şifre",
      submit: "Şifreyi Güncelle",
      minLength: "Şifre en az 8 karakter olmalı",
    },
  },
  dashboard: {
    title: "Panel",
    welcome:
      "Hoş geldin. Bileşenleri görmek için kenar menüden Components'e git.",
  },
  components: {
    title: "Bileşenler",
    subtitle: "Tasarım sisteminin bileşenleri ve variant'ları.",
  },
  profile: {
    title: "Profil",
    subtitle: "Profilini yönet.",
    fullName: "Ad soyad",
    fullNamePlaceholder: "Adın",
    changeAvatar: "Fotoğraf değiştir",
    saved: "Profil güncellendi",
    uploadError: "Yükleme başarısız",
  },
  admin: {
    title: "Admin",
    rbacWorks: "RBAC çalışıyor",
    rbacDescription:
      "Bu sayfayı yalnızca rolü admin olan kullanıcılar görebilir. Diğer roller panele yönlendirilir.",
  },
  landing: {
    badge: "Next.js + Expo + Supabase monorepo",
    title: "Fikrini hızlıca ürüne çevir",
    subtitle: "Web ve mobil ortak Supabase ve tema katmanını paylaşır.",
    getStarted: "Hemen Başla",
    start: "Başla",
    goToApp: "Uygulamaya git",
  },
  common: {
    save: "Kaydet",
    cancel: "Vazgeç",
    delete: "Sil",
    loading: "Yükleniyor",
  },
  prefs: {
    theme: "Tema",
    language: "Dil",
    light: "Açık",
    dark: "Koyu",
    system: "Sistem",
  },
  demo: {
    title: "i18n & Tema",
    greeting: "Merhaba! Bu metin çevrildi.",
  },
  datePicker: {
    rangePlaceholder: "Tarih aralığı seç",
  },
};

export const resources = {
  en: { translation: en },
  tr: { translation: tr },
} as const;
