"use client";

import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supportedLngs } from "@shared/i18n";

const LABELS: Record<string, string> = { en: "English", tr: "Turkce" };

export function LanguageToggle() {
  const { i18n, t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label={t("prefs.language")}>
          <Languages className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {supportedLngs.map((lng) => (
          <DropdownMenuItem
            key={lng}
            onClick={() => i18n.changeLanguage(lng)}
            className={i18n.resolvedLanguage === lng ? "font-medium" : undefined}
          >
            {LABELS[lng] ?? lng}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
