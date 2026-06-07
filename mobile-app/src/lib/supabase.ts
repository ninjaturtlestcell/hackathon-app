import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@shared/supabase";

/**
 * Mobile Supabase client'i.
 * - Session, AsyncStorage'da kalici tutulur.
 * - detectSessionInUrl: false -> native'de URL tabanli session yok.
 */
export const supabase = createClient({
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  authOptions: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
