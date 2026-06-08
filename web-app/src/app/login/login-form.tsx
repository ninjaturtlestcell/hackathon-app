"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const schema = z.object({
  username: z.string().min(1, "Kullanıcı adı gerekli"),
  password: z.string().min(1, "API token gerekli"),
});

type FormInput = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") ?? "/app";
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async ({ username, password }) => {
    setServerError(null);

    const res = await fetch("/api/jira/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setServerError(data.error ?? "Giriş başarısız");
      return;
    }

    router.replace(returnUrl);
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Jira ile Giriş</h1>
        <p className="text-sm text-muted-foreground">
          Jira hesabınızla giriş yapın
        </p>
      </div>

      <Field
        control={form.control}
        name="username"
        label="E-posta / Kullanıcı Adı"
      >
        {({ field, fieldState, id }) => (
          <Input
            id={id}
            type="text"
            autoComplete="username"
            placeholder="ornek@sirket.com"
            aria-invalid={!!fieldState.error}
            {...field}
          />
        )}
      </Field>

      <Field control={form.control} name="password" label="API Token / Şifre">
        {({ field, fieldState, id }) => (
          <Input
            id={id}
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={!!fieldState.error}
            {...field}
          />
        )}
      </Field>

      {serverError ? (
        <p className="text-sm text-destructive">{serverError}</p>
      ) : null}

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Bağlanıyor..." : "Giriş Yap"}
      </Button>
    </form>
  );
}
