"use client";

import { useTranslation } from "react-i18next";

import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

type AppTopbarProps = {
  displayName: string;
  email: string;
  avatarUrl?: string;
};

export function AppTopbar({ displayName, email, avatarUrl }: AppTopbarProps) {
  const { t } = useTranslation();

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-4" />
        <span className="text-sm font-medium">{t("dashboard.title")}</span>
      </div>
      <div className="flex items-center gap-3">
        <LanguageToggle />
        <ThemeToggle />
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-2">
          <Avatar className="size-7">
            {avatarUrl && (
              <AvatarImage
                src={`/api/jira/avatar?url=${encodeURIComponent(avatarUrl)}`}
                alt={displayName}
              />
            )}
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium sm:inline">
            {displayName || email}
          </span>
        </div>
      </div>
    </header>
  );
}
