import type { Enums } from "@shared/supabase";

import { createClient } from "@/lib/supabase/server";

export type AppRole = Enums<"app_role">;

/** Oturum acmis kullanicinin rolunu (user_roles) sunucu tarafinda getirir. */
export async function getUserRole(): Promise<AppRole | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle<{ role: AppRole }>();

  return data?.role ?? null;
}

export async function isAdmin(): Promise<boolean> {
  return (await getUserRole()) === "admin";
}
