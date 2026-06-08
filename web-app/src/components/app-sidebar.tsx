"use client";

import Link from "next/link";
import Image from "next/image";
import logoLight from "@shared/assets/logo-light.png";
import logoDark from "@shared/assets/logo-dark.png";
import {
  Kanban,
  LogOut,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const items = [
  { titleKey: "nav.jira", href: "/app/jira", icon: Kanban },
  { titleKey: "nav.profile", href: "/app/profile", icon: User },
  { titleKey: "nav.settings", href: "/app/settings", icon: Settings },
] as const;

export function AppSidebar({
  isAdmin = false,
  signOutAction,
}: {
  isAdmin?: boolean;
  signOutAction?: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const navItems = isAdmin
    ? [
        ...items,
        { titleKey: "nav.admin", href: "/app/admin", icon: ShieldCheck },
      ]
    : items;

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3">
        <Link href="/app" className="flex items-center">
          <Image
            src={logoLight}
            alt="Turtle"
            width={110}
            height={28}
            className="h-7 w-auto dark:hidden"
            style={{ width: "auto" }}
            priority
          />
          <Image
            src={logoDark}
            alt="Turtle"
            width={110}
            height={28}
            className="hidden h-7 w-auto dark:block"
            style={{ width: "auto" }}
            priority
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{t(item.titleKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {signOutAction && (
        <>
          <SidebarSeparator />
          <SidebarFooter className="px-3 py-3">
            <form action={signOutAction}>
              <SidebarMenuButton asChild>
                <button type="submit" className="w-full">
                  <LogOut />
                  <span>{t("auth.signOut")}</span>
                </button>
              </SidebarMenuButton>
            </form>
          </SidebarFooter>
        </>
      )}

      <SidebarRail />
    </Sidebar>
  );
}
