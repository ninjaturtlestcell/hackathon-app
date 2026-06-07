"use client";

import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export function AdminContent() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold tracking-tight">{t("admin.title")}</h1>
        <Badge>
          <ShieldCheck className="size-3" /> admin
        </Badge>
      </div>
      <Alert className="max-w-xl">
        <ShieldCheck />
        <AlertTitle>{t("admin.rbacWorks")}</AlertTitle>
        <AlertDescription>{t("admin.rbacDescription")}</AlertDescription>
      </Alert>
    </div>
  );
}
