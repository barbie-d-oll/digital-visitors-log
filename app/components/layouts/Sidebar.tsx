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
  X,
} from "lucide-react";

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}: SidebarProps) {
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
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50
          flex h-screen w-64 flex-col
          border-r border-sidebar-border
          bg-sidebar
          text-sidebar-foreground
          shadow-lg
          transition-transform duration-300

          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          md:translate-x-0
        `}
      >
        <div className="flex justify-end p-4 md:hidden">

          <button
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>

        </div>

        <div className="px-6 pb-6">

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
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 transition
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

          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-destructive py-2 text-destructive-foreground hover:bg-destructive/90">
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </aside>
    </>
  );
}