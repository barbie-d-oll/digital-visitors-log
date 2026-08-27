"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Users,
} from "lucide-react";

import {
  DashboardPanel,
  EmptyState,
  LoadingState,
  PageHeader,
  SearchField,
  StatusBadge,
  Toolbar,
} from "../../_components/dashboard/DashboardPrimitives";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

type StaffMember = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  status?: string;
  departmentId?: { _id: string; name: string } | string;
};

const getDepartmentName = (member: StaffMember) => {
  if (typeof member.departmentId === "object" && member.departmentId) {
    return member.departmentId.name;
  }
  return "-";
};

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchStaff = useCallback(async (nextSearch: string) => {
    const res = await fetch(
      `/api/staff?search=${encodeURIComponent(nextSearch)}`,
    );

    if (!res.ok) return null;

    const data = await res.json();
    return (data.staff || []) as StaffMember[];
  }, []);

  const loadStaff = useCallback(async () => {
    setLoading(true);
    try {
      const nextStaff = await fetchStaff(search);
      if (nextStaff) setStaff(nextStaff);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [fetchStaff, search]);

  useEffect(() => {
    let isCurrent = true;

    fetchStaff(search)
      .then((nextStaff) => {
        if (isCurrent && nextStaff) setStaff(nextStaff);
      })
      .catch(console.error)
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [fetchStaff, search]);

  const filteredStaff = useMemo(() => {
    return [...staff].sort((a, b) => a.name.localeCompare(b.name));
  }, [staff]);

  const handleDeleteDialogChange = (open: boolean) => {
    if (!open && !deleting) {
      setStaffToDelete(null);
      setDeleteError("");
    }
  };

  const deleteStaff = async () => {
    if (!staffToDelete) return;

    setDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/staff/${staffToDelete._id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setDeleteError(data.error || "Failed to delete staff member.");
        return;
      }

      setStaff((current) =>
        current.filter((member) => member._id !== staffToDelete._id),
      );
      setStaffToDelete(null);
    } catch (error) {
      console.error(error);
      setDeleteError("Failed to delete staff member.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
        <PageHeader
          title="Staff Management"
          description="Manage host profiles used for visitor routing and notifications."
          actions={
            <Button asChild>
              <Link href="/dashboard/staff/add">
                <Plus className="size-4" />
                Add Staff
              </Link>
            </Button>
          }
        />

        <DashboardPanel
          title="Staff Directory"
          description="Search, review, and manage host details."
          contentClassName="p-0"
        >
          <Toolbar>
            <SearchField
              label="Search staff"
              value={search}
              onChange={(event) => {
                setLoading(true);
                setSearch(event.target.value);
              }}
              placeholder="Search name, department, email..."
              className="md:max-w-sm"
            />

            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">
                {filteredStaff.length} of {staff.length} staff
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={loadStaff}
                disabled={loading}
              >
                <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} />
                Refresh
              </Button>
            </div>
          </Toolbar>

          {loading ? (
            <LoadingState label="Loading staff records" />
          ) : filteredStaff.length > 0 ? (
            <Table className="min-w-[900px]">
              <TableHeader className="bg-surface-muted">
                <TableRow>
                  <TableHead className="px-5">Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-5 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredStaff.map((member) => (
                  <TableRow key={member._id}>
                    <TableCell className="px-5 font-medium">
                      {member.name}
                    </TableCell>
                    <TableCell>{getDepartmentName(member)}</TableCell>
                    <TableCell>{member.phone || "-"}</TableCell>
                    <TableCell>{member.email || "-"}</TableCell>
                    <TableCell>
                      <StatusBadge status={member.status || "active"} />
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Open actions for ${member.name}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuLabel>Staff</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/staff/${member._id}/edit`}>
                              <Pencil className="size-4" />
                              Edit profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setStaffToDelete(member)}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-5">
              <EmptyState
                title="No staff found"
                description="No host profile matches the current search."
                icon={Users}
              />
            </div>
          )}
        </DashboardPanel>

        <Dialog
          open={Boolean(staffToDelete)}
          onOpenChange={handleDeleteDialogChange}
        >
          <DialogContent className="max-w-md">
            <DialogHeader className="pr-8">
              <DialogTitle>Delete staff member?</DialogTitle>
              <DialogDescription>
                This will permanently remove{" "}
                <span className="font-medium text-foreground">
                  {staffToDelete?.name || "this staff member"}
                </span>{" "}
                from your staff directory.
              </DialogDescription>
            </DialogHeader>

            {deleteError ? (
              <p className="text-sm text-destructive">{deleteError}</p>
            ) : null}

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDeleteDialogChange(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={deleteStaff}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                {deleting ? "Deleting..." : "Delete Staff"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}
