"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import logoLight from "@shared/assets/logo-light.png";
import logoDark from "@shared/assets/logo-dark.png";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { t } = useTranslation();
  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <Link href="/" className="flex items-center">
        {/* logo 943x240 (~3.93:1) — yukseklik h-9 (36px). Temaya gore degisir. */}
        <Image
          src={logoLight}
          alt="turtle"
          width={141}
          height={36}
          className="h-9 w-auto dark:hidden"
          style={{ width: 'auto' }}
          priority
        />
        <Image
          src={logoDark}
          alt="turtle"
          width={141}
          height={36}
          className="hidden h-9 w-auto dark:block"
          style={{ width: 'auto' }}
          priority
        />
      </Link>
      <nav className="flex items-center gap-2">
        <Button asChild variant="ghost">
          <Link href="/login">{t("auth.signIn")}</Link>
        </Button>
        <Button asChild>
          <Link href="/login">{t("landing.start")}</Link>
        </Button>
      </nav>
    </header>
  );
}
