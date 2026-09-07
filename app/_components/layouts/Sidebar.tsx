"use client";

/* eslint-disable @next/next/no-img-element -- Organization logos can point to arbitrary external domains. */

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  Calendar,
  ClipboardCheck,
  ClipboardList,
  Home,
  Layers,
  LogOut,
  MapPin,
  PanelLeftClose,
  ScanLine,
  ScrollText,
  Settings,
  ShieldAlert,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import { ModeToggle } from "@/components/common/Toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth, type UserProfile } from "@/context/AuthContext";

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
};

type HeaderProps = {
  setSidebarOpen: (open: boolean) => void;
  user: UserProfile | null;
};

type SidebarContentProps = SidebarProps &
  HeaderProps & {
    mode: "desktop" | "mobile";
  };

type NavItem = {
  name: string;
  description: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  departmentHeadsOnly?: boolean;
  tourId?: string;
};

const navGroups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Main Menu",
    items: [
      {
        name: "Dashboard",
        description: "Overview and insights",
        href: "/dashboard",
        icon: Home,
        tourId: "tour-nav-dashboard",
      },
      {
        name: "Visitors",
        description: "Visitor records",
        href: "/dashboard/visitor",
        icon: UserCheck,
        tourId: "tour-nav-visitors",
      },
      {
        name: "Assignments",
        description: "Department queue",
        href: "/dashboard/department-assignments",
        icon: ClipboardCheck,
        departmentHeadsOnly: true,
      },
      {
        name: "Appointments",
        description: "Pre-registrations",
        href: "/dashboard/appointments",
        icon: Calendar,
        tourId: "tour-nav-appointments",
      },
      {
        name: "Staff",
        description: "Hosts and employees",
        href: "/dashboard/staff",
        icon: Users,
        tourId: "tour-nav-staff",
      },
      {
        name: "Departments",
        description: "Teams and heads",
        href: "/dashboard/departments",
        icon: Layers,
        tourId: "tour-nav-departments",
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        name: "Analytics",
        description: "Insights and trends",
        href: "/dashboard/analytics",
        icon: BarChart3,
      },
      {
        name: "Reports",
        description: "Reports and exports",
        href: "/dashboard/report",
        icon: ClipboardList,
      },
      {
        name: "Blocklist",
        description: "Blocked and watchlisted",
        href: "/dashboard/blocklist",
        icon: ShieldAlert,
      },
      {
        name: "Emergency",
        description: "Who's on-premises now",
        href: "/dashboard/emergency",
        icon: AlertTriangle,
      },
      {
        name: "Locations",
        description: "Multi-site management",
        href: "/dashboard/locations",
        icon: MapPin,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        name: "Kiosk & QR",
        description: "Reception setup",
        href: "/dashboard/kiosk",
        icon: ScanLine,
        tourId: "tour-nav-kiosk",
      },
      {
        name: "Audit Log",
        description: "Activity history",
        href: "/dashboard/audit-log",
        icon: ScrollText,
      },
      {
        name: "Settings",
        description: "Workspace preferences",
        href: "/dashboard/settings",
        icon: Settings,
        tourId: "tour-nav-settings",
      },
    ],
  },
];

