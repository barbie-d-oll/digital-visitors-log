"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import StatCard from "../_components/dashboard/StatCard";
import VisitorChart from "../_components/dashboard/VisitorChart";
import { useAuth } from "@/context/AuthContext";

type VisitorFilters = {
  date: string;
  day: string;
  search: string;
};

interface Visitor {
  _id: string;
  name?: string;
  company?: string;
  staff?: string;
  phone?: string;
  visitorCode?: string;
  purpose?: string;
  checkIn?: string;
  checkOut?: string;
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

const getDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatVisitorTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleTimeString();
};

const getVisitorDisplayValue = (...values: Array<string | null | undefined>) => {
  const value = values.find((item) => item?.trim());
  return value ?? "-";
};

const matchesVisitorFilters = (visitor: Visitor, filters: VisitorFilters) => {
  const checkInDate = visitor.checkIn ? new Date(visitor.checkIn) : null;
  const searchTerm = filters.search.trim().toLowerCase();

  const searchText = [
    visitor.name,
    visitor.company,
    visitor.staff,
    visitor.phone,
    visitor.visitorCode,
    visitor.purpose,
    visitor.status,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const matchesSearch = !searchTerm || searchText.includes(searchTerm);
  const matchesDate =
    !filters.date ||
    (checkInDate ? getDateInputValue(checkInDate) === filters.date : false);
  const matchesDay =
    !filters.day ||
    (checkInDate ? String(checkInDate.getDay()) === filters.day : false);

  return matchesSearch && matchesDate && matchesDay;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [filters, setFilters] = useState<VisitorFilters>(emptyFilters);
  const [loading, setLoading] = useState(true);

  const filteredVisitors = useMemo(
    () =>
      visitors
        .filter((visitor) => matchesVisitorFilters(visitor, filters))
        .sort((a, b) => {
          const aTime = a.checkIn ? new Date(a.checkIn).getTime() : 0;
          const bTime = b.checkIn ? new Date(b.checkIn).getTime() : 0;
          return bTime - aTime;
        }),
    [filters, visitors]
  );

  const hasActiveFilters = Object.values(filters).some(Boolean);

  useEffect(() => {
    const loadVisitors = async () => {
      try {
        const res = await fetch("/api/visitors");
        if (res.ok) {
          const data = await res.json();
          setVisitors(data.visitors);
        }
      } catch (error) {
        console.error("Error loading visitors:", error);
      } finally {
        setLoading(false);
      }
    };

    loadVisitors();
  }, []);

  const updateFilter = <K extends keyof VisitorFilters>(
    field: K,
    value: VisitorFilters[K]
  ) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const clearFilters = () => setFilters(emptyFilters);

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <p className="text-sm md:text-base text-muted-foreground">Welcome back,</p>
        <h1 className="mt-2 text-3xl md:text-5xl font-bold">
          {user?.name?.split(" ")[0] ?? "Admin"} 👋
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground">
          Monitor visitor check-ins, approvals, visitor history and company
          activity from one dashboard.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card p-6 shadow-enterprise-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-brand">
              {user?.organizationName || "Digital Visitor Log"}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-normal text-foreground md:text-3xl">
              Dashboard Overview
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              Monitor visitor check-ins, approvals, visitor history, and company
              activity from one dashboard.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/report"
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              View Reports
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Total Visitors" value={visitors.length} />
        <StatCard
          title="Checked In"
          value={visitors.filter((v) => v.status === "Checked In").length}
        />
        <StatCard
          title="Signed Out"
          value={
            visitors.filter(
              (v) => v.status === "Signed Out" || v.status === "Checked Out"
            ).length
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow xl:col-span-2">
          <h3 className="mb-4 text-lg font-semibold">Visitor Check-ins</h3>
          <VisitorChart visitors={visitors} />
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card p-6 shadow">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Filter Visitors</h3>
            <p className="text-sm text-muted-foreground">
              Showing {filteredVisitors.length} of {visitors.length} visitor records.
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
            <span className="mb-2 block text-sm font-semibold text-foreground">Search visitor</span>
            <input
              type="search"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="Name, company, phone, code..."
              className="min-h-11 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-4 focus:ring-ring/20"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-foreground">Filter by date</span>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => updateFilter("date", e.target.value)}
              className="min-h-11 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/20"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-foreground">Filter by day</span>
            <select
              value={filters.day}
              onChange={(e) => updateFilter("day", e.target.value)}
              className="min-h-11 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/20"
            >
              <option value="">All days</option>
              {weekDays.map((day) => (
                <option key={day.value} value={day.value}>{day.label}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold">Recent Visitors</h3>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <span className="size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground mr-2" />
            Loading visitors...
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-3">Name</th>
                  <th>Company</th>
                  <th>Staff</th>
                  <th>Phone</th>
                  <th>Code</th>
                  <th>Time In</th>
                  <th>Time Out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisitors.length > 0 ? (
                  filteredVisitors.map((visitor) => (
                    <tr key={visitor._id} className="border-b">
                      <td className="py-4">{getVisitorDisplayValue(visitor.name)}</td>
                      <td>{getVisitorDisplayValue(visitor.company)}</td>
                      <td>{getVisitorDisplayValue(visitor.staff)}</td>
                      <td>{getVisitorDisplayValue(visitor.phone)}</td>
                      <td className="font-mono font-semibold tracking-[0.14em]">
                        {getVisitorDisplayValue(visitor.visitorCode)}
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
                    <td colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                      No visitors match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
