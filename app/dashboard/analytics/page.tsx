"use client";

import { useEffect, useState } from "react";
import { BarChart3, Clock, TrendingUp, Users } from "lucide-react";

import {
  DashboardPanel,
  LoadingState,
  PageHeader,
  SelectField,
} from "../../_components/dashboard/DashboardPrimitives";

interface Analytics {
  summary: {
    total: number;
    checkedIn: number;
    signedOut: number;
    avgDurationMinutes: number;
    avgPerDay: number;
  };
  peakHours: { hour: number; count: number }[];
  busiestDays: { day: string; count: number }[];
  purposeBreakdown: { purpose: string; count: number }[];
  topHosts: { name: string; count: number }[];
  dailyTrend: { date: string; count: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState("30");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?days=${days}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.ok) setData(res);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [days]);

  const formatHour = (h: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour} ${period}`;
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Visitor Analytics"
        description="Insights into visitor patterns, peak times, and team activity."
        actions={
          <SelectField
            value={days}
            onChange={(e) => setDays(e.target.value)}
            aria-label="Time period"
          >
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </SelectField>
        }
      />

      {loading ? (
        <LoadingState label="Loading analytics" />
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile icon={Users} label="Total Visitors" value={String(data.summary.total)} />
            <StatTile icon={TrendingUp} label="Avg / Day" value={String(data.summary.avgPerDay)} />
            <StatTile icon={Clock} label="Avg Duration" value={`${data.summary.avgDurationMinutes} min`} />
            <StatTile icon={BarChart3} label="Currently In" value={String(data.summary.checkedIn)} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <DashboardPanel title="Peak Hours" description="When visitors arrive most often.">
              <div className="space-y-3">
                {data.peakHours.map((h) => (
                  <div key={h.hour} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{formatHour(h.hour)}</span>
                    <div className="flex items-center gap-3">
                      <div className="h-2 rounded-full bg-primary/20" style={{ width: `${Math.max(20, (h.count / (data.peakHours[0]?.count || 1)) * 120)}px` }}>
                        <div className="h-full rounded-full bg-primary" style={{ width: "100%" }} />
                      </div>
                      <span className="text-sm font-bold text-foreground w-8 text-right">{h.count}</span>
                    </div>
                  </div>
                ))}
                {data.peakHours.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
              </div>
            </DashboardPanel>

            <DashboardPanel title="Busiest Days" description="Day of week breakdown.">
              <div className="space-y-3">
                {data.busiestDays.map((d) => (
                  <div key={d.day} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{d.day}</span>
                    <div className="flex items-center gap-3">
                      <div className="h-2 rounded-full bg-primary/20" style={{ width: `${Math.max(20, (d.count / (data.busiestDays[0]?.count || 1)) * 120)}px` }}>
                        <div className="h-full rounded-full bg-primary" style={{ width: "100%" }} />
                      </div>
                      <span className="text-sm font-bold text-foreground w-8 text-right">{d.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </DashboardPanel>

            <DashboardPanel title="Visit Purpose" description="Why visitors come.">
              <div className="space-y-3">
                {data.purposeBreakdown.map((p) => (
                  <div key={p.purpose} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{p.purpose}</span>
                    <span className="text-sm font-bold">{p.count}</span>
                  </div>
                ))}
                {data.purposeBreakdown.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
              </div>
            </DashboardPanel>

            <DashboardPanel title="Top Hosts" description="Most visited staff members.">
              <div className="space-y-3">
                {data.topHosts.map((h, i) => (
                  <div key={h.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      <span className="text-muted-foreground mr-2">#{i + 1}</span>
                      {h.name}
                    </span>
                    <span className="text-sm font-bold">{h.count} visits</span>
                  </div>
                ))}
                {data.topHosts.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
              </div>
            </DashboardPanel>
          </div>
        </>
      ) : (
        <p className="text-muted-foreground">Failed to load analytics.</p>
      )}
    </div>
  );
}

function StatTile({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-enterprise-sm">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-lg  text-primary">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}
