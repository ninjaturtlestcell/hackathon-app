"use client";

import { useTranslation } from "react-i18next";

export default function AppHome() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold tracking-tight">
        {t("dashboard.title")}
      </h1>
      <p className="text-sm text-muted-foreground">{t("dashboard.welcome")}</p>
    </div>
  );
}
