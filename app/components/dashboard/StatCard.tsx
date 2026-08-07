import type { ComponentType } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: number | string;
  description?: string;
  trend?: string;
  trendTone?: "positive" | "negative" | "neutral";
  icon?: ComponentType<{ className?: string }>;
};

export default function StatCard({
  title,
  value,
  description,
  trend,
  trendTone = "neutral",
  icon: Icon,
}: StatCardProps) {
  const TrendIcon = trendTone === "negative" ? ArrowDownRight : ArrowUpRight;

  return (
    <div className="group rounded-lg border border-border bg-card p-5 shadow-enterprise-sm transition hover:-translate-y-0.5 hover:shadow-enterprise-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal text-foreground md:text-4xl">
            {value}
          </h2>
        </div>
        {Icon ? (
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
            <Icon className="size-5" />
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex min-h-5 flex-wrap items-center gap-2 text-sm">
        {trend ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
              trendTone === "positive" &&
                "bg-success/10 text-success ring-1 ring-success/20",
              trendTone === "negative" &&
                "bg-destructive/10 text-destructive ring-1 ring-destructive/20",
              trendTone === "neutral" &&
                "bg-muted text-muted-foreground ring-1 ring-border",
            )}
          >
            <TrendIcon className="size-3.5" />
            {trend}
          </span>
        ) : null}
        {description ? (
          <span className="text-muted-foreground">{description}</span>
        ) : null}
      </div>
    </div>
  );
}
