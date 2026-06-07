import { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { signInSchema } from "@shared/schemas";

type Mode = "signin" | "signup";

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setInfo(null);

    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Gecersiz giris");
      return;
    }

    setLoading(true);
    const fn = mode === "signin" ? signIn : signUp;
    const { error } = await fn(email, password);
    setLoading(false);

    if (error) {
      setError(error);
      return;
    }
    if (mode === "signup") {
      // Email dogrulama acik ise oturum hemen baslamaz.
      setInfo("Kayit alindi. E-postani dogrulaman gerekebilir.");
    }
    // Basariyla giris yapilirsa kok guard otomatik olarak uygulamaya yonlendirir.
  }

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

        <View className="gap-3">
          <TextInput
            className="h-12 rounded-md border border-input bg-background px-3 font-sans text-foreground"
            placeholder="E-posta"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            className="h-12 rounded-md border border-input bg-background px-3 font-sans text-foreground"
            placeholder="Sifre"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {error ? (
          <Text className="font-sans text-sm text-destructive">{error}</Text>
        ) : null}
        {info ? (
          <Text className="font-sans text-sm text-muted-foreground">{info}</Text>
        ) : null}

        <Button
          title={mode === "signin" ? "Giris yap" : "Kayit ol"}
          onPress={onSubmit}
          disabled={loading}
        />
        {loading ? <ActivityIndicator /> : null}

        <Button
          variant="ghost"
          title={
            mode === "signin"
              ? "Hesabin yok mu? Kayit ol"
              : "Zaten hesabin var mi? Giris yap"
          }
          onPress={() => {
            setError(null);
            setInfo(null);
            setMode((m) => (m === "signin" ? "signup" : "signin"));
          }}
        />
      </View>
    </SafeAreaView>
  );
}
