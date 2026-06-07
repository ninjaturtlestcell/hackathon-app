"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "@shared/schemas";

const schema = z.object({ email: z.string().email("Gecerli bir e-posta gir") });
type Values = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async ({ email }) => {
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/auth/update-password`,
    });
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  });

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-20">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Sifre sifirlama</h1>
          <p className="text-sm text-muted-foreground">
            E-postana sifirlama baglantisi gonderelim.
          </p>
        </div>

        {sent ? (
          <p className="text-sm text-muted-foreground">
            Baglanti gonderildi. E-postani kontrol et.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Field control={form.control} name="email" label="E-posta">
              {({ field, fieldState, id }) => (
                <Input
                  id={id}
                  type="email"
                  placeholder="ornek@eposta.com"
                  aria-invalid={!!fieldState.error}
                  {...field}
                />
              )}
            </Field>
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "..." : "Baglanti gonder"}
            </Button>
          </form>
        )}

        <Button asChild variant="ghost">
          <Link href="/login">Girise don</Link>
        </Button>
      </div>
    </main>
  );
}
