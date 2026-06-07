import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-20 text-center">
        <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
          Next.js + Expo + Supabase monorepo
        </span>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Fikrini hizlica urune cevir
        </h1>
        <p className="max-w-md text-muted-foreground">
          Web ve mobil, ortak Supabase ve tema katmanini paylasir. Bu, basit bir
          tanitim (landing) sayfasi — gercek uygulama{" "}
          <code className="bg-muted rounded px-1 py-0.5">/app</code> altinda.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/login">Hemen basla</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/app">Uygulamaya git</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
