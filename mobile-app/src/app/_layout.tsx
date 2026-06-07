import "../global.css";
import "@/lib/reanimated-config";
import "@/lib/i18n";

import { useEffect, useState } from "react";
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
  useRouter,
  useSegments,
} from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PortalHost } from "@rn-primitives/portal";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";
import { useColorScheme } from "nativewind";
import { I18nextProvider } from "react-i18next";
import * as Linking from "expo-linking";
import { useFonts } from "expo-font";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { AuthProvider, useAuth } from "@/context/auth";
import i18n from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { loadStoredTheme } from "@/lib/theme";

/**
 * Email/recovery deep link'lerini isler:
 * - `?code=` -> exchangeCodeForSession (PKCE)
 * - PASSWORD_RECOVERY olayinda sifre guncelleme ekranina yonlendir.
 */
function useAuthDeepLinks() {
  const router = useRouter();
  const url = Linking.useURL();

  useEffect(() => {
    if (!url) return;
    const code = Linking.parse(url).queryParams?.code;
    if (typeof code === "string") {
      void supabase.auth.exchangeCodeForSession(code);
    }
  }, [url]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        router.replace("/update-password");
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);
}

/**
 * Auth degilse login'e, login'deyken auth olduysa uygulamaya yonlendirir.
 * (auth) grubu disindaki her route oturum gerektirir.
 */
function useProtectedRoute() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === "(auth)";
    // Recovery oturumu aktifken sifre guncelleme ekranindan atma.
    const isRecoveryScreen = segments[1] === "update-password";

    if (!session && !inAuthGroup) {
      router.replace("/login");
    } else if (session && inAuthGroup && !isRecoveryScreen) {
      router.replace("/");
    }
  }, [session, isLoading, segments, router]);
}

function RootNavigator() {
  useProtectedRoute();
  useAuthDeepLinks();
  const { colorScheme } = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }} />
      {/* select/dialog gibi overlay bilesenlerinin portal hedefi */}
      <PortalHost />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  // Saklanan tema tercihini uygula.
  useEffect(() => {
    void loadStoredTheme();
  }, []);

  // Fontlar yuklenene kadar (hata olsa bile devam et) native splash gorunur.
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </QueryClientProvider>
        {/* toast host (sonner-native) */}
        <Toaster />
      </I18nextProvider>
    </GestureHandlerRootView>
  );
}
