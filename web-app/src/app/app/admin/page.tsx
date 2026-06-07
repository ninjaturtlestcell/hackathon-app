import { redirect } from "next/navigation";

import { getUserRole } from "@/lib/supabase/role";
import { AdminContent } from "./admin-content";

// Admin-only sayfa (RBAC ornegi). Sadece role='admin' erisebilir.
export default async function AdminPage() {
  const role = await getUserRole();
  if (role !== "admin") {
    redirect("/app");
  }
  return <AdminContent />;
}
