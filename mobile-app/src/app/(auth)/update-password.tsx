import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { supabase } from "@/lib/supabase";

export default function UpdatePasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    if (password.length < 8) {
      setError("Sifre en az 8 karakter olmali");
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
            Yeni sifre
          </Text>
          <Text className="font-sans text-muted-foreground">
            Hesabin icin yeni bir sifre belirle.
          </Text>
        </View>

        <View className="gap-4">
          <View className="gap-2">
            <Label>Yeni sifre</Label>
            <Input
              placeholder="********"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
          {error ? (
            <Text className="font-sans text-sm text-destructive">{error}</Text>
          ) : null}
          <Button onPress={onSubmit} disabled={loading}>
            <Text>Sifreyi guncelle</Text>
          </Button>
          {loading ? <ActivityIndicator /> : null}
        </View>
      </View>
    </SafeAreaView>
  );
}