function SidebarContent({
  setSidebarOpen,
  user,
  collapsed,
  setCollapsed,
  mode,
}: SidebarContentProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const compact = mode === "desktop" && collapsed;

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex h-full flex-col bg-background  text-sidebar-foreground">
      {/* Brand Header */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-sidebar-border transition-all",
          compact ? "justify-center px-2" : "justify-between px-4 sm:px-5",
        )}
      >
        <Link
          href="/dashboard"
          onClick={() => setSidebarOpen(false)}
          title={compact ? user?.organizationName || "Dashboard" : undefined}
          className={cn(
            "group flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            compact && "justify-center",
          )}
        >
          {/* Logo badge */}
          <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground shadow-xs transition-transform group-hover:scale-105">
            {user?.organizationLogoUrl ? (
              <img
                src={user.organizationLogoUrl}
                alt={`${user.organizationName || "Organization"} logo`}
                className="size-full object-cover"
              />
            ) : (
              <Building2 className="size-5" />
            )}
          </span>

          {/* Org & Desk Info */}
          {!compact && (
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-bold leading-tight text-sidebar-foreground">
                {user?.organizationName || "Visitors Log"}
              </p>
              <p className="mt-0.5 truncate text-[11px] font-medium text-sidebar-foreground/65">
                {user?.name ? `${user.name} ` : "Visitor Reception"}
              </p>
            </div>
          )}
        </Link>

        {/* Action button (Collapse on Desktop / Close on Mobile) */}
        {mode === "desktop" ? (
          !compact && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 rounded-lg text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => setCollapsed(!collapsed)}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              {/* <PanelLeftClose className="size-4.5" /> */}
            </Button>
          )
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 rounded-lg text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation drawer"
          >
            <X className="size-5" />
          </Button>
        )}
      </div>

      {/* Navigation List */}
      <nav
        aria-label="Sidebar navigation"
        className={cn(
          "flex-1 overflow-y-auto  overflow-x-hidden py-3 ",
          compact ? "px-2" : "px-3 sm:px-4",
        )}
      >
        <div className="space-y-4">
          {navGroups.map((group) => {
            const filteredItems = group.items.filter(
              (item) => !item.departmentHeadsOnly || user?.isDepartmentHead,
            );

            if (filteredItems.length === 0) return null;

            return (
              <div key={group.label} className="space-y-1">
                {/* Group Heading */}
                {!compact ? (
                  <p className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                    {group.label}
                  </p>
                ) : (
                  <div
                    className="mx-auto  my-1 h-px w-6 bg-sidebar-border/60"
                    aria-hidden="true"
                  />
                )}

                {/* Items */}
                <div className="space-y-1">
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.name}
                        id={item.tourId}
                        data-tour={item.tourId}
                        href={item.href}
                        title={
                          compact
                            ? `${item.name} — ${item.description}`
                            : undefined
                        }
                        onClick={() => setSidebarOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group relative flex  items-center rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          compact
                            ? "size-10 justify-center mx-auto"
                            : "min-h-11 w-full gap-3 px-3 py-1.5",
                          active
                            ? "bg-primary text-primary-foreground text-lg font-bold shadow-xs "
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
                        )}
                      >
                        {/* Active pill indicator for expanded state */}
                        {active && !compact && (
                          <span
                            aria-hidden="true"
                            className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary-foreground/80"
                          />
                        )}

                        <Icon
                          className={cn(
                            "size-5 shrink-0 transition-transform group-hover:scale-105",
                            active
                              ? "text-primary-foreground"
                              : "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground",
                          )}
                        />

                        {!compact && (
                          <div className="min-w-0 flex-1 text-left">
                            <span className="block truncate text-md font-semibold leading-tight">
                              {item.name}
                            </span>
                            <span
                              className={cn(
                                "block truncate text-[15px]  ",
                                active
                                  ? "text-primary-foreground/80 text-[15px]"
                                  : "text-sidebar-foreground/55 group-hover:text-sidebar-foreground/75 text-[15px]",
                              )}
                            >
                              {item.description}
                            </span>
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer / Utilities */}
      <div
        className={cn(
          "shrink-0 border-t border-sidebar-border bg-background py-3",
          compact ? "px-2" : "px-3 sm:px-4",
        )}
      >
        <div className="space-y-1.5">
          {/* Theme switcher */}
          {!compact ? (
            <div className="flex items-center justify-between rounded-lg px-2.5 py-1 text-md font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/50">
              <span className="text-md font-medium">Appearance</span>
              <ModeToggle
                variant="ghost"
                className="size-8 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              />
            </div>
          ) : (
            <div className="flex justify-center">
              <ModeToggle
                variant="ghost"
                className="size-9 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              />
            </div>
          )}

          {/* Sign out */}
          {!compact ? (
            <Button
              variant="ghost"
              className="h-9 w-full justify-start gap-3 rounded-lg px-2.5 text-md font-medium text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive"
              onClick={() => logout()}
            >
              <LogOut className="size-4 shrink-0" />
              <span>Sign out</span>
            </Button>
          ) : (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="size-9 rounded-lg text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive"
                onClick={() => logout()}
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          )}

          {/* Online status indicator */}
          {/* {!compact && (
            <div className="flex items-center gap-2 px-2.5 pt-1 text-[10px] text-sidebar-foreground/50">
              <span className="size-1.5 shrink-0 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
              <span className="truncate">Desk Online • Secure</span>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}

export default function Sidebar(props: SidebarProps) {
  const { user } = useAuth();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {props.sidebarOpen ? (
        <button
          type="button"
          aria-label="Close navigation drawer overlay"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300 md:hidden"
          onClick={() => props.setSidebarOpen(false)}
        />
      ) : null}

      {/* Mobile Drawer */}
      <aside
        aria-label="Mobile Navigation Drawer"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-[280px] max-w-[85vw] flex-col border-r border-sidebar-border bg-sidebar shadow-2xl transition-transform duration-300 ease-out sm:w-80 md:hidden",
          props.sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent user={user} {...props} mode="mobile" />
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside
        aria-label="Desktop Navigation Sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-in-out md:flex",
          props.collapsed ? "w-[4.5rem]" : "w-72",
        )}
      >
        <SidebarContent user={user} {...props} mode="desktop" />
      </aside>
    </>
  );
}
