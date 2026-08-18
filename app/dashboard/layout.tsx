"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import Header from "../_components/layouts/Header";
import Sidebar from "../_components/layouts/Sidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="size-5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      <div
        className={cn(
          "min-h-screen min-w-0 transition-[margin] duration-300 ease-out",
          sidebarCollapsed ? "md:ml-20" : "md:ml-80",
        )}
      >
        <Header setSidebarOpen={setSidebarOpen} user={user} />

        <main className="min-w-0 overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
