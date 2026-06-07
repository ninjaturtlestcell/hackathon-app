import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/supabase/role";

// /app ve altindaki tum route'lar korumali. Middleware zaten guard yapiyor;
// burada sunucu tarafinda ikinci bir savunma katmani + kullanici bilgisi.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?returnUrl=/app");
  }

  const role = await getUserRole();

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar isAdmin={role === "admin"} />
      <SidebarInset>
        <AppTopbar email={user.email} role={role} signOutAction={signOut} />
        <main className="flex flex-1 flex-col p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
