"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ClipboardCheck,
  Loader2,
  RefreshCw,
  Send,
  SlidersHorizontal,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

import {
  DashboardPanel,
  EmptyState,
  LoadingState,
  PageHeader,
  SearchField,
  SelectField,
  StatusBadge,
  Toolbar,
} from "@/app/_components/dashboard/DashboardPrimitives";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Department = {
  id: string;
  name: string;
};

type StaffMember = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  departmentId: string;
};

type DepartmentVisitor = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  purpose?: string;
  visitorCode?: string;
  status?: string;
  checkIn?: string;
  departmentId: string;
  departmentName: string;
  assignmentStatus: "pending" | "assigned" | string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  assignedAt?: string;
  assignedByHeadName?: string;
  assignmentNotificationStatus?: string;
};

type QueueData = {
  departments: Department[];
  staff: StaffMember[];
  visitors: DepartmentVisitor[];
};

const assignmentStatusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Assigned", value: "assigned" },
  { label: "All active", value: "all" },
];

const getDisplayValue = (value?: string) => value?.trim() || "-";

const formatDateTime = (value?: string) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const normalize = (value?: string) => value?.trim().toLowerCase() || "";

export default function DepartmentAssignmentsClient() {
  const [queueData, setQueueData] = useState<QueueData>({
    departments: [],
    staff: [],
    visitors: [],
  });
  const [assignmentStatus, setAssignmentStatus] = useState("pending");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigningVisitorId, setAssigningVisitorId] = useState("");
  const [selectedStaffByVisitor, setSelectedStaffByVisitor] = useState<
    Record<string, string>
  >({});

  const loadQueue = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({ assignmentStatus });
      const res = await fetch(
        `/api/department-head/visitors?${params.toString()}`,
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || "Failed to load department visitors.");
        return;
      }

      setQueueData({
        departments: data.departments || [],
        staff: data.staff || [],
        visitors: data.visitors || [],
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load department visitors.");
    } finally {
      setLoading(false);
    }
  }, [assignmentStatus]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadQueue();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadQueue]);

  const staffByDepartment = useMemo(() => {
    return queueData.staff.reduce<Record<string, StaffMember[]>>(
      (groups, member) => {
        const departmentStaff = groups[member.departmentId] || [];
        groups[member.departmentId] = [...departmentStaff, member];
        return groups;
      },
      {},
    );
  }, [queueData.staff]);

  const filteredVisitors = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return queueData.visitors.filter((visitor) => {
      if (!keyword) {
        return true;
      }

      return [
        visitor.name,
        visitor.company,
        visitor.phone,
        visitor.email,
        visitor.purpose,
        visitor.departmentName,
        visitor.assignedStaffName,
        visitor.visitorCode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [queueData.visitors, search]);

  const pendingCount = queueData.visitors.filter(
    (visitor) => visitor.assignmentStatus === "pending",
  ).length;
  const assignedCount = queueData.visitors.filter(
    (visitor) => visitor.assignmentStatus === "assigned",
  ).length;

  const handleStaffSelection = (visitorId: string, staffId: string) => {
    setSelectedStaffByVisitor((current) => ({
      ...current,
      [visitorId]: staffId,
    }));
  };

  const assignVisitor = async (visitor: DepartmentVisitor) => {
    const staffId = selectedStaffByVisitor[visitor.id] || "";

    if (!staffId) {
      toast.error("Choose a staff member first.");
      return;
    }

    setAssigningVisitorId(visitor.id);

    try {
      const res = await fetch(
        `/api/department-head/visitors/${visitor.id}/assign`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ staffId }),
        },
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || "Failed to assign staff member.");
        await loadQueue();
        return;
      }

      const assignedStaffName =
        data.visitor?.assignedStaffName || "selected staff member";
      const notificationStatus = data.visitor?.assignmentNotificationStatus;

      toast.success(
        notificationStatus === "failed"
          ? `Assigned to ${assignedStaffName}. Visitor notification failed.`
          : `Assigned to ${assignedStaffName}.`,
      );

      setSelectedStaffByVisitor((current) => {
        const next = { ...current };
        delete next[visitor.id];
        return next;
      });
      await loadQueue();
    } catch (error) {
      console.error(error);
      toast.error("Failed to assign staff member.");
    } finally {
      setAssigningVisitorId("");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Department Assignments"
        description="Assign checked-in department visitors to an available staff member."
        meta={
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 font-medium text-muted-foreground">
              <ClipboardCheck className="size-3.5" />
              {queueData.departments.length} department
              {queueData.departments.length === 1 ? "" : "s"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 font-medium text-muted-foreground">
              <UserCheck className="size-3.5" />
              {pendingCount} pending
            </span>
          </div>
        }
      />

      <DashboardPanel
        title="Visitor Queue"
        description="Only visitors for departments you head appear here."
        contentClassName="p-0"
      >
        <Toolbar className="items-stretch">
          <div className="grid flex-1 gap-3 md:grid-cols-[minmax(220px,1fr)_180px]">
            <SearchField
              label="Search queue"
              placeholder="Search visitor, company, department..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <SelectField
              value={assignmentStatus}
              onChange={(event) => setAssignmentStatus(event.target.value)}
              aria-label="Filter assignment status"
            >
              {assignmentStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {assignedCount} assigned
            </p>
            <Button variant="outline" onClick={loadQueue} disabled={loading}>
              <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} />
              Refresh
            </Button>
          </div>
        </Toolbar>

        {loading ? (
          <LoadingState label="Loading department visitors" />
        ) : filteredVisitors.length > 0 ? (
          <div className="overflow-x-auto">
            <Table className="min-w-[1080px]">
              <TableHeader className="bg-surface-muted">
                <TableRow>
                  <TableHead className="px-5">Visitor</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[340px] pr-5">Assignment</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredVisitors.map((visitor) => {
                  const isPending =
                    normalize(visitor.assignmentStatus) === "pending";
                  const departmentStaff =
                    staffByDepartment[visitor.departmentId] || [];
                  const selectedStaffId =
                    selectedStaffByVisitor[visitor.id] || "";
                  const assigning = assigningVisitorId === visitor.id;

                  return (
                    <TableRow key={visitor.id}>
                      <TableCell className="px-5">
                        <div className="min-w-0">
                          <p className="font-medium">
                            {getDisplayValue(visitor.name)}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {getDisplayValue(visitor.company)}
                          </p>
                          <p className="mt-1 font-mono text-xs font-semibold tracking-[0.14em] text-muted-foreground">
                            {getDisplayValue(visitor.visitorCode)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getDisplayValue(visitor.departmentName)}</TableCell>
                      <TableCell>{getDisplayValue(visitor.purpose)}</TableCell>
                      <TableCell>{formatDateTime(visitor.checkIn)}</TableCell>
                      <TableCell>
                        <StatusBadge
                          status={isPending ? "Pending" : "Assigned"}
                        />
                      </TableCell>
                      <TableCell className="pr-5">
                        {isPending ? (
                          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                            <SelectField
                              value={selectedStaffId}
                              onChange={(event) =>
                                handleStaffSelection(
                                  visitor.id,
                                  event.target.value,
                                )
                              }
                              disabled={assigning || departmentStaff.length === 0}
                              aria-label={`Assign staff to ${visitor.name}`}
                            >
                              <option value="">
                                {departmentStaff.length > 0
                                  ? "Choose staff"
                                  : "No active staff"}
                              </option>
                              {departmentStaff.map((member) => (
                                <option key={member.id} value={member.id}>
                                  {member.position
                                    ? `${member.name} - ${member.position}`
                                    : member.name}
                                </option>
                              ))}
                            </SelectField>

                            <Button
                              type="button"
                              onClick={() => assignVisitor(visitor)}
                              disabled={
                                assigning ||
                                !selectedStaffId ||
                                departmentStaff.length === 0
                              }
                            >
                              {assigning ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Send className="size-4" />
                              )}
                              Assign
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="font-medium">
                              {getDisplayValue(visitor.assignedStaffName)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {visitor.assignedByHeadName
                                ? `Assigned by ${visitor.assignedByHeadName}`
                                : formatDateTime(visitor.assignedAt)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Notification:{" "}
                              {getDisplayValue(
                                visitor.assignmentNotificationStatus,
                              ).replace("_", " ")}
                            </p>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              title="No department visitors"
              description="No checked-in department visitors match the current view."
              icon={search ? SlidersHorizontal : ClipboardCheck}
            />
          </div>
        )}
      </DashboardPanel>
    </div>
  );
}
