import * as React from "react";
import { View } from "react-native";
import {
  Controller,
  type Control,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { cn } from "@shared/lib";

type FieldRenderArgs<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  field: ControllerRenderProps<TFieldValues, TName>;
  fieldState: ControllerFieldState;
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
 *   {({ field }) => (
 *     <Input value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} />
 *   )}
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
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <View className={cn("gap-2", className)}>
          {label ? <Label>{label}</Label> : null}
          {children({ field, fieldState })}
          {fieldState.error ? (
            <Text className="text-destructive text-sm">
              {fieldState.error.message}
            </Text>
          ) : description ? (
            <Text className="text-muted-foreground text-sm">{description}</Text>
          ) : null}
        </View>
      )}
    />
  );
}
