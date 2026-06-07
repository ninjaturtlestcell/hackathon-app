import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@shared/supabase";

/** Tarayici (client component) tarafi Supabase client'i. */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
