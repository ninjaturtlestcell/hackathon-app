import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/context/auth";
import { signInSchema, type SignInInput } from "@shared/schemas";

const STORAGE_KEY = "remembered_email";

type Mode = "signin" | "signup";

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
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
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved) {
        form.setValue("email", saved);
        setRememberMe(true);
      }
    });
  }, [form]);

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
      setInfo(t("auth.signupTaken"));
      return;
    }

    if (rememberMe) {
      await AsyncStorage.setItem(STORAGE_KEY, email);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
    // Basarili giriste kok guard otomatik olarak uygulamaya yonlendirir.
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center gap-6 px-6">
        <View className="gap-2">
          <Text className="font-sans-bold text-3xl text-foreground">
            {mode === "signin" ? t("auth.signIn") : t("auth.signUp")}
          </Text>
          <Text className="font-sans text-muted-foreground">
            {t("auth.continueToAccount")}
          </Text>
        </View>

        <View className="gap-4">
          <Field control={form.control} name="email" label={t("auth.email")}>
            {({ field, fieldState }) => (
              <Input
                placeholder={t("auth.emailPlaceholder")}
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

          <Field
            control={form.control}
            name="password"
            label={t("auth.password")}
          >
            {({ field, fieldState }) => (
              <Input
                placeholder={t("auth.passwordPlaceholder")}
                secureTextEntry
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                aria-invalid={!!fieldState.error}
              />
            )}
          </Field>

          {mode === "signin" ? (
            <View className="flex-row items-center gap-2">
              <Checkbox
                checked={rememberMe}
                onCheckedChange={(v) => setRememberMe(v === true)}
              />
              <Text
                className="font-sans text-sm text-muted-foreground"
                onPress={() => setRememberMe((v) => !v)}
              >
                {t("auth.rememberMe")}
              </Text>
            </View>
          ) : null}
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
          <Text>{mode === "signin" ? t("auth.signIn") : t("auth.signUp")}</Text>
        </Button>
        {form.formState.isSubmitting ? <ActivityIndicator /> : null}

        {mode === "signin" ? (
          <Button
            variant="ghost"
            onPress={() => router.push("/reset-password")}
          >
            <Text>{t("auth.forgotPassword")}</Text>
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
            {mode === "signin" ? t("auth.noAccount") : t("auth.haveAccount")}
          </Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
