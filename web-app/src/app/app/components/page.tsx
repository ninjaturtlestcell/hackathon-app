"use client";

import { useTranslation } from "react-i18next";

import { ComponentGallery } from "../component-gallery";

export default function ComponentsPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("components.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("components.subtitle")}
        </p>
      </div>
      <ComponentGallery />
    </div>
  );
}
