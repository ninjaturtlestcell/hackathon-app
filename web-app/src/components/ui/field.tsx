"use client";

import * as React from "react";
import {
  Controller,
  type Control,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FieldRenderArgs<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  field: ControllerRenderProps<TFieldValues, TName>;
  fieldState: ControllerFieldState;
  id: string;
};

type FieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  description?: string;
  className?: string;
  children: (args: FieldRenderArgs<TFieldValues, TName>) => React.ReactElement;
};

/**
 * Etiketli form alani: Label + kontrol + aciklama/hata mesajini birlikte
 * render eder ve react-hook-form'a baglar. Kontrolu children (render) ile verirsin.
 *
 * @example
 * <Field control={form.control} name="email" label="E-posta">
 *   {({ field, id }) => <Input id={id} {...field} />}
 * </Field>
 */
export function Field<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  className,
  children,
}: FieldProps<TFieldValues, TName>) {
  const id = React.useId();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={cn("flex flex-col gap-2", className)}>
          {label ? <Label htmlFor={id}>{label}</Label> : null}
          {children({ field, fieldState, id })}
          {fieldState.error ? (
            <p className="text-destructive text-sm">{fieldState.error.message}</p>
          ) : description ? (
            <p className="text-muted-foreground text-sm">{description}</p>
          ) : null}
        </div>
      )}
    />
  );
}
