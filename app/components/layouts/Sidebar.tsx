"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  UserRound,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const menu = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Companies",
      href: "/dashboard/companies",
      icon: Building2,
    },
    {
      name: "Staff",
      href: "/dashboard/staff",
      icon: Users,
    },
    {
      name: "Visitors",
      href: "/dashboard/visitor",
      icon: UserRound,
    },
    {
      name: "Reports",
      href: "/dashboard/report",
      icon: FileText,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="fixed top-0 left-0 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-lg">

      <div className="p-6">

        <h1 className="text-2xl font-bold">
          Digital Visitor Log
        </h1>

        <p className="mt-2 mb-8 text-sm text-sidebar-foreground/60">
          MAIN MENU
        </p>

        <nav className="space-y-2">

          {menu.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition
                  ${
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}

        </nav>

      </div>

      <div className="mt-auto border-t border-sidebar-border p-6">

        <p className="font-semibold">
          Barbara Logah
        </p>

        <p className="mb-4 text-sm text-sidebar-foreground/60">
          Company Administrator
        </p>

        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-destructive py-2 text-destructive-foreground transition hover:bg-destructive/90">
          <LogOut size={18} />
          Logout
        </button>

      </div>

    </aside>
  );
}
