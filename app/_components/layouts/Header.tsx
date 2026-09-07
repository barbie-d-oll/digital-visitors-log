"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertCircle,
  Bell,
  Calendar,
  ChevronDown,
  ChevronRight,
  Compass,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  UserCheck,
  UserRound,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FullscreenButton from "@/components/common/Fullscreen";
import { Button } from "@/components/ui/button";
import { triggerDashboardTour } from "@/app/dashboard/_components/DashboardTour";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, type UserProfile } from "@/context/AuthContext";
import type { NotificationItem } from "@/app/api/notifications/route";

type HeaderProps = {
  setSidebarOpen: (open: boolean) => void;
  user: UserProfile | null;
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
};

const routeTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/visitor": "Visitors",
  "/dashboard/visitor/register": "Register Visitor",
  "/dashboard/department-assignments": "Assignments",
  "/dashboard/appointments": "Appointments",
  "/dashboard/appointments/new": "New Appointment",
  "/dashboard/staff": "Staff Directory",
  "/dashboard/staff/register": "Add Staff",
  "/dashboard/departments": "Departments",
  "/dashboard/departments/register": "Add Department",
  "/dashboard/analytics": "Analytics",
  "/dashboard/report": "Reports",
  "/dashboard/blocklist": "Security Blocklist",
  "/dashboard/emergency": "Emergency Roll Call",
  "/dashboard/locations": "Locations",
  "/dashboard/kiosk": "Kiosk & QR Reception",
  "/dashboard/audit-log": "Audit History",
  "/dashboard/settings": "Settings",
  "/dashboard/profile/edit": "Edit Profile",
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getNotificationIcon(type: NotificationItem["type"]) {
  switch (type) {
    case "check_in":
      return (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <UserCheck className="size-4" />
        </span>
      );
    case "check_out":
      return (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <LogOut className="size-4" />
        </span>
      );
    case "assignment":
      return (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <AlertCircle className="size-4" />
        </span>
      );
    case "appointment":
      return (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
          <Calendar className="size-4" />
        </span>
      );
    default:
      return (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Bell className="size-4" />
        </span>
      );
  }
}

export default function Header({
  setSidebarOpen,
  user,
  collapsed = false,
  setCollapsed,
}: HeaderProps) {
  const { logout } = useAuth();
  const pathname = usePathname();

  // Dynamic notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [lastReadTimestamp, setLastReadTimestamp] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      const stored = localStorage.getItem(
        "visitors_log_last_read_notifications",
      );
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  const fetchNotifications = useCallback(async () => {
    try {
      setNotificationsLoading(true);
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch via async timeout to avoid cascading renders in synchronous effect body
    const timeout = setTimeout(() => {
      void fetchNotifications();
    }, 50);

    const interval = setInterval(() => {
      void fetchNotifications();
    }, 45000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  const markAllAsRead = () => {
    const now = Date.now();
    setLastReadTimestamp(now);
    try {
      localStorage.setItem(
        "visitors_log_last_read_notifications",
        now.toString(),
      );
    } catch {
      // Ignore
    }
  };

  const unreadNotifications = notifications.filter(
    (n) => new Date(n.timestamp).getTime() > lastReadTimestamp,
  );
  const unreadCount = unreadNotifications.length;

  // Determine active title or breadcrumbs
  const currentTitle =
    routeTitles[pathname] ||
    pathname
      .split("/")
      .filter(Boolean)
      .pop()
      ?.replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) ||
    "Overview";

  const isHome = pathname === "/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md transition-colors">
      <div className="flex h-16 items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
        {/* Left: Mobile Drawer Trigger + Desktop Sidebar Toggle + Breadcrumbs */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {/* Mobile hamburger button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 shrink-0 rounded-lg text-muted-foreground hover:bg-muted/80 hover:text-foreground md:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation drawer"
          >
            <Menu className="size-5" />
          </Button>

          {/* Desktop collapse / expand toggle */}
          {setCollapsed && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hidden size-9 shrink-0 rounded-lg text-muted-foreground hover:bg-muted/80 hover:text-foreground md:inline-flex"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <PanelLeftOpen className="size-5" />
              ) : (
                <PanelLeftClose className="size-5" />
              )}
            </Button>
          )}

          <div
            className="hidden h-4 w-px bg-border/60 md:block"
            aria-hidden="true"
          />

          {/* Breadcrumbs / Page Context */}
          <nav
            aria-label="Breadcrumbs"
            className="flex min-w-0 items-center text-md sm:text-lg"
          >
            <Link
              href="/dashboard"
              className="hidden font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
            >
              Dashboard
            </Link>

            {!isHome && (
              <>
                <ChevronRight className="mx-1.5 hidden size-3.5 shrink-0 text-muted-foreground/60 sm:inline-block" />
                <span className="truncate font-semibold text-foreground">
                  {currentTitle}
                </span>
              </>
            )}

            {isHome && (
              <span className="truncate font-semibold text-foreground sm:hidden">
                Overview
              </span>
            )}
          </nav>
        </div>

        {/* Right: Actions (Tour, Fullscreen, Notifications, User Menu) */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Quick Tour Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => triggerDashboardTour()}
            className="size-9 rounded-lg text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
            title="Take a quick tour"
            aria-label="Take a quick tour"
          >
            <Compass className="size-4.5" />
          </Button>

          {/* Fullscreen Button */}
          <FullscreenButton
            variant="ghost"
            className="size-9 rounded-lg text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
          />

          {/* Dynamic Notifications Dropdown */}
          <DropdownMenu
            onOpenChange={(open) => {
              if (open) void fetchNotifications();
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="relative size-9 rounded-lg text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell className="size-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-emerald-500 ring-2 ring-background" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 shadow-lg">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    Notifications
                  </span>
                  {unreadCount > 0 ? (
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      {unreadCount} new
                    </span>
                  ) : (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      Up to date
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-[11px] text-muted-foreground transition-colors hover:text-foreground hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification List */}
              {notificationsLoading && notifications.length === 0 ? (
                <div className="flex items-center justify-center gap-2 p-6 text-xs text-muted-foreground">
                  <span className="size-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                  <span>Loading alerts...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  <Bell className="mx-auto mb-2 size-6 text-muted-foreground/30" />
                  <p className="font-medium text-foreground">No recent alerts</p>
                  <p className="mt-0.5 text-muted-foreground">
                    All visitor and desk activity is up to date.
                  </p>
                </div>
              ) : (
                <div className="max-h-80 divide-y divide-border/50 overflow-y-auto text-xs">
                  {notifications.map((item) => {
                    const isUnread =
                      new Date(item.timestamp).getTime() > lastReadTimestamp;
                    return (
                      <Link
                        key={item.id}
                        href={item.link}
                        className="flex items-start gap-3 p-3 transition-colors hover:bg-muted/50"
                      >
                        {getNotificationIcon(item.type)}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <p className="truncate font-semibold text-foreground">
                              {item.title}
                            </p>
                            <span className="shrink-0 text-[10px] text-muted-foreground/70">
                              {item.timeAgo}
                            </span>
                          </div>
                          <p className="mt-0.5 line-clamp-2 leading-snug text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        {isUnread && (
                          <span
                            className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500"
                            title="Unread"
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-border/70 bg-muted/20 px-4 py-2 text-xs font-medium">
                <Link
                  href="/dashboard/visitor"
                  className="text-primary hover:underline"
                >
                  Visitor queue →
                </Link>
                <Link
                  href="/dashboard/appointments"
                  className="text-muted-foreground transition-colors hover:text-foreground hover:underline"
                >
                  Appointments →
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div
            className="hidden h-5 w-px bg-border/60 sm:block"
            aria-hidden="true"
          />

          {/* User Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="h-9 gap-2.5 rounded-lg px-1.5 transition-colors hover:bg-muted/80 sm:px-2"
                aria-label="Open user menu"
              >
                <Avatar className="size-7.5 border border-border/70">
                  <AvatarImage
                    src={user?.avatar || ""}
                    alt={user?.name || "User"}
                  />
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {user ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden min-w-0 text-left sm:block">
                  <span className="block max-w-32 truncate text-xs font-semibold leading-tight text-foreground lg:max-w-40">
                    {user?.name || "User"}
                  </span>
                  <span className="block max-w-32 truncate text-md leading-tight text-muted-foreground lg:max-w-40">
                    {user?.organizationName || "Organization"}
                  </span>
                </div>
                <ChevronDown className="hidden size-3.5 text-muted-foreground sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-1 shadow-lg">
              <DropdownMenuLabel className="p-2">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9 border border-border/70">
                    <AvatarImage
                      src={user?.avatar || ""}
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                      {user ? getInitials(user.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user?.name || "User"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user?.email || ""}
                    </p>
                    <span className="mt-1 inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {user?.organizationName || "Front Desk"}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  triggerDashboardTour();
                }}
                className="gap-2 text-xs"
              >
                <Compass className="size-4 text-muted-foreground" />
                Quick tour
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="gap-2 text-xs">
                <Link href="/dashboard/profile/edit">
                  <UserRound className="size-4 text-muted-foreground" />
                  Edit profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="gap-2 text-xs">
                <Link href="/dashboard/settings">
                  <Settings className="size-4 text-muted-foreground" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => {
                  void logout();
                }}
                className="gap-2 text-xs font-medium"
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
