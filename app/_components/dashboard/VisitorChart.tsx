"use client";

import { useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { selectControlClassName } from "./DashboardPrimitives";

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type FirestoreDate = Date | string | { toDate: () => Date } | null | undefined;

interface Visitor {
  checkIn?: FirestoreDate;
  checkOut?: FirestoreDate;
  [key: string]: unknown;
}

interface VisitorChartProps {
  visitors: Visitor[];
}

type ActivityType = "checkins" | "checkouts";

type ActivityPoint = {
  day: string;
  visitors: number;
};

const getVisitorDate = (value: FirestoreDate): Date | null => {
  if (!value) return null;

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return value.toDate ? value.toDate() : null;
};

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const getLast7Days = () => {
  const today = startOfDay(new Date());

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));

    return {
      label: dayLabels[date.getDay()],
      date,
    };
  });
};

const getChartData = (visitors: Visitor[], type: ActivityType): ActivityPoint[] => {
  const fieldName = type === "checkins" ? "checkIn" : "checkOut";
  const days = getLast7Days();
  const counts = new Map<number, number>();

  visitors.forEach((visitor) => {
    const visitorDate = getVisitorDate(visitor[fieldName]);
    if (!visitorDate) return;

    const dayKey = startOfDay(visitorDate).getTime();
    const startKey = days[0].date.getTime();
    const endKey = days[6].date.getTime();

    if (dayKey < startKey || dayKey > endKey) return;

    counts.set(dayKey, (counts.get(dayKey) ?? 0) + 1);
  });

  return days.map((day) => ({
    day: day.label,
    visitors: counts.get(day.date.getTime()) ?? 0,
  }));
};

export default function VisitorChart({ visitors }: VisitorChartProps) {
  const [type, setType] = useState<ActivityType>("checkins");

  const data = useMemo(() => getChartData(visitors, type), [visitors, type]);

  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.visitors, 0),
    [data],
  );

  const summaries = useMemo(() => {
    const today = data[data.length - 1]?.visitors ?? 0;
    const average = Math.round(total / 7);
    const peakDay = data.reduce(
      (best, current) =>
        current.visitors > best.visitors ? current : best,
      data[0] ?? { day: "-", visitors: 0 },
    );

    return [
      { label: "Today", value: String(today) },
      { label: "This week", value: String(total) },
      { label: "Average / day", value: String(average) },
      // { label: "Peak day", value: peakDay.visitors > 0 ? peakDay.day : "-" },
    ];
  }, [data, total]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Visitor Activity</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} recorded movements across the last 7 days.
          </p>
        </div>

        <select
          value={type}
          onChange={(event) => setType(event.target.value as ActivityType)}
          className={selectControlClassName}
          aria-label="Activity type"
        >
          <option value="checkins">Check-ins</option>
          <option value="checkouts">Check-outs</option>
        </select>
      </div>

      <div className="h-72 w-full md:h-80 rounded-3xl border border-border bg-card/80 p-4 shadow-xl">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 16, right: 16, bottom: 8, left: -12 }}
          >
            <defs>
              <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(56, 189, 248, 0.68)" />
                <stop offset="100%" stopColor="rgba(56, 189, 248, 0.08)" />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="rgba(148, 163, 184, 0.16)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12, fontWeight: 600 }}
              padding={{ left: 8, right: 8 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              width={32}
            />
            <Tooltip
              cursor={{ stroke: "rgba(56, 189, 248, 0.35)", strokeWidth: 2 }}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                boxShadow: "var(--shadow-medium)",
                color: "var(--popover-foreground)",
                padding: "12px 14px",
              }}
              formatter={(value: unknown) => [value as number, "Visitors"]}
            />
            <Area
              type="monotone"
              dataKey="visitors"
              stroke="transparent"
              fill="url(#visitorGradient)"
              isAnimationActive={true}
              animationDuration={1500}
            />
            <Line
              type="monotone"
              dataKey="visitors"
              stroke="var(--primary)"
              strokeWidth={4}
              dot={{ r: 0 }}
              activeDot={{
                r: 7,
                fill: "var(--card)",
                stroke: "var(--primary)",
                strokeWidth: 3,
              }}
              animationDuration={1200}
              isAnimationActive={true}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {summaries.map((summary) => (
          <div
            key={summary.label}
            className="rounded-3xl border border-border bg-surface-muted/70 p-4 shadow-sm backdrop-blur"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {summary.label}
            </p>
            <p className="mt-3 text-2xl font-semibold text-foreground">
              {summary.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
