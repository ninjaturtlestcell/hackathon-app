import { useEffect, useState } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { getStoredTheme, setThemePreference, type ThemePref } from "@/lib/theme";

export function ThemeToggle() {
  const { t } = useTranslation();
  const [pref, setPref] = useState<ThemePref>("system");

  useEffect(() => {
    void getStoredTheme().then(setPref);
  }, []);

  const options: { value: ThemePref; label: string }[] = [
    { value: "light", label: t("prefs.light") },
    { value: "dark", label: t("prefs.dark") },
    { value: "system", label: t("prefs.system") },
  ];

  return (
    <View className="flex-row gap-1">
      {options.map((o) => (
        <Button
          key={o.value}
          size="sm"
          variant={pref === o.value ? "default" : "outline"}
          onPress={() => {
            setPref(o.value);
            void setThemePreference(o.value);
          }}
        >
          <Text>{o.label}</Text>
        </Button>
      ))}
    </View>
  );
}
