"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { signInSchema, type SignInInput } from "@shared/schemas";

const STORAGE_KEY = "remembered_email";

type Mode = "signin" | "signup";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") ?? "/app";
  const { t } = useTranslation();

  const [mode, setMode] = useState<Mode>("signin");
  const [serverError, setServerError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      form.setValue("email", saved);
      setRememberMe(true);
    }
  }, [form]);

  const onSubmit = form.handleSubmit(async ({ email, password }) => {
    setServerError(null);
    setInfo(null);

    const supabase = createClient();
    const { error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/confirm?next=/app`,
            },
          });

    if (error) {
      setServerError(error.message);
      return;
    }
    if (mode === "signup") {
      setInfo(t("auth.signupTaken"));
      return;
    }

    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY, email);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }

    router.replace(returnUrl);
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {mode === "signin" ? t("auth.signIn") : t("auth.signUp")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("auth.continueToAccount")}
        </p>
      </div>

      <Field control={form.control} name="email" label={t("auth.email")}>
        {({ field, fieldState, id }) => (
          <Input
            id={id}
            type="email"
            autoComplete="email"
            placeholder={t("auth.emailPlaceholder")}
            aria-invalid={!!fieldState.error}
            {...field}
          />
        )}
      </Field>

      <Field control={form.control} name="password" label={t("auth.password")}>
        {({ field, fieldState, id }) => (
          <Input
            id={id}
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            placeholder={t("auth.passwordPlaceholder")}
            aria-invalid={!!fieldState.error}
            {...field}
          />
        )}
      </Field>

      {mode === "signin" ? (
        <div className="flex items-center justify-between -mt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={rememberMe}
              onCheckedChange={(v) => setRememberMe(v === true)}
            />
            <span className="text-sm text-muted-foreground">
              {t("auth.rememberMe")}
            </span>
          </label>
          <Link
            href="/auth/reset-password"
            className="text-sm text-muted-foreground hover:underline"
          >
            {t("auth.forgotPassword")}
          </Link>
        </div>
      ) : null}

      {serverError ? (
        <p className="text-sm text-destructive">{serverError}</p>
      ) : null}
      {info ? <p className="text-sm text-muted-foreground">{info}</p> : null}

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting
          ? "..."
          : mode === "signin"
            ? t("auth.signIn")
            : t("auth.signUp")}
      </Button>

      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          setServerError(null);
          setInfo(null);
          setMode((m) => (m === "signin" ? "signup" : "signin"));
        }}
      >
        {mode === "signin" ? t("auth.noAccount") : t("auth.haveAccount")}
      </Button>
    </form>
  );
}
