"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { signInSchema } from "@shared/schemas";

type Mode = "signin" | "signup";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") ?? "/app";

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Gecersiz giris");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (mode === "signup") {
      setInfo("Kayit alindi. E-postani dogrulaman gerekebilir.");
      return;
    }

    // Basarili giris -> returnUrl'e (yoksa /app) don. refresh, sunucu
    // bilesenlerinin yeni oturumu gormesi icin gerekli.
    router.replace(returnUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {mode === "signin" ? "Giris yap" : "Kayit ol"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Devam etmek icin hesabina giris yap.
        </p>
      </div>

      <Input
        type="email"
        placeholder="E-posta"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Sifre"
        autoComplete={mode === "signin" ? "current-password" : "new-password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {info ? <p className="text-sm text-muted-foreground">{info}</p> : null}

      <Button type="submit" disabled={loading}>
        {loading ? "..." : mode === "signin" ? "Giris yap" : "Kayit ol"}
      </Button>

      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          setError(null);
          setInfo(null);
          setMode((m) => (m === "signin" ? "signup" : "signin"));
        }}
      >
        {mode === "signin"
          ? "Hesabin yok mu? Kayit ol"
          : "Zaten hesabin var mi? Giris yap"}
      </Button>
    </form>
  );
}
