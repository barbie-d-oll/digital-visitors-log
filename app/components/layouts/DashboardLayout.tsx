"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
// import type { Dispatch, SetStateAction } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="md:ml-64">

        <Header
          setSidebarOpen={setSidebarOpen}
        />

        <main className="pt-24 px-4 md:px-8 pb-8">
          {children}
        </main>

      </div>

    </div>
  );
}