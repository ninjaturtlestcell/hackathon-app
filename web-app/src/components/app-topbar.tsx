"use client";

import { useTranslation } from "react-i18next";

import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { AppRole } from "@/lib/supabase/role";

type AppTopbarProps = {
  email?: string | null;
  role: AppRole | null;
  signOutAction: () => Promise<void>;
};

export function AppTopbar({ email, role, signOutAction }: AppTopbarProps) {
  const { t } = useTranslation();
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-4" />
        <span className="text-sm font-medium">{t("dashboard.title")}</span>
      </div>
      <div className="flex items-center gap-2">
        {role ? (
          <Badge variant={role === "admin" ? "default" : "secondary"}>
            {role}
          </Badge>
        ) : null}
        <LanguageToggle />
        <ThemeToggle />
        <span className="ml-1 hidden text-sm text-muted-foreground sm:inline">
          {email}
        </span>
        <form action={signOutAction}>
          <Button type="submit" variant="outline" size="sm">
            {t("auth.signOut")}
          </Button>
        </form>
      </div>
    </header>
  );
}
