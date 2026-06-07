import AppTabs from "@/components/app-tabs";

// Uygulamanin korumali alani — buraya yalniz oturum acmis kullanici gelir
// (yonlendirme kontrolu kok _layout.tsx icindeki useProtectedRoute ile yapilir).
export default function AppLayout() {
  return <AppTabs />;
}
