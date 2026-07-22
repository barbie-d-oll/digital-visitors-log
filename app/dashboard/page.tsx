"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";

import DashboardLayout from "../components/layouts/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import VisitorChart from "../components/dashboard/VisitorChart";
import { db } from "@/lib/firebase";

type FirestoreDate = Date | string | { toDate: () => Date } | null | undefined;

type VisitorFilters = {
  date: string;
  day: string;
  search: string;
};

interface Visitor {
  id: string;
  name?: string;
  company?: string;
  staff?: string;
  phone?: string;
  visitorCode?: string;
  number?: string;
  code?: string;
  purpose?: string;
  checkIn?: FirestoreDate;
  checkOut?: FirestoreDate;
  status?: string;
  [key: string]: unknown;
}

const emptyFilters: VisitorFilters = {
  date: "",
  day: "",
  search: "",
};

const weekDays = [
  { label: "Sunday", value: "0" },
  { label: "Monday", value: "1" },
  { label: "Tuesday", value: "2" },
  { label: "Wednesday", value: "3" },
  { label: "Thursday", value: "4" },
  { label: "Friday", value: "5" },
  { label: "Saturday", value: "6" },
];

const visitorSearchFields = [
  "name",
  "company",
  "staff",
  "phone",
  "number",
  "visitorCode",
  "code",
  "purpose",
  "status",
] as const;

const getStringValue = (value: unknown) => {
  if (typeof value === "string") {
    return value;
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
};

const getVisitorDisplayValue = (...values: Array<string | null | undefined>) => {
  const value = values.find((item) => item?.trim());

  return value ?? "-";
};

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

const getDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatVisitorTime = (value: FirestoreDate) => {
  const date = getVisitorDate(value);

  return date ? date.toLocaleTimeString() : "-";
};

const getVisitorSearchText = (visitor: Visitor) =>
  visitorSearchFields
    .map((field) => getStringValue(visitor[field]))
    .join(" ")
    .toLowerCase();

const matchesVisitorFilters = (visitor: Visitor, filters: VisitorFilters) => {
  const checkInDate = getVisitorDate(visitor.checkIn);
  const searchTerm = filters.search.trim().toLowerCase();

  const matchesSearch =
    !searchTerm || getVisitorSearchText(visitor).includes(searchTerm);
  const matchesDate =
    !filters.date ||
    (checkInDate ? getDateInputValue(checkInDate) === filters.date : false);
  const matchesDay =
    !filters.day ||
    (checkInDate ? String(checkInDate.getDay()) === filters.day : false);

  return matchesSearch && matchesDate && matchesDay;
};

const sortVisitorsByCheckIn = (visitors: Visitor[]) =>
  [...visitors].sort((firstVisitor, secondVisitor) => {
    const firstDate = getVisitorDate(firstVisitor.checkIn)?.getTime() ?? 0;
    const secondDate = getVisitorDate(secondVisitor.checkIn)?.getTime() ?? 0;

    return secondDate - firstDate;
  });

export default function DashboardPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [filters, setFilters] = useState<VisitorFilters>(emptyFilters);

  const filteredVisitors = useMemo(
    () =>
      sortVisitorsByCheckIn(
        visitors.filter((visitor) => matchesVisitorFilters(visitor, filters)),
      ),
    [filters, visitors],
  );

  const hasActiveFilters = Object.values(filters).some(Boolean);

  useEffect(() => {
    const abortController = new AbortController();

    const loadVisitors = async () => {
      try {
        const snapshot = await getDocs(collection(db, "visitors"));

        if (!abortController.signal.aborted) {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Visitor[];

          setVisitors(data);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Error loading visitors:", error);
        }
      }
    };

    loadVisitors();

    return () => abortController.abort();
  }, []);

  const updateFilter = <K extends keyof VisitorFilters>(
    field: K,
    value: VisitorFilters[K],
  ) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <p className="text-muted-foreground">Welcome to the dashboard.</p>
        </div>

        <StatCard
          title={hasActiveFilters ? "Matching Visitors" : "Total Visitors"}
          value={hasActiveFilters ? filteredVisitors.length : visitors.length}
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 shadow xl:col-span-2">
            <h3 className="mb-4 text-lg font-semibold">Visitor Check-ins</h3>

            <div className="h-[520px]">
              <VisitorChart />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>

            <div className="space-y-3">
              <Link
                href="/dashboard/visitor/register"
                className="block w-full rounded-lg bg-primary py-3 text-center text-primary-foreground"
              >
                Register Visitor
              </Link>

              <Link
                href="/dashboard/staff/add"
                className="block w-full rounded-lg bg-secondary py-3 text-center text-secondary-foreground"
              >
                Add Staff
              </Link>

              <Link
                href="/dashboard/visitor"
                className="block w-full rounded-lg bg-accent py-3 text-center text-accent-foreground"
              >
                Visitor History
              </Link>

              <Link
                href="/dashboard/companies"
                className="block w-full rounded-lg bg-brand py-3 text-center text-brand-foreground"
              >
                Companies
              </Link>
            </div>
          </div>
        </div>

        <section className="rounded-xl flex border border-border bg-card p-6 shadow">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">Filter Visitors</h3>
              <p className="text-sm text-muted-foreground">
                Showing {filteredVisitors.length} of {visitors.length} visitor
                records.
              </p>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="w-fit rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear filters
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-foreground">
                Search visitor
              </span>
              <input
                type="search"
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                placeholder="Name, company, phone, code..."
                className="min-h-11 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-4 focus:ring-ring/20"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-foreground">
                Filter by date
              </span>
              <input
                type="date"
                value={filters.date}
                onChange={(event) => updateFilter("date", event.target.value)}
                className="min-h-11 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/20"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-foreground">
                Filter by day
              </span>
              <select
                value={filters.day}
                onChange={(event) => updateFilter("day", event.target.value)}
                className="min-h-11 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/20"
              >
                <option value="">All days</option>
                {weekDays.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">Recent Visitors</h3>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-3">Name</th>
                  <th>Company</th>
                  <th>Staff</th>
                  <th>Visitor Number</th>
                  <th>Generated Code</th>
                  <th>Time In</th>
                  <th>Time Out</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredVisitors.length > 0 ? (
                  filteredVisitors.map((visitor) => (
                    <tr key={visitor.id} className="border-b">
                      <td className="py-4">
                        {getVisitorDisplayValue(visitor.name)}
                      </td>
                      <td>{getVisitorDisplayValue(visitor.company)}</td>
                      <td>{getVisitorDisplayValue(visitor.staff)}</td>
                      <td>
                        {getVisitorDisplayValue(visitor.phone, visitor.number)}
                      </td>
                      <td className="font-mono font-semibold tracking-[0.14em] text-foreground">
                        {getVisitorDisplayValue(
                          visitor.visitorCode,
                          visitor.code,
                        )}
                      </td>
                      <td>{formatVisitorTime(visitor.checkIn)}</td>
                      <td>{formatVisitorTime(visitor.checkOut)}</td>
                      <td className="font-semibold text-brand">
                        {getVisitorDisplayValue(visitor.status)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      No visitors match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
