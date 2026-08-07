 "use client"
import { Bell, Building2, Lock, ShieldCheck } from "lucide-react";

import {
  DashboardPanel,
  PageHeader,
  StatusBadge,
} from "../../components/dashboard/DashboardPrimitives";

const settingsRows = [
  {
    label: "Workspace",
    value: "HWS Company",
    detail: "Primary company profile",
    icon: Building2,
  },
  {
    label: "Access",
    value: "Administrator",
    detail: "Barbara Logah",
    icon: ShieldCheck,
  },
  {
    label: "Security",
    value: "Protected",
    detail: "Authenticated dashboard access",
    icon: Lock,
  },
  {
    label: "Notifications",
    value: "Email and SMS",
    detail: "Default host notification channels",
    icon: Bell,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-8">
        <PageHeader
          title="Settings"
          description="Review workspace preferences and dashboard administration details."
        />

        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
          <DashboardPanel
            title="Workspace Settings"
            description="Core visitor desk configuration."
            contentClassName="p-0"
          >
            <div className="divide-y divide-border">
              {settingsRows.map((row) => {
                const Icon = row.icon;

                return (
                  <div
                    key={row.label}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          {row.label}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {row.detail}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {row.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </DashboardPanel>

          <DashboardPanel title="System Status">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface-muted/60 p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Visitor desk
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Front desk workflow
                  </p>
                </div>
                <StatusBadge status="Active" />
              </div>

              <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface-muted/60 p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Subscription
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Current company plan
                  </p>
                </div>
                <StatusBadge status="Trial" />
              </div>
            </div>
          </DashboardPanel>
        </div>
    </div>
  );
}
