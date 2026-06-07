import { View } from "react-native";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { setLanguage } from "@/lib/i18n";
import { supportedLngs } from "@shared/i18n";

const LABELS: Record<string, string> = { en: "EN", tr: "TR" };

export function LanguageToggle() {
  const { i18n } = useTranslation();

  return (
    <View className="flex-row gap-1">
      {supportedLngs.map((lng) => (
        <Button
          key={lng}
          size="sm"
          variant={i18n.resolvedLanguage === lng ? "default" : "outline"}
          onPress={() => void setLanguage(lng)}
        >
          <Text>{LABELS[lng] ?? lng}</Text>
        </Button>
      ))}
    </View>
  );
}
