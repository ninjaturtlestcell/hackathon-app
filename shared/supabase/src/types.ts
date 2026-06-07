/**
 * Supabase DB tipleri.
 * Bu dosyayi elle yazma — Supabase CLI ile uret:
 *   pnpm --filter @shared/supabase exec supabase gen types typescript \
 *     --project-id <PROJECT_ID> > shared/supabase/src/types.ts
 *
 * Asagidaki placeholder, CLI ciktisini alana kadar tip guvenligi saglar.
 */
export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
