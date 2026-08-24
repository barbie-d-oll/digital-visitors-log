"use client";

import { Bell, Menu } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FullscreenButton from "@/components/common/Fullscreen";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { UserProfile } from "@/context/AuthContext";

type HeaderProps = {
  setSidebarOpen: (open: boolean) => void;
  user: UserProfile | null;
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Header({ setSidebarOpen, user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex h-[4.5rem] items-center justify-between px-4 sm:px-8 lg:px-10">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </Button>

        <div className="hidden md:block" aria-hidden="true" />

        <div className="ml-auto flex items-center gap-4">
        <FullscreenButton />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-3 text-sm text-muted-foreground">
                No new alerts for the visitor desk.
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarImage
                src={user?.avatar || ""}
                alt={user?.name || "User"}
              />
              <AvatarFallback>
                {user ? getInitials(user.name) : "U"}
              </AvatarFallback>
            </Avatar>
            {/* <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-semibold text-foreground">
                {user?.name || "User"}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {user?.organizationName || "Organization"}
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </header>
  );
}
