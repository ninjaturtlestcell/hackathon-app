import { redirect } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";
import { getUserRole } from "@/lib/supabase/role";

// Admin-only sayfa (RBAC ornegi). Sadece role='admin' erisebilir.
export default async function AdminPage() {
  const role = await getUserRole();
  if (role !== "admin") {
    redirect("/app");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
        <Badge>
          <ShieldCheck className="size-3" /> admin
        </Badge>
      </div>
      <Alert className="max-w-xl">
        <ShieldCheck />
        <AlertTitle>RBAC calisiyor</AlertTitle>
        <AlertDescription>
          Bu sayfayi yalniz JWT&apos;sinde <code>user_role=admin</code> olan
          kullanicilar gorebilir. Diger roller <code>/app</code>&apos;e
          yonlendirilir.
        </AlertDescription>
      </Alert>
    </div>
  );
}
