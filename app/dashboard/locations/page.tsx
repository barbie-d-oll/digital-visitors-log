"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { MapPin, Plus } from "lucide-react";

import {
  DashboardPanel,
  EmptyState,
  FormField,
  LoadingState,
  PageHeader,
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

interface Location {
  _id: string;
  name: string;
  address: string;
  phone?: string;
  status: string;
  settings?: { kioskMode?: boolean };
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/locations");
      if (res.ok) {
        const data = await res.json();
        setLocations(data.locations);
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
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address, phone }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to add location.");
        return;
      }

      setShowAdd(false);
      setName(""); setAddress(""); setPhone("");
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
        title="Locations"
        description="Manage multiple offices or branches. Each location gets its own QR code and kiosk settings."
        actions={
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="size-4" /> Add Location
          </Button>
        }
      />

      {loading ? (
        <LoadingState label="Loading locations" />
      ) : locations.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc) => (
            <DashboardPanel key={loc._id} className="h-full">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground">{loc.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground truncate">{loc.address}</p>
                  {loc.phone && <p className="text-sm text-muted-foreground">{loc.phone}</p>}
                  <div className="mt-3 flex items-center gap-2">
                    <StatusBadge status={loc.status} />
                    {loc.settings?.kioskMode && (
                      <span className="rounded bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">Kiosk</span>
                    )}
                  </div>
                </div>
              </div>
            </DashboardPanel>
          ))}
        </div>
      ) : (
        <DashboardPanel>
          <EmptyState
            title="No locations"
            description="Add your first office location to enable multi-site visitor management."
            icon={MapPin}
            action={<Button onClick={() => setShowAdd(true)}><Plus className="size-4" /> Add Location</Button>}
          />
        </DashboardPanel>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Location</DialogTitle>
            <DialogDescription>
              Each location can have its own kiosk and visitor registration link.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAdd} className="space-y-4 mt-4">
            <FormField label="Location Name *" htmlFor="loc-name">
              <input id="loc-name" className={fieldControlClassName} value={name} onChange={(e) => setName(e.target.value)} placeholder="Head Office" required />
            </FormField>
            <FormField label="Address *" htmlFor="loc-address">
              <input id="loc-address" className={fieldControlClassName} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, Accra" required />
            </FormField>
            <FormField label="Phone" htmlFor="loc-phone">
              <input id="loc-phone" type="tel" className={fieldControlClassName} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+233..." />
            </FormField>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Adding..." : "Add Location"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
