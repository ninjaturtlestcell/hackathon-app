"use client";

import Link from "next/link";
import {
  Component,
  LayoutDashboard,
  Settings,
  ShieldCheck,
} from "lucide-react";

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
  { title: "Dashboard", href: "/app", icon: LayoutDashboard },
  { title: "Components", href: "/app/components", icon: Component },
  { title: "Settings", href: "/app", icon: Settings },
];

export function AppSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const navItems = isAdmin
    ? [...items, { title: "Admin", href: "/app/admin", icon: ShieldCheck }]
    : items;

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3">
        <Link href="/app" className="text-lg font-bold tracking-tight">
          Turtle
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
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
