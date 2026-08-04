"use client";

import { Bell, Search, Menu } from "lucide-react";
import FullscreenButton from "@/components/common/Fullscreen";
import { ModeToggle } from "@/components/common/Toggle";

type HeaderProps = {
  setSidebarOpen: (open: boolean) => void;
};

export default function Header({
  setSidebarOpen,
}: HeaderProps) {
  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-40 flex h-20 items-center justify-between border-b border-border bg-card px-4 md:px-8 shadow-sm">

      {/* Left */}

      <div className="flex items-center gap-4">

        <button
          className="md:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={26} />
        </button>

        <h1 className="text-xl md:text-3xl font-bold">
          Digital Visitor Log
        </h1>

      </div>

      {/* Right */}

      <div className="flex items-center gap-3">

        <div className="hidden lg:flex items-center rounded-lg border border-input bg-background px-4 py-2">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search..."
            className="ml-2 bg-transparent outline-none"
          />

        </div>

        <ModeToggle />

        <FullscreenButton />

        <button className="rounded-lg border border-input bg-background p-3 hover:bg-accent">
          <Bell size={20} />
        </button>

      </div>

    </header>
  );
}