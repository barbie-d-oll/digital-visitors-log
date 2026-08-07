"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { MoreHorizontal, Plus, RefreshCw, Users } from "lucide-react";

import {
  DashboardPanel,
  EmptyState,
  LoadingState,
  PageHeader,
  SearchField,
  StatusBadge,
  Toolbar,
} from "../../components/dashboard/DashboardPrimitives";
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
import { db } from "@/lib/firebase";

type StaffMember = {
  id: string;
  department?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  position?: string;
};

const getStaffName = (member: StaffMember) =>
  [member.firstName, member.lastName].filter(Boolean).join(" ") || "-";

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadStaff = useCallback(async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "staff"));

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as StaffMember[];

      setStaff(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadStaff();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadStaff]);

  const filteredStaff = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const sortedStaff = [...staff].sort((firstMember, secondMember) =>
      getStaffName(firstMember).localeCompare(getStaffName(secondMember)),
    );

    if (!keyword) {
      return sortedStaff;
    }

    return sortedStaff.filter((member) =>
      [
        getStaffName(member),
        member.department,
        member.position,
        member.phone,
        member.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [search, staff]);

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
              onChange={(event) => setSearch(event.target.value)}
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
                  <TableRow key={member.id}>
                    <TableCell className="px-5 font-medium">
                      {getStaffName(member)}
                    </TableCell>
                    <TableCell>{member.department || "-"}</TableCell>
                    <TableCell>{member.phone || "-"}</TableCell>
                    <TableCell>{member.email || "-"}</TableCell>
                    <TableCell>
                      <StatusBadge status="Active" />
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Open actions for ${getStaffName(member)}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuLabel>Staff</DropdownMenuLabel>
                          <DropdownMenuItem>Edit profile</DropdownMenuItem>
                          <DropdownMenuItem variant="destructive">
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
    </div>
  );
}
