"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Download, RefreshCw } from "lucide-react";

import {
  DashboardPanel,
  LoadingState,
  PageHeader,
} from "../../_components/dashboard/DashboardPrimitives";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CheckedInVisitor {
  _id: string;
  name: string;
  phone: string;
  company?: string;
  staff: string;
  checkIn: string;
  visitorCode: string;
}

export default function EmergencyPage() {
  const [visitors, setVisitors] = useState<CheckedInVisitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatedAt, setGeneratedAt] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/visitors/emergency");
      if (res.ok) {
        const data = await res.json();
        setVisitors(data.visitors);
        setGeneratedAt(data.generatedAt);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const downloadCSV = () => {
    const headers = ["Name", "Phone", "Company", "Host", "Check-In Time", "Code"];
    const rows = visitors.map((v) => [
      v.name,
      v.phone,
      v.company || "",
      v.staff,
      new Date(v.checkIn).toLocaleString(),
      v.visitorCode,
    ]);

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `emergency-list-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Emergency Evacuation List"
        description="All visitors currently on-premises. Use during fire drills or real emergencies."
        actions={
          <div className="flex gap-3">
            <Button variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} />
              Refresh
            </Button>
            <Button onClick={downloadCSV} disabled={visitors.length === 0}>
              <Download className="size-4" /> Download CSV
            </Button>
          </div>
        }
      />

      <div className="rounded-xl border-2 border-destructive/30 bg-destructive/5 p-4 flex items-center gap-3">
        <AlertTriangle className="size-5 text-destructive shrink-0" />
        <div>
          <p className="font-semibold text-destructive">
            {visitors.length} visitor{visitors.length !== 1 ? "s" : ""} currently on-premises
          </p>
          {generatedAt && (
            <p className="text-xs text-muted-foreground">
              List generated at {new Date(generatedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      <DashboardPanel contentClassName="p-0">
        {loading ? (
          <LoadingState label="Loading emergency list" />
        ) : visitors.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-surface-muted">
                <TableRow>
                  <TableHead className="px-5">Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Visiting</TableHead>
                  <TableHead>Arrived</TableHead>
                  <TableHead>Code</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitors.map((v) => (
                  <TableRow key={v._id}>
                    <TableCell className="px-5 font-semibold">{v.name}</TableCell>
                    <TableCell>{v.phone}</TableCell>
                    <TableCell>{v.company || "-"}</TableCell>
                    <TableCell>{v.staff}</TableCell>
                    <TableCell>{new Date(v.checkIn).toLocaleTimeString()}</TableCell>
                    <TableCell className="font-mono font-bold">{v.visitorCode}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-10 text-center text-muted-foreground">
            <p className="text-lg font-semibold">No visitors on-premises</p>
            <p className="mt-1 text-sm">All clear — no one is currently checked in.</p>
          </div>
        )}
      </DashboardPanel>
    </div>
  );
}
