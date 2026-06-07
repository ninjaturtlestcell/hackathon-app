import { useEffect, useState } from "react";
import type { Session, SupabaseClient } from "@shared/supabase";

/**
 * Platformdan bagimsiz oturum hook'u.
 * Web ve mobile, kendi olusturduklari client'i parametre olarak gecer.
 */
export function useSession(supabase: SupabaseClient) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { session, user: session?.user ?? null, isLoading };
}
