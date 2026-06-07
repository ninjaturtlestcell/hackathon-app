import { Suspense } from "react";

import { AuthSplitLayout } from "@/components/auth-split-layout";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <AuthSplitLayout>
      {/* useSearchParams icin Suspense siniri gerekli */}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthSplitLayout>
  );
}
