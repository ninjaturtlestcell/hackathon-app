import { Suspense } from "react";
import Image from "next/image";
import loginBg from "@shared/assets/login-bg.jpg";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex flex-1">
      {/* Sol: gorsel — yalniz lg ve uzeri ekranlarda gorunur */}
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

      {/* Sag: login formu — kucuk ekranlarda tam genislik */}
      <div className="flex flex-1 items-center justify-center px-6 py-20 lg:w-1/2">
        {/* useSearchParams icin Suspense siniri gerekli */}
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
