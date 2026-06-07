"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "@shared/schemas";

const schema = z.object({
  password: z.string().min(8, "Sifre en az 8 karakter olmali"),
});
type Values = z.infer<typeof schema>;

export default function UpdatePasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
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
    <main className="flex flex-1 items-center justify-center px-6 py-20">
      <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Yeni sifre</h1>
          <p className="text-sm text-muted-foreground">
            Hesabin icin yeni bir sifre belirle.
          </p>
        </div>

        <Field control={form.control} name="password" label="Yeni sifre">
          {({ field, fieldState, id }) => (
            <Input
              id={id}
              type="password"
              placeholder="********"
              autoComplete="new-password"
              aria-invalid={!!fieldState.error}
              {...field}
            />
          )}
        </Field>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "..." : "Sifreyi guncelle"}
        </Button>
      </form>
    </main>
  );
}
