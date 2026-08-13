"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import {
  Eye,
  MoreHorizontal,
  RefreshCw,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";

import {
  DashboardPanel,
  EmptyState,
  LoadingState,
  PageHeader,
  SearchField,
  SelectField,
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

type FirestoreDate = Date | string | { toDate: () => Date } | null | undefined;

interface Visitor {
  id: string;
  name?: string;
  company?: string;
  purpose?: string;
  staffName?: string;
  staff?: string;
  status?: string;
  checkIn?: FirestoreDate;
}

const getVisitorDate = (value: FirestoreDate) => {
  if (!value) {
    return null;
  }

  const date =
    value instanceof Date
      ? value
      : typeof value === "string"
        ? new Date(value)
        : value.toDate();

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatVisitorDate = (value: FirestoreDate) => {
  const date = getVisitorDate(value);

  return date
    ? date.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";
};

const normalizeStatus = (status?: string) => status?.trim().toLowerCase() ?? "";

const getDisplayValue = (value?: string) => value?.trim() || "-";

const getStatusFilterLabel = (status?: string) =>
  normalizeStatus(status) === "pending" ? "Onprem" : getDisplayValue(status);

const pageSize = 8;

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortKey, setSortKey] = useState<"recent" | "name" | "status">(
    "recent",
  );
  const [page, setPage] = useState(1);

  const loadVisitors = useCallback(async () => {
    try {
      setLoading(true);

      const snapshot = await getDocs(collection(db, "visitors"));

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Visitor[];

      setVisitors(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadVisitors();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadVisitors]);

  const statuses = useMemo(
    () =>
      Array.from(
        new Set(visitors.map((visitor) => visitor.status).filter(Boolean)),
      ) as string[],
    [visitors],
  );

  const filteredVisitors = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return visitors
      .filter((visitor) => {
        const matchesSearch =
          !keyword ||
          [
            visitor.name,
            visitor.company,
            visitor.staffName,
            visitor.staff,
            visitor.purpose,
            visitor.status,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(keyword);
        const matchesStatus =
          !statusFilter || normalizeStatus(visitor.status) === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((firstVisitor, secondVisitor) => {
        if (sortKey === "name") {
          return getDisplayValue(firstVisitor.name).localeCompare(
            getDisplayValue(secondVisitor.name),
          );
        }

        if (sortKey === "status") {
          return getDisplayValue(firstVisitor.status).localeCompare(
            getDisplayValue(secondVisitor.status),
          );
        }

        return (
          (getVisitorDate(secondVisitor.checkIn)?.getTime() ?? 0) -
          (getVisitorDate(firstVisitor.checkIn)?.getTime() ?? 0)
        );
      });
  }, [search, sortKey, statusFilter, visitors]);

  const totalPages = Math.max(1, Math.ceil(filteredVisitors.length / pageSize));
  const visibleVisitors = filteredVisitors.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  return (
    <div className="space-y-8">
        <PageHeader
          title="Visitors"
          description="Register, search, sort, and review visitor activity from the front desk."
          actions={
            <Button asChild>
              {/* <Link href="/dashboard/visitor/register">
                <Plus className="size-4" />
                Register Visitor
              </Link> */}
            </Button>
          }
        />

        <DashboardPanel
          title="Visitor History"
          description="Review every visitor record with search, filtering, sorting, and pagination."
          contentClassName="p-0"
        >
          <Toolbar className="items-stretch">
            <div className="grid flex-1 gap-3 md:grid-cols-[minmax(220px,1fr)_180px_180px]">
              <SearchField
                label="Search visitors"
                placeholder="Search visitor, company, staff..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />

              <SelectField
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(1);
                }}
                aria-label="Filter by status"
              >
                <option value="">All statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={normalizeStatus(status)}>
                    {getStatusFilterLabel(status)}
                  </option>
                ))}
              </SelectField>

              <SelectField
                value={sortKey}
                onChange={(event) => {
                  setSortKey(
                    event.target.value as "recent" | "name" | "status",
                  );
                  setPage(1);
                }}
                aria-label="Sort visitors"
              >
                <option value="recent">Most recent</option>
                <option value="name">Name</option>
                <option value="status">Status</option>
              </SelectField>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={loadVisitors}
              disabled={loading}
            >
              <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} />
              Refresh
            </Button>
          </Toolbar>

          {loading ? (
            <LoadingState label="Loading visitors" />
          ) : visibleVisitors.length > 0 ? (
            <>
              <Table className="min-w-240">
                <TableHeader className="bg-surface-muted">
                  <TableRow>
                    <TableHead className="px-5">Visitor</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-5 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {visibleVisitors.map((visitor) => (
                    <TableRow key={visitor.id}>
                      <TableCell className="px-5 font-medium">
                        {getDisplayValue(visitor.name)}
                      </TableCell>
                      <TableCell>{getDisplayValue(visitor.company)}</TableCell>
                      <TableCell>
                        {getDisplayValue(visitor.staffName || visitor.staff)}
                      </TableCell>
                      <TableCell>{getDisplayValue(visitor.purpose)}</TableCell>
                      <TableCell>{formatVisitorDate(visitor.checkIn)}</TableCell>
                      <TableCell>
                        <StatusBadge status={visitor.status} />
                      </TableCell>
                      <TableCell className="pr-5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`Open actions for ${getDisplayValue(
                                visitor.name,
                              )}`}
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel>Visitor</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="size-4" />
                              View
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * pageSize + 1}-
                  {Math.min(page * pageSize, filteredVisitors.length)} of{" "}
                  {filteredVisitors.length} visitors
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPage((currentPage) => currentPage - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPage((currentPage) => currentPage + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-5">
              <EmptyState
                title="No visitors found"
                description="No visitor records match the current search and filter."
                icon={search || statusFilter ? SlidersHorizontal : UserRound}
              />
            </div>
          )}
        </DashboardPanel>
    </div>
  );
}
