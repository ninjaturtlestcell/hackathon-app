import { useQuery } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Enums } from "@shared/supabase";

export type AppRole = Enums<"app_role">;

/** Oturum acmis kullanicinin rolunu (user_roles tablosundan) getirir. */
export function useUserRole(supabase: SupabaseClient<Database>) {
  return useQuery({
    queryKey: ["user-role"],
    queryFn: async (): Promise<AppRole | null> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data?.role ?? null;
    },
  });
}

/** Kullanici admin mi? (turetilmis hook) */
export function useIsAdmin(supabase: SupabaseClient<Database>) {
  const query = useUserRole(supabase);
  return { ...query, isAdmin: query.data === "admin" };
}
