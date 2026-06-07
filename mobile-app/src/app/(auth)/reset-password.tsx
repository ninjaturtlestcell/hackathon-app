import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "mobileapp://auth/update-password",
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center gap-6 px-6">
        <View className="gap-2">
          <Text className="font-sans-bold text-3xl text-foreground">
            {t("auth.reset.title")}
          </Text>
          <Text className="font-sans text-muted-foreground">
            {t("auth.reset.subtitle")}
          </Text>
        </View>

        {sent ? (
          <Text className="font-sans text-sm text-muted-foreground">
            {t("auth.reset.sent")}
          </Text>
        ) : (
          <View className="gap-4">
            <View className="gap-2">
              <Label>{t("auth.email")}</Label>
              <Input
                placeholder={t("auth.emailPlaceholder")}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            {error ? (
              <Text className="font-sans text-sm text-destructive">{error}</Text>
            ) : null}
            <Button onPress={onSubmit} disabled={loading}>
              <Text>{t("auth.reset.sendLink")}</Text>
            </Button>
            {loading ? <ActivityIndicator /> : null}
          </View>
        )}

        <Button variant="ghost" onPress={() => router.back()}>
          <Text>{t("auth.reset.backToLogin")}</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
