import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getJiraSession, JIRA_SESSION_COOKIE } from "@/lib/jira/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getJiraSession();

  if (!session) {
    redirect("/login?returnUrl=/app");
  }

  async function signOut() {
    "use server";
    const cookieStore = await cookies();
    cookieStore.delete(JIRA_SESSION_COOKIE);
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar signOutAction={signOut} />
      <SidebarInset>
        <AppTopbar
          displayName={session.user.displayName}
          email={session.user.email}
          avatarUrl={session.user.avatarUrl}
        />
        <main className="flex flex-1 flex-col p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
