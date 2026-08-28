"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { ArrowLeft, Layers, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  DashboardPanel,
  FormField,
  PageHeader,
  SelectField,
  fieldControlClassName,
} from "../../../_components/dashboard/DashboardPrimitives";
import { Button } from "@/components/ui/button";

type StaffMember = { _id: string; name: string };

export default function AddDepartmentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [headId, setHeadId] = useState("");
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/staff")
      .then((res) => res.json())
      .then((data) => { if (data.staff) setStaffList(data.staff); })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          headId: headId || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message = data.error || "Failed to create department.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Department added successfully.");
      router.push("/dashboard/departments");
    } catch {
      const message = "Something went wrong.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Add Department"
        description="Create a department and optionally assign a head who gets notified of visitor arrivals."
        meta={
          <Link href="/dashboard/departments" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Back to departments
          </Link>
        }
      />

      <DashboardPanel
        title="Department Details"
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Department Name *" htmlFor="dept-name">
            <input
              id="dept-name"
              className={fieldControlClassName}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Engineering"
              required
            />
          </FormField>

          <FormField label="Description" htmlFor="dept-desc">
            <input
              id="dept-desc"
              className={fieldControlClassName}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Software development team"
            />
          </FormField>

         {staffList.length > 0 && (
           <FormField label="Department Head" htmlFor="dept-head" helper="This person will be notified when visitors arrive for anyone in this department.">
            <SelectField
              id="dept-head"
              value={headId}
              onChange={(e) => setHeadId(e.target.value)}
            >
              <option value="">No head assigned</option>
              {staffList.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </SelectField>
          </FormField>

         )

         }
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-3 border-t border-border pt-5">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Layers className="size-4" />}
              {saving ? "Creating..." : "Create Department"}
            </Button>
          </div>
        </form>
      </DashboardPanel>
    </div>
  );
}
