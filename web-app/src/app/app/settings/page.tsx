"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supportedLngs } from "@shared/i18n";

const LANG_LABELS: Record<string, string> = {
  en: "English",
  tr: "Türkçe",
};

const THEME_ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const currentTheme = theme ?? "system";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("settings.title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <div className="flex flex-col gap-4 max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.appearance")}</CardTitle>
            <CardDescription>{t("settings.appearanceDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Label htmlFor="theme-select">{t("prefs.theme")}</Label>
              <Select value={currentTheme} onValueChange={setTheme}>
                <SelectTrigger id="theme-select" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["light", "dark", "system"] as const).map((value) => {
                    const Icon = THEME_ICONS[value];
                    return (
                      <SelectItem key={value} value={value}>
                        <span className="flex items-center gap-2">
                          <Icon className="size-4" />
                          {t(`prefs.${value}`)}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.localization")}</CardTitle>
            <CardDescription>{t("settings.localizationDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Label htmlFor="language-select">{t("prefs.language")}</Label>
              <Select
                value={i18n.resolvedLanguage ?? "en"}
                onValueChange={(lng) => void i18n.changeLanguage(lng)}
              >
                <SelectTrigger id="language-select" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supportedLngs.map((lng) => (
                    <SelectItem key={lng} value={lng}>
                      {LANG_LABELS[lng] ?? lng}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
