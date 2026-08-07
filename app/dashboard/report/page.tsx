"use client";
import Link from "next/link";
import { CalendarDays, Download, FileText } from "lucide-react";

import {
  DashboardPanel,
  EmptyState,
  PageHeader,
  StatusBadge,
} from "../../components/dashboard/DashboardPrimitives";
import { Button } from "@/components/ui/button";

const reportTypes = [
  {
    name: "Visitor Activity",
    cadence: "Daily",
    status: "Pending",
  },
  {
    name: "Staff Host Summary",
    cadence: "Weekly",
    status: "Pending",
  },
  {
    name: "Company Traffic",
    cadence: "Monthly",
    status: "Pending",
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-8">
        <PageHeader
          title="Reports"
          description="Review visitor, staff, and company activity exports."
          actions={
            <Button asChild variant="outline">
              <Link href="/dashboard/visitor">
                <FileText className="size-4" />
                Visitor History
              </Link>
            </Button>
          }
        />

        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]">
          <DashboardPanel
            title="Report Library"
            description="Configured report categories for the visitor desk."
            contentClassName="p-0"
          >
            <div className="divide-y divide-border">
              {reportTypes.map((report) => (
                <div
                  key={report.name}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{report.name}</p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDays className="size-4" />
                      {report.cadence}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={report.status} />
                    <Button type="button" variant="outline" disabled>
                      <Download className="size-4" />
                      Export
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </DashboardPanel>

          <DashboardPanel title="Latest Export">
            <EmptyState
              title="No exports yet"
              description="Generated report files will appear here when export support is connected."
              icon={Download}
            />
          </DashboardPanel>
        </div>
    </div>
  );
}
