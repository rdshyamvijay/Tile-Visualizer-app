"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { LayoutGrid, LifeBuoy, LogOut, Settings, CreditCard, Layers, GanttChartSquare } from "lucide-react"

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: GanttChartSquare },
  { href: "/tiles", label: "Tiles", icon: Layers },
  { href: "/credits", label: "Credits", icon: CreditCard },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2">
            <LayoutGrid className="h-7 w-7 text-primary" />
            <span className="font-headline text-2xl font-bold group-data-[collapsible=icon]:hidden">
            TileVision
            </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(`/admin${item.href}`) || (item.href === '/dashboard' && pathname === '/admin')}
                tooltip={item.label}
              >
                <Link href={`/admin${item.href === '/dashboard' ? '' : item.href}`}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Help">
              <LifeBuoy />
              <span>Help</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator />
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Log out" asChild>
                    <Link href="/">
                        <LogOut/>
                        <span>Log out</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  )
}
