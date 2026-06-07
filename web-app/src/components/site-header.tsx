import Link from "next/link";
import Image from "next/image";
import logoLight from "@shared/assets/logo-light.png";
import logoDark from "@shared/assets/logo-dark.png";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
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
          priority
        />
        <Image
          src={logoDark}
          alt="turtle"
          width={141}
          height={36}
          className="hidden h-9 w-auto dark:block"
          priority
        />
      </Link>
      <nav className="flex items-center gap-2">
        <Button asChild variant="ghost">
          <Link href="/login">Giris yap</Link>
        </Button>
        <Button asChild>
          <Link href="/login">Basla</Link>
        </Button>
      </nav>
    </header>
  );
}
