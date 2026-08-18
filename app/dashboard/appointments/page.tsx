"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Check,
  Clock,
  MoreHorizontal,
  Plus,
  RefreshCw,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";

import {
  DashboardPanel,
  EmptyState,
  LoadingState,
  PageHeader,
  SearchField,
  SelectField,
  StatusBadge,
  Toolbar,
} from "../../_components/dashboard/DashboardPrimitives";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Appointment {
  _id: string;
  visitorName: string;
  visitorEmail?: string;
  visitorPhone?: string;
  visitorCompany?: string;
  purpose: string;
  hostName: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  preRegCode?: string;
  notes?: string;
}

const statusOptions = [
  { label: "All", value: "" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Checked In", value: "checked_in" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "No Show", value: "no_show" },
];

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/appointments?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const filtered = useMemo(() => {
    if (!search.trim()) return appointments;
    const term = search.toLowerCase();
    return appointments.filter(
      (a) =>
        a.visitorName.toLowerCase().includes(term) ||
        a.hostName.toLowerCase().includes(term) ||
        a.visitorCompany?.toLowerCase().includes(term) ||
        a.preRegCode?.toLowerCase().includes(term)
    );
  }, [appointments, search]);

  const handleCancel = async (id: string) => {
    try {
      await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      loadAppointments();
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkNoShow = async (id: string) => {
    try {
      await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "no_show" }),
      });
      loadAppointments();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Appointments"
        description="Pre-register visitors and manage upcoming appointments."
        actions={
          <Button asChild>
            <Link href="/dashboard/appointments/new">
              <Plus className="size-4" />
              New Appointment
            </Link>
          </Button>
        }
      />

      <DashboardPanel
        title="All Appointments"
        description="View and manage scheduled visits."
        contentClassName="p-0"
      >
        <Toolbar>
          <SearchField
            label="Search appointments"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Visitor name, host, company, code..."
            className="md:max-w-sm"
          />

          <div className="flex items-center gap-3">
            <SelectField
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </SelectField>

            <Button type="button" variant="outline" onClick={loadAppointments} disabled={loading}>
              <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} />
              Refresh
            </Button>
          </div>
        </Toolbar>

        {loading ? (
          <LoadingState label="Loading appointments" />
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader className="bg-surface-muted">
                <TableRow>
                  <TableHead className="px-5">Visitor</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-5 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((apt) => (
                  <TableRow key={apt._id}>
                    <TableCell className="px-5">
                      <div>
                        <p className="font-medium">{apt.visitorName}</p>
                        {apt.visitorCompany && (
                          <p className="text-xs text-muted-foreground">{apt.visitorCompany}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{apt.hostName}</TableCell>
                    <TableCell>{formatDate(apt.scheduledDate)}</TableCell>
                    <TableCell>{apt.scheduledTime}</TableCell>
                    <TableCell>{apt.purpose}</TableCell>
                    <TableCell>
                      <code className="rounded bg-secondary px-2 py-0.5 text-xs font-bold">
                        {apt.preRegCode}
                      </code>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={apt.status.replace("_", " ")} />
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button type="button" variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {apt.status === "scheduled" && (
                            <>
                              <DropdownMenuItem onClick={() => handleMarkNoShow(apt._id)}>
                                <X className="size-4 mr-2" /> Mark No Show
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => handleCancel(apt._id)}
                              >
                                Cancel
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              title="No appointments"
              description="Pre-register a visitor to see appointments here."
              icon={Calendar}
              action={
                <Button asChild>
                  <Link href="/dashboard/appointments/new">
                    <Plus className="size-4" /> New Appointment
                  </Link>
                </Button>
              }
            />
          </div>
        )}
      </DashboardPanel>
    </div>
  );
}
