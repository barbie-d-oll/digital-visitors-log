"use client";

import { useCallback, useEffect, useState } from "react";
import { Layers, MoreHorizontal, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";

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
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/departments");
      if (res.ok) {
        const data = await res.json();
        setDepartments(data.departments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Departments"
        description="Manage departments and assign department heads."
        actions={
          <Button asChild>
            <Link href="/dashboard/companies/add">
              <Plus className="size-4" /> Add Department
            </Link>
          </Button>
        }
      />

      <DashboardPanel
        title="All Departments"
        description="Departments organize staff and help route visitor notifications."
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
                      {dept.headId && typeof dept.headId === "object"
                        ? dept.headId.name
                        : "-"}
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
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
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
                  <Link href="/dashboard/companies/add"><Plus className="size-4" /> Add Department</Link>
                </Button>
              }
            />
          </div>
        )}
      </DashboardPanel>
    </div>
  );
}
