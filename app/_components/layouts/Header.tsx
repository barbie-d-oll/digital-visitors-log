"use client";

import Link from "next/link";
import { Bell, ChevronDown, LogOut, Menu, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FullscreenButton from "@/components/common/Fullscreen";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuth, type UserProfile } from "@/context/AuthContext";

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
  const { logout } = useAuth();

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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="h-auto min-w-0 gap-2 rounded-full px-2 py-1.5"
                aria-label="Open user menu"
              >
                <Avatar size="lg">
                  <AvatarImage
                    src={user?.avatar || ""}
                    alt={user?.name || "User"}
                  />
                  <AvatarFallback>
                    {user ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden min-w-0 text-left sm:block">
                  <span className="block max-w-40 truncate text-sm font-semibold text-foreground">
                    {user?.name || "User"}
                  </span>
                  <span className="block max-w-40 truncate text-xs text-muted-foreground">
                    {user?.organizationName || "Organization"}
                  </span>
                </span>
                <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="p-2">
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar size="lg">
                    <AvatarImage
                      src={user?.avatar || ""}
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback>
                      {user ? getInitials(user.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {user?.name || "User"}
                    </span>
                    <span className="block truncate text-xs font-normal text-muted-foreground">
                      {user?.email || ""}
                    </span>
                  </span>
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile/edit">
                  <UserRound className="size-4" />
                  Edit profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => {
                  void logout();
                }}
              >
                <LogOut className="size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
