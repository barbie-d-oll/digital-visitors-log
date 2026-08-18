"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Plus, ShieldAlert, Trash2 } from "lucide-react";

import {
  DashboardPanel,
  EmptyState,
  FormField,
  LoadingState,
  PageHeader,
  SelectField,
  StatusBadge,
  fieldControlClassName,
} from "../../_components/dashboard/DashboardPrimitives";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BlocklistEntry {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  reason: string;
  type: "blocked" | "watchlist";
  createdAt: string;
}

export default function BlocklistPage() {
  const [entries, setEntries] = useState<BlocklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [type, setType] = useState<"blocked" | "watchlist">("blocked");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/blocklist");
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/blocklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, reason, type }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to add entry.");
        return;
      }

      setShowAdd(false);
      setName(""); setEmail(""); setPhone(""); setReason("");
      load();
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Blocklist & Watchlist"
        description="Manage blocked visitors and watchlist entries. Blocked visitors cannot check in."
        actions={
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="size-4" /> Add Entry
          </Button>
        }
      />

      <DashboardPanel contentClassName="p-0">
        {loading ? (
          <LoadingState label="Loading blocklist" />
        ) : entries.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-surface-muted">
                <TableRow>
                  <TableHead className="px-5">Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry._id}>
                    <TableCell className="px-5 font-medium">{entry.name}</TableCell>
                    <TableCell>{entry.phone || "-"}</TableCell>
                    <TableCell>{entry.email || "-"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{entry.reason}</TableCell>
                    <TableCell>
                      <StatusBadge status={entry.type === "blocked" ? "Rejected" : "Pending"} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              title="No entries"
              description="Your blocklist is empty. Add people who should be denied or flagged during check-in."
              icon={ShieldAlert}
            />
          </div>
        )}
      </DashboardPanel>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Blocklist</DialogTitle>
            <DialogDescription>
              Blocked visitors will be denied check-in. Watchlisted visitors are flagged but allowed.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAdd} className="space-y-4 mt-4">
            <FormField label="Name *" htmlFor="bl-name">
              <input id="bl-name" className={fieldControlClassName} value={name} onChange={(e) => setName(e.target.value)} required />
            </FormField>
            <FormField label="Phone" htmlFor="bl-phone">
              <input id="bl-phone" type="tel" className={fieldControlClassName} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </FormField>
            <FormField label="Email" htmlFor="bl-email">
              <input id="bl-email" type="email" className={fieldControlClassName} value={email} onChange={(e) => setEmail(e.target.value)} />
            </FormField>
            <FormField label="Reason *" htmlFor="bl-reason">
              <input id="bl-reason" className={fieldControlClassName} value={reason} onChange={(e) => setReason(e.target.value)} required placeholder="Why this person is blocked" />
            </FormField>
            <FormField label="Type" htmlFor="bl-type">
              <SelectField id="bl-type" value={type} onChange={(e) => setType(e.target.value as "blocked" | "watchlist")}>
                <option value="blocked">Blocked (denied entry)</option>
                <option value="watchlist">Watchlist (flagged but allowed)</option>
              </SelectField>
            </FormField>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Adding..." : "Add Entry"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
