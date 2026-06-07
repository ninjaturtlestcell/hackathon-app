import {
  createClient as createSupabaseClient,
  type SupabaseClientOptions,
} from "@supabase/supabase-js";
import type { Database } from "./types";

export type CreateClientConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  /**
   * Platforma ozel auth ayarlari.
   * - Web (SSR): genelde bos birak, varsayilanlar yeterli.
   * - Mobile: { storage: AsyncStorage, detectSessionInUrl: false } gec.
   */
  authOptions?: SupabaseClientOptions<"public">["auth"];
};

/**
 * Ortak Supabase client factory'si.
 * Her platform kendi env'i ve storage adapter'i ile bu fonksiyonu cagirir,
 * boylece client olusturma mantigi tek yerde toplanir.
 */
export function createClient({
  supabaseUrl,
  supabaseAnonKey,
  authOptions,
}: CreateClientConfig) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "[@shared/supabase] supabaseUrl ve supabaseAnonKey zorunlu. .env dosyalarini kontrol et.",
    );
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: authOptions,
  });
}

export type SupabaseClient = ReturnType<typeof createClient>;
