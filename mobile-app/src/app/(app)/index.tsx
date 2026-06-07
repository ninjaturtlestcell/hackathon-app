import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="flex-grow items-center justify-center gap-6 p-6">
        <View className="items-center gap-2">
          <Text className="font-sans-bold text-3xl text-foreground">
            mobile-app
          </Text>
          <Text className="font-sans text-muted-foreground">
            Giris yaptin 🎉
          </Text>
        </View>

        <View className="w-full max-w-xs items-center gap-1 rounded-lg border border-border p-4">
          <Text className="font-sans text-sm text-muted-foreground">
            Oturum acan kullanici
          </Text>
          <Text className="font-sans-semibold text-base text-foreground">
            {user?.email ?? "-"}
          </Text>
        </View>

        <View className="w-full max-w-xs">
          <Button title="Cikis yap" variant="outline" onPress={signOut} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
