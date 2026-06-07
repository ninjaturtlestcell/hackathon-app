import Image from "next/image";
import loginBg from "@shared/assets/login-bg.jpg";

/**
 * Auth sayfalari icin ortak duzen: solda gorsel (lg+ ekranlarda), sagda icerik.
 * Kucuk ekranlarda gorsel gizlenir, icerik tam genislik olur.
 */
export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1">
      {/* Sol: gorsel — yalniz lg ve uzeri */}
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src={loginBg}
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
      </div>

      {/* Sag: auth icerigi */}
      <div className="flex flex-1 items-center justify-center px-6 py-20 lg:w-1/2">
        {children}
      </div>
    </main>
  );
}
