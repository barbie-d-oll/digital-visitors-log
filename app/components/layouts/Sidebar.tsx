"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Home,
  LogOut,
  Moon,
  Settings,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { ModeToggle } from "@/components/common/Toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
};

type SidebarContentProps = SidebarProps & {
  mode: "desktop" | "mobile";
};

const navGroups = [
  {
    label: "Main Menu",
    items: [
      {
        name: "Dashboard",
        description: "Overview and insights",
        href: "/dashboard",
        icon: Home,
      },
      {
        name: "Visitors",
        description: "Visitor records",
        href: "/dashboard/visitor",
        icon: UserCheck,
      },
      {
        name: "Staff",
        description: "Hosts and employees",
        href: "/dashboard/staff",
        icon: Users,
      },
    ],
  },
  {
    label: "Management",
    items: [
      
      {
        name: "Reports",
        description: "Reports and exports",
        href: "/dashboard/report",
        icon: ClipboardList,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        name: "Settings",
        description: "Workspace preferences",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];

function SidebarContent({
  setSidebarOpen,
  collapsed,
  setCollapsed,
  mode,
}: SidebarContentProps) {
  const pathname = usePathname();
  const compact = mode === "desktop" && collapsed;

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <div className="flex h-18  items-center gap-3 border-b border-sidebar-border px-4 overflow-hidden sm:px-6 lg:px-8 ">
        <Link
          href="/dashboard"
          onClick={() => setSidebarOpen(false)}
          className="min-w-0 flex-1 rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
        >
          <span
            className={cn(
              "block truncate text-lg font-semibold text-sidebar-foreground transition-opacity",
              compact && "opacity-0",
            )}
          >
            Digital Visitor Log
          </span>
          <span
            className={cn(
              "block truncate text-sm text-sidebar-foreground/65 transition-opacity",
              compact && "opacity-0",
            )}
          >
            Digital welcome desk
          </span>
        </Link>

        {mode === "desktop" ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            aria-pressed={collapsed}
          >
            {collapsed ? (
              <ChevronRight className="size-5" />
            ) : (
              <ChevronLeft className="size-5" />
            )}
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 overflow-hidden scroll-auto h-full px-4 py-5">
        <div className="space-y-7">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p
                className={cn(
                  "mb-2 px-3 text-sm font-semibold text-sidebar-foreground/58 transition-opacity",
                  compact && "opacity-0",
                )}
              >
                {group.label}
              </p>

              <div className="space-y-2">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      title={compact ? item.name : undefined}
                      onClick={() => setSidebarOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex min-h-16 items-center gap-4 rounded-lg px-4 py-1 outline-none transition focus-visible:ring-3 focus-visible:ring-ring/30",
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        compact && "min-h-12 justify-center px-0",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-6 shrink-0",
                          active
                            ? "text-sidebar-primary-foreground"
                            : "text-sidebar-foreground/65 group-hover:text-sidebar-accent-foreground",
                        )}
                      />
                      <span
                        className={cn(
                          "min-w-0 transition-opacity",
                          compact && "hidden",
                        )}
                      >
                        <span className="block truncate text-base font-semibold">
                          {item.name}
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 block truncate text-sm",
                            active
                              ? "text-sidebar-primary-foreground/90"
                              : "text-sidebar-foreground/65",
                          )}
                        >
                          {item.description}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t border-sidebar-border px-4 py-5">
        <div
          className={cn(
            "mb-3 flex items-center gap-4",
            compact && "justify-center",
          )}
        >
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-lg border border-sidebar-border",
              compact && "hidden",
            )}
          >
            <ModeToggle />
          </span>
          <span
            className={cn(
              "flex min-w-0 flex-1 items-center justify-between gap-3 transition-opacity",
              compact && "hidden",
            )}
          >
            <span className="text-base font-semibold text-sidebar-foreground">
              Theme
            </span>
          </span>
          {compact ? <ModeToggle /> : null}
        </div>

        <Button
          asChild
          variant="ghost"
          className={cn(
            "h-12 w-full justify-start gap-4 px-0 text-destructive hover:bg-destructive/10 hover:text-destructive",
            compact && "justify-center",
          )}
        >
          <Link href="/logout" title={compact ? "Sign out" : undefined}>
            <LogOut className="size-5" />
            <span className={cn("font-semibold", compact && "hidden")}>
              Sign out
            </span>
          </Link>
        </Button>
      </div>
    </>
  );
}

export default function Sidebar(props: SidebarProps) {
  return (
    <>
      {props.sidebarOpen ? (
        <button
          type="button"
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => props.setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-80 h-full flex-col border-r border-sidebar-border   text-sidebar-foreground transition-transform duration-300 ease-out md:hidden",
          props.sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent {...props} mode="mobile" />
      </aside>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden h-screen shrink-0 flex-col border-r border-sidebar-border   text-sidebar-foreground transition-[width] duration-300 ease-out md:flex",
          props.collapsed ? "w-20" : "w-80",
        )}
      >
        <SidebarContent {...props} mode="desktop" />
      </aside>
    </>
  );
}
