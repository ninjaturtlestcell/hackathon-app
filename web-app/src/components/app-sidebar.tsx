"use client";

import Link from "next/link";
import Image from "next/image";
import logoLight from "@shared/assets/logo-light.png";
import logoDark from "@shared/assets/logo-dark.png";
import {
  Component,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const items = [
  { titleKey: "nav.dashboard", href: "/app", icon: LayoutDashboard },
  { titleKey: "nav.components", href: "/app/components", icon: Component },
  { titleKey: "nav.profile", href: "/app/profile", icon: User },
  { titleKey: "nav.settings", href: "/app", icon: Settings },
] as const;

export function AppSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
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
          {/* logo 943x240 (~3.93:1) — temaya gore degisir */}
          <Image
            src={logoLight}
            alt="Turtle"
            width={110}
            height={28}
            className="h-7 w-auto dark:hidden"
            priority
          />
          <Image
            src={logoDark}
            alt="Turtle"
            width={110}
            height={28}
            className="hidden h-7 w-auto dark:block"
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
      <SidebarRail />
    </Sidebar>
  );
}
