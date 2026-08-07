"use client";

import Link from "next/link";
import type {
  ComponentType,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";
import { ArrowUpRight, Inbox, Loader2, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type IconType = ComponentType<{ className?: string }>;

type Tone = "primary" | "success" | "warning" | "info" | "neutral";

const toneStyles: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary ring-primary/20",
  success: "bg-success/10 text-success ring-success/20",
  warning: "bg-warning/10 text-warning ring-warning/20",
  info: "bg-info/10 text-info ring-info/20",
  neutral: "bg-muted text-muted-foreground ring-border",
};

export const fieldControlClassName =
  "min-h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-input/20";

export const selectControlClassName = cn(
  fieldControlClassName,
  "appearance-none pr-9",
);

export function PageHeader({
  title,
  description,
  actions,
  meta,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border/80 pb-6 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {meta ? <div className="mb-3">{meta}</div> : null}
        <h1 className="text-2xl font-semibold tracking-normal text-foreground md:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function DashboardPanel({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <section
      className={cn(
        "min-w-0 overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-enterprise-sm",
        className,
      )}
    >
      {title || description || action ? (
        <div className="flex flex-col gap-3 border-b border-border/80 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title ? (
              <h2 className="text-base font-semibold tracking-normal">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div className={cn("p-5", contentClassName)}>{children}</div>
    </section>
  );
}

export function Toolbar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-border/80 bg-surface-muted/60 px-5 py-4 md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SearchField({
  label = "Search",
  className,
  inputClassName,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  inputClassName?: string;
}) {
  return (
    <label className={cn("relative block w-full", className)}>
      <span className="sr-only">{label}</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        className={cn(fieldControlClassName, "pl-9", inputClassName)}
        {...props}
      />
    </label>
  );
}

export function FormField({
  label,
  htmlFor,
  helper,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  helper?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-foreground"
      >
        {label}
      </label>
      {children}
      {helper ? <p className="text-xs leading-5 text-muted-foreground">{helper}</p> : null}
    </div>
  );
}

export function SelectField({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(selectControlClassName, className)} {...props} />;
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: IconType;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-muted/50 px-6 py-10 text-center">
      <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-36 items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      {label}
    </div>
  );
}

export function StatusBadge({ status }: { status?: string }) {
  const normalized = status?.trim().toLowerCase() ?? "";

  const className =
    normalized === "active" ||
    normalized === "approved" ||
    normalized === "checked in"
      ? "border-success/20 bg-success/10 text-success"
      : normalized === "pending" || normalized === "trial"
        ? "border-warning/20 bg-warning/10 text-warning"
        : normalized === "rejected" || normalized === "inactive"
          ? "border-destructive/20 bg-destructive/10 text-destructive"
          : normalized === "checked out"
            ? "border-border bg-muted text-muted-foreground"
            : "border-info/20 bg-info/10 text-info";

  return (
    <Badge variant="outline" className={cn("capitalize", className)}>
      {status || "Unknown"}
    </Badge>
  );
}

export function ActionLink({
  href,
  title,
  description,
  icon: Icon,
  tone = "primary",
}: {
  href: string;
  title: string;
  description: string;
  icon: IconType;
  tone?: Tone;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-24 items-start gap-3 rounded-lg border border-border bg-card p-4 text-left shadow-enterprise-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-enterprise-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg ring-1",
          toneStyles[tone],
        )}
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">
          {title}
        </span>
        <span className="mt-1 block text-sm leading-5 text-muted-foreground">
          {description}
        </span>
      </span>
      <ArrowUpRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
    </Link>
  );
}

export function TableFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card shadow-enterprise-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}
