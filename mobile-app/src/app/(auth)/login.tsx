import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/context/auth";
import { signInSchema, type SignInInput } from "@shared/schemas";

type Mode = "signin" | "signup";

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [serverError, setServerError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async ({ email, password }) => {
    setServerError(null);
    setInfo(null);

    const fn = mode === "signin" ? signIn : signUp;
    const { error } = await fn(email, password);

    if (error) {
      setServerError(error);
      return;
    }
    if (mode === "signup") {
      // Email dogrulama acik ise oturum hemen baslamaz.
      setInfo("Kayit alindi. E-postani dogrulaman gerekebilir.");
    }
    // Basarili giriste kok guard otomatik olarak uygulamaya yonlendirir.
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center gap-6 px-6">
        <View className="gap-2">
          <Text className="font-sans-bold text-3xl text-foreground">
            {mode === "signin" ? "Giris yap" : "Kayit ol"}
          </Text>
          <Text className="font-sans text-muted-foreground">
            Devam etmek icin hesabina giris yap.
          </Text>
        </View>

        <View className="gap-4">
          <Field control={form.control} name="email" label="E-posta">
            {({ field, fieldState }) => (
              <Input
                placeholder="ornek@eposta.com"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                aria-invalid={!!fieldState.error}
              />
            )}
          </Field>

          <Field control={form.control} name="password" label="Sifre">
            {({ field, fieldState }) => (
              <Input
                placeholder="********"
                secureTextEntry
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                aria-invalid={!!fieldState.error}
              />
            )}
          </Field>
        </View>

        {serverError ? (
          <Text className="font-sans text-sm text-destructive">
            {serverError}
          </Text>
        ) : null}
        {info ? (
          <Text className="font-sans text-sm text-muted-foreground">{info}</Text>
        ) : null}

        <Button onPress={onSubmit} disabled={form.formState.isSubmitting}>
          <Text>{mode === "signin" ? "Giris yap" : "Kayit ol"}</Text>
        </Button>
        {form.formState.isSubmitting ? <ActivityIndicator /> : null}

        {mode === "signin" ? (
          <Button
            variant="ghost"
            onPress={() => router.push("/reset-password")}
          >
            <Text>Sifremi unuttum</Text>
          </Button>
        ) : null}

        <Button
          variant="ghost"
          onPress={() => {
            setServerError(null);
            setInfo(null);
            setMode((m) => (m === "signin" ? "signup" : "signin"));
          }}
        >
          <Text>
            {mode === "signin"
              ? "Hesabin yok mu? Kayit ol"
              : "Zaten hesabin var mi? Giris yap"}
          </Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
