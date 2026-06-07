"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { AuthSplitLayout } from "@/components/auth-split-layout";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "@shared/schemas";

type Values = { password: string };

export default function UpdatePasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const schema = useMemo(
    () => z.object({ password: z.string().min(8, t("auth.update.minLength")) }),
    [t],
  );

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "" },
  });

  const onSubmit = form.handleSubmit(async ({ password }) => {
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      return;
    }
    router.replace("/app");
    router.refresh();
  });

  return (
    <AuthSplitLayout>
      <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("auth.update.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("auth.update.subtitle")}
          </p>
        </div>

        <Field
          control={form.control}
          name="password"
          label={t("auth.update.newPassword")}
        >
          {({ field, fieldState, id }) => (
            <Input
              id={id}
              type="password"
              placeholder={t("auth.passwordPlaceholder")}
              autoComplete="new-password"
              aria-invalid={!!fieldState.error}
              {...field}
            />
          )}
        </Field>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "..." : t("auth.update.submit")}
        </Button>
      </form>
    </AuthSplitLayout>
  );
}
