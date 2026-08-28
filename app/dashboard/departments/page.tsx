"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Layers,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import {
  DashboardPanel,
  EmptyState,
  LoadingState,
  PageHeader,
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

interface Department {
  _id: string;
  name: string;
  description?: string;
  status: string;
  headId?: { _id: string; name: string; email: string } | null;
  headIds?: Array<{ _id: string; name: string; email: string } | string> | null;
}

function getDepartmentHeadNames(department: Department) {
  const names = Array.isArray(department.headIds)
    ? department.headIds
        .filter((head): head is { _id: string; name: string; email: string } =>
          Boolean(head) && typeof head === "object" && "name" in head,
        )
        .map((head) => head.name)
    : [];

  if (names.length > 0) {
    return names.join(", ");
  }

  return department.headId && typeof department.headId === "object"
    ? department.headId.name
    : "-";
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentToDelete, setDepartmentToDelete] =
    useState<Department | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchDepartments = useCallback(async () => {
    const res = await fetch("/api/departments");
    if (!res.ok) return null;

    const data = await res.json();
    return (data.departments || []) as Department[];
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const nextDepartments = await fetchDepartments();
      if (nextDepartments) setDepartments(nextDepartments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fetchDepartments]);

  useEffect(() => {
    let isCurrent = true;

    fetchDepartments()
      .then((nextDepartments) => {
        if (isCurrent && nextDepartments) setDepartments(nextDepartments);
      })
      .catch(console.error)
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [fetchDepartments]);

  const handleDeleteDialogChange = (open: boolean) => {
    if (!open && !deleting) {
      setDepartmentToDelete(null);
      setDeleteError("");
    }
  };

  const deleteDepartment = async () => {
    if (!departmentToDelete) return;

    setDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/departments/${departmentToDelete._id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = data.error || "Failed to delete department.";
        setDeleteError(message);
        toast.error(message);
        return;
      }

      setDepartments((current) =>
        current.filter((dept) => dept._id !== departmentToDelete._id),
      );
      setDepartmentToDelete(null);
      toast.success("Department deleted successfully.");
    } catch (err) {
      console.error(err);
      const message = "Failed to delete department.";
      setDeleteError(message);
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Departments"
        description="Manage departments and assign department heads for visitor routing."
        actions={
          <Button asChild>
            <Link href="/dashboard/departments/add">
              <Plus className="size-4" /> Add Department
            </Link>
          </Button>
        }
      />

      <DashboardPanel
        title="All Departments"
        description="Departments organize staff and help route visitor notifications to the right head."
        contentClassName="p-0"
      >
        <Toolbar>
          <p className="text-sm text-muted-foreground">
            {departments.length} department{departments.length !== 1 ? "s" : ""}
          </p>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} /> Refresh
          </Button>
        </Toolbar>

        {loading ? (
          <LoadingState label="Loading departments" />
        ) : departments.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-surface-muted">
                <TableRow>
                  <TableHead className="px-5">Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Head</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-5 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow key={dept._id}>
                    <TableCell className="px-5 font-medium">{dept.name}</TableCell>
                    <TableCell className="text-muted-foreground">{dept.description || "-"}</TableCell>
                    <TableCell>
                      {getDepartmentHeadNames(dept)}
                    </TableCell>
                    <TableCell><StatusBadge status={dept.status} /></TableCell>
                    <TableCell className="pr-5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button type="button" variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuLabel>Department</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/departments/${dept._id}/edit`}>
                              <Pencil className="size-4" />
                              Edit profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDepartmentToDelete(dept)}
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
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              title="No departments"
              description="Create departments to organize your staff and route visitor notifications."
              icon={Layers}
              action={
                <Button asChild>
                  <Link href="/dashboard/departments/add"><Plus className="size-4" /> Add Department</Link>
                </Button>
              }
            />
          </div>
        )}
      </DashboardPanel>

      <Dialog
        open={Boolean(departmentToDelete)}
        onOpenChange={handleDeleteDialogChange}
      >
        <DialogContent className="max-w-md">
          <DialogHeader className="pr-8">
            <DialogTitle>Delete department?</DialogTitle>
            <DialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">
                {departmentToDelete?.name || "this department"}
              </span>{" "}
              from your department directory.
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
              onClick={deleteDepartment}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              {deleting ? "Deleting..." : "Delete Department"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
