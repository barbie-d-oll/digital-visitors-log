"use client";

import { useCallback, useEffect, useState } from "react";
import { ScrollText } from "lucide-react";

import {
  DashboardPanel,
  EmptyState,
  LoadingState,
  PageHeader,
  SelectField,
  Toolbar,
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

interface AuditEntry {
  _id: string;
  action: string;
  entity: string;
  entityId?: string;
  userName?: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

const entityOptions = ["", "visitor", "staff", "appointment", "organization", "blocklist"];
const formatDate = (d: string) => new Date(d).toLocaleString();

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [entity, setEntity] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "30" });
      if (entity) params.set("entity", entity);
      const res = await fetch(`/api/audit-log?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [entity, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Audit Log"
        description="Track all actions performed across your organization for compliance and security."
      />

      <DashboardPanel contentClassName="p-0">
        <Toolbar>
          <SelectField value={entity} onChange={(e) => { setEntity(e.target.value); setPage(1); }} aria-label="Filter by entity">
            <option value="">All entities</option>
            {entityOptions.filter(Boolean).map((e) => (
              <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
            ))}
          </SelectField>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Page {page} of {totalPages}
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </Toolbar>

        {loading ? (
          <LoadingState label="Loading audit log" />
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-surface-muted">
                <TableRow>
                  <TableHead className="px-5">Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="px-5 font-mono text-xs">{log.action}</TableCell>
                    <TableCell className="capitalize">{log.entity}</TableCell>
                    <TableCell>{log.userName || "-"}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                      {log.details ? JSON.stringify(log.details).slice(0, 60) : "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState title="No audit entries" description="Activity will appear here as actions are performed." icon={ScrollText} />
          </div>
        )}
      </DashboardPanel>
    </div>
  );
}
