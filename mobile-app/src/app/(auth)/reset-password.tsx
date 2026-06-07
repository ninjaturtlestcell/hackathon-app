import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordScreen() {
  const router = useRouter();
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
            Sifre sifirlama
          </Text>
          <Text className="font-sans text-muted-foreground">
            E-postana sifirlama baglantisi gonderelim.
          </Text>
        </View>

        {sent ? (
          <Text className="font-sans text-sm text-muted-foreground">
            Baglanti gonderildi. E-postani kontrol et.
          </Text>
        ) : (
          <View className="gap-4">
            <View className="gap-2">
              <Label>E-posta</Label>
              <Input
                placeholder="ornek@eposta.com"
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
              <Text>Baglanti gonder</Text>
            </Button>
            {loading ? <ActivityIndicator /> : null}
          </View>
        )}

        <Button variant="ghost" onPress={() => router.back()}>
          <Text>Girise don</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
