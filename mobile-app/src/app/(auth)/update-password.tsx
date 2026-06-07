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

export default function UpdatePasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    if (password.length < 8) {
      setError(t("auth.update.minLength"));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace("/");
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center gap-6 px-6">
        <View className="gap-2">
          <Text className="font-sans-bold text-3xl text-foreground">
            {t("auth.update.title")}
          </Text>
          <Text className="font-sans text-muted-foreground">
            {t("auth.update.subtitle")}
          </Text>
        </View>

        <View className="gap-4">
          <View className="gap-2">
            <Label>{t("auth.update.newPassword")}</Label>
            <Input
              placeholder={t("auth.passwordPlaceholder")}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
          {error ? (
            <Text className="font-sans text-sm text-destructive">{error}</Text>
          ) : null}
          <Button onPress={onSubmit} disabled={loading}>
            <Text>{t("auth.update.submit")}</Text>
          </Button>
          {loading ? <ActivityIndicator /> : null}
        </View>
      </View>
    </SafeAreaView>
  );
}
