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
    <aside className="fixed top-0 left-0 w-64 h-screen bg-slate-900 text-white flex flex-col shadow-lg">

      <div className="p-6">

        <h1 className="text-2xl font-bold">
          Digital Visitor Log
        </h1>

        <p className="text-gray-400 text-sm mt-2 mb-8">
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
                      ? "bg-blue-600 text-white"
                      : "hover:bg-slate-800 text-gray-300"
                  }`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}

        </nav>

      </div>

      <div className="mt-auto border-t border-slate-700 p-6">

        <p className="font-semibold">
          Barbara Logah
        </p>

        <p className="text-sm text-gray-400 mb-4">
          Company Administrator
        </p>

        <button className="w-full flex items-center justify-center gap-2 bg-red-600 py-2 rounded-lg hover:bg-red-700 transition">
          <LogOut size={18} />
          Logout
        </button>

      </div>

    </aside>
  );
}