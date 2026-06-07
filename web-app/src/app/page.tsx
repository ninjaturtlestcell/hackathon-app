"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-20 text-center">
        <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
          {t("landing.badge")}
        </span>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          {t("landing.title")}
        </h1>
        <p className="max-w-md text-muted-foreground">{t("landing.subtitle")}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/login">{t("landing.getStarted")}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/app">{t("landing.goToApp")}</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
