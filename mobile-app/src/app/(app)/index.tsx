import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/context/auth";
import { supabase } from "@/lib/supabase";
import { useUserRole } from "@shared/lib";

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const { data: role } = useUserRole(supabase);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 gap-6 p-5">
        <View className="flex-row items-start justify-between gap-3">
          <View className="shrink gap-1">
            <Text className="font-sans-bold text-2xl text-foreground">
              {t("nav.home")}
            </Text>
            <Text className="font-sans text-sm text-muted-foreground">
              {user?.email ?? "-"}
            </Text>
          </View>
          <Badge variant={role === "admin" ? "default" : "secondary"}>
            <Text>{role ?? "-"}</Text>
          </Badge>
        </View>

        <View className="flex-row flex-wrap items-center gap-2">
          <ThemeToggle />
          <LanguageToggle />
        </View>

        <View className="mt-auto">
          <Button variant="outline" onPress={signOut}>
            <Text>{t("auth.signOut")}</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
