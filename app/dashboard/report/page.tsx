"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import {
  Download,
  FileText,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  DashboardPanel,
  PageHeader,
  SearchField,
  SelectField,
  StatusBadge,
  Toolbar,
} from "../../components/dashboard/DashboardPrimitives";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/firebase";

const pageSize = 10;

type FirestoreDate = Date | string | { toDate: () => Date } | null | undefined;

interface Visitor {
  id: string;
  name?: string;
  company?: string;
  staffName?: string;
  staff?: string;
  purpose?: string;
  status?: string;
  checkIn?: FirestoreDate;
  checkOut?: FirestoreDate;
  visitorCode?: string;
  phone?: string;
  [key: string]: unknown;
}

const getVisitorDate = (value: FirestoreDate) => {
  if (!value) return null;

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

const formatCsv = (items: Visitor[]) => {
  const headers = [
    "Visitor",
    "Company",
    "Staff",
    "Purpose",
    "Status",
    "Check In",
    "Check Out",
    "Visitor Code",
    "Phone",
  ];

  const rows = items.map((item) => [
    getDisplayValue(item.name),
    getDisplayValue(item.company),
    getDisplayValue(item.staffName || item.staff),
    getDisplayValue(item.purpose),
    getDisplayValue(item.status),
    formatVisitorDate(item.checkIn),
    formatVisitorDate(item.checkOut),
    getDisplayValue(item.visitorCode),
    getDisplayValue(item.phone),
  ]);

  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
};

const downloadFile = (filename: string, content: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const getLast7Days = () => {
  const today = new Date();
  const data = [] as { day: string; date: string }[];

  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    data.push({
      day: date.toLocaleDateString([], { weekday: "short" }),
      date: date.toISOString().slice(0, 10),
    });
  }

  return data;
};

export default function ReportsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [staffFilter, setStaffFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");
  const [page, setPage] = useState(1);

  const loadVisitors = useCallback(async () => {
    setLoading(true);

    try {
      const snapshot = await getDocs(collection(db, "visitors"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Visitor[];
      setVisitors(data);
    } catch (error) {
      console.error("Failed to load visitor reports:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVisitors();
  }, [loadVisitors]);

  const statuses = useMemo(
    () => Array.from(new Set(visitors.map((visitor) => visitor.status).filter(Boolean))) as string[],
    [visitors],
  );

  const companies = useMemo(
    () => Array.from(new Set(visitors.map((visitor) => visitor.company).filter(Boolean))) as string[],
    [visitors],
  );

  const staffNames = useMemo(
    () =>
      Array.from(
        new Set(
          visitors
            .map((visitor) => visitor.staffName || visitor.staff)
            .filter(Boolean),
        ),
      ) as string[],
    [visitors],
  );

  const filteredVisitors = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    return visitors
      .filter((visitor) => {
        const name = getDisplayValue(visitor.name);
        const company = getDisplayValue(visitor.company);
        const staff = getDisplayValue(visitor.staffName || visitor.staff);
        const purpose = getDisplayValue(visitor.purpose);
        const status = getDisplayValue(visitor.status);
        const code = getDisplayValue(visitor.visitorCode);
        const phone = getDisplayValue(visitor.phone);
        const checkInDate = getVisitorDate(visitor.checkIn);
        const checkOutDate = getVisitorDate(visitor.checkOut);

        const matchesSearch =
          !keyword ||
          [name, company, staff, purpose, status, code, phone]
            .join(" ")
            .toLowerCase()
            .includes(keyword);

        const matchesStatus =
          !statusFilter || normalizeStatus(status) === normalizeStatus(statusFilter);

        const matchesCompany =
          !companyFilter || normalizeStatus(company) === normalizeStatus(companyFilter);

        const matchesStaff =
          !staffFilter || normalizeStatus(staff) === normalizeStatus(staffFilter);

        const matchesDateRange = (() => {
          if (!start && !end) return true;
          if (!checkInDate) return false;
          const checkInTime = checkInDate.getTime();

          if (start && checkInTime < start.getTime()) return false;
          if (end && checkInTime > end.getTime() + 86_399_999) return false;

          return true;
        })();

        return (
          matchesSearch && matchesStatus && matchesCompany && matchesStaff && matchesDateRange
        );
      })
      .sort((firstVisitor, secondVisitor) => {
        const firstDate = getVisitorDate(firstVisitor.checkIn)?.getTime() ?? 0;
        const secondDate = getVisitorDate(secondVisitor.checkIn)?.getTime() ?? 0;
        return secondDate - firstDate;
      });
  }, [companyFilter, endDate, search, staffFilter, startDate, statusFilter, visitors]);

  const totalPages = Math.max(1, Math.ceil(filteredVisitors.length / pageSize));
  const visibleVisitors = filteredVisitors.slice((page - 1) * pageSize, page * pageSize);

  const visitorSummary = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayVisitors = visitors.filter((visitor) => {
      const checkIn = getVisitorDate(visitor.checkIn);
      return checkIn?.toISOString().slice(0, 10) === today;
    }).length;

    const checkedOut = visitors.filter(
      (visitor) => normalizeStatus(visitor.status) === "checked out",
    ).length;

    const active = visitors.filter(
      (visitor) => normalizeStatus(visitor.status) === "checked in" || normalizeStatus(visitor.status) === "active",
    ).length;

    return {
      total: visitors.length,
      today: todayVisitors,
      checkedOut,
      active,
    };
  }, [visitors]);

  const dailyChartData = useMemo(() => {
    const days = getLast7Days();
    return days.map(({ day, date }) => {
      const checkIns = visitors.filter(
        (visitor) => getVisitorDate(visitor.checkIn)?.toISOString().slice(0, 10) === date,
      ).length;
      const checkOuts = visitors.filter(
        (visitor) => getVisitorDate(visitor.checkOut)?.toISOString().slice(0, 10) === date,
      ).length;
      return { day, checkIns, checkOuts };
    });
  }, [visitors]);

  const topHostsData = useMemo(() => {
    const counts = visitors.reduce((map, visitor) => {
      const host = getDisplayValue(visitor.staffName || visitor.staff);
      if (!host || host === "-") return map;
      map[host] = (map[host] ?? 0) + 1;
      return map;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([host, count]) => ({ host, count }));
  }, [visitors]);

  const exportRecords = () => {
    if (exportFormat === "json") {
      downloadFile(
        `visitor-report-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify(filteredVisitors, null, 2),
        "application/json",
      );
      return;
    }

    downloadFile(
      `visitor-report-${new Date().toISOString().slice(0, 10)}.csv`,
      formatCsv(filteredVisitors),
      "text/csv;charset=utf-8;",
    );
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        description="Review visitor activity, host details, and export filtered data for audits."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/visitor">
              <FileText className="size-4" />
              Visitor History
            </Link>
          </Button>
        }
      />
      <div>
        <DashboardPanel
          title="Data filters"
          description="Refine the visitor report before export."
        >
          <Toolbar className="flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <SearchField
                label="Search visitors"
                placeholder="Search visitor, company, staff, purpose..."
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
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </SelectField>
            </div>

            {/* <div className="grid gap-3 sm:grid-cols-2">
                
                <SelectField
                  value={staffFilter}
                  onChange={(event) => {
                    setStaffFilter(event.target.value);
                    setPage(1);
                  }}
                  aria-label="Filter by staff"
                >
                  <option value="">All staff</option>
                  {staffNames.map((staff) => (
                    <option key={staff} value={staff}>
                      {staff}
                    </option>
                  ))}
                </SelectField>
              </div> */}

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-foreground">
                  Start date
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => {
                    setStartDate(event.target.value);
                    setPage(1);
                  }}
                  className="min-h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-foreground">
                  End date
                </span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => {
                    setEndDate(event.target.value);
                    setPage(1);
                  }}
                  className="min-h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField
                value={exportFormat}
                onChange={(event) =>
                  setExportFormat(event.target.value as "csv" | "json")
                }
                aria-label="Export format"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </SelectField>
              <Button
                type="button"
                variant="outline"
                onClick={exportRecords}
                disabled={loading || filteredVisitors.length === 0}
              >
                <Download className="size-4" />
                Export {exportFormat.toUpperCase()}
              </Button>
            </div>
          </Toolbar>
        </DashboardPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardPanel
              title="Total visitors"
              description="All visitors in the database."
              className="bg-surface-muted/40"
            >
              <p className="mt-4 text-3xl font-semibold text-foreground">
                {visitorSummary.total}
              </p>
            </DashboardPanel>
            <DashboardPanel
              title="Today"
              description="Visitors checked in today."
              className="bg-surface-muted/40"
            >
              <p className="mt-4 text-3xl font-semibold text-foreground">
                {visitorSummary.today}
              </p>
            </DashboardPanel>
            <DashboardPanel
              title="Active"
              description="Currently checked in visitors."
              className="bg-surface-muted/40"
            >
              <p className="mt-4 text-3xl font-semibold text-foreground">
                {visitorSummary.active}
              </p>
            </DashboardPanel>
            <DashboardPanel
              title="Checked out"
              description="Visitors who have already left."
              className="bg-surface-muted/40"
            >
              <p className="mt-4 text-3xl font-semibold text-foreground">
                {visitorSummary.checkedOut}
              </p>
            </DashboardPanel>
          </div>

          <DashboardPanel
            title="Visitor trends"
            description="Activity over the last 7 days."
            contentClassName="p-0"
          >
            <div className="h-72 w-full px-5 py-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailyChartData}
                  margin={{ top: 10, right: 14, left: -8, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="rgba(148, 163, 184, 0.16)"
                    strokeDasharray="4 4"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    width={28}
                  />
                  <Tooltip
                    cursor={{
                      stroke: "rgba(56, 189, 248, 0.35)",
                      strokeWidth: 2,
                    }}
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "10px",
                      boxShadow: "var(--shadow-medium)",
                      color: "var(--popover-foreground)",
                    }}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" />
                  <Line
                    type="monotone"
                    dataKey="checkIns"
                    name="Check-ins"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    dot={{ r: 2 }}
                    activeDot={{ r: 6 }}
                    animationDuration={1200}
                  />
                  <Line
                    type="monotone"
                    dataKey="checkOuts"
                    name="Check-outs"
                    stroke="var(--success)"
                    strokeWidth={3}
                    dot={{ r: 2 }}
                    activeDot={{ r: 6 }}
                    animationDuration={1200}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </DashboardPanel>
        </div>
        <DashboardPanel
          title="Top hosts"
          description="Most visited staff members this week."
          contentClassName="p-0"
        >
          <div className="h-60 w-full px-5 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topHostsData}
                margin={{ top: 12, right: 6, left: -12, bottom: 10 }}
              >
                <CartesianGrid
                  stroke="rgba(148, 163, 184, 0.16)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="host"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  width={24}
                />
                <Tooltip
                  cursor={{ fill: "rgba(15, 23, 42, 0.08)" }}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    boxShadow: "var(--shadow-medium)",
                    color: "var(--popover-foreground)",
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Visits"
                  fill="var(--primary)"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1300}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardPanel>
      </div>
      {/*  */}
      <div className="space-y-6">
        <DashboardPanel
          title="Visitor report table"
          description="Browse all visitor records with pagination."
        >
          {loading ? (
            <p className="p-6 text-sm text-muted-foreground">
              Loading visitor data...
            </p>
          ) : filteredVisitors.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              No visitors match the current filters.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[980px]">
                <TableHeader className="bg-surface-muted">
                  <TableRow>
                    <TableHead className="px-5">Visitor</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-5 text-right">
                      Visitor Code
                    </TableHead>
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
                      <TableCell>
                        {formatVisitorDate(visitor.checkIn)}
                      </TableCell>
                      <TableCell>
                        {formatVisitorDate(visitor.checkOut)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={visitor.status} />
                      </TableCell>
                      <TableCell className="pr-5 text-right">
                        {getDisplayValue(visitor.visitorCode)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * pageSize + 1}-
                  {Math.min(page * pageSize, filteredVisitors.length)} of{" "}
                  {filteredVisitors.length} visitors.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setPage((currentPage) => Math.max(currentPage - 1, 1))
                    }
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setPage((currentPage) =>
                        Math.min(currentPage + 1, totalPages),
                      )
                    }
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DashboardPanel>
      </div>
    </div>
  );
}
