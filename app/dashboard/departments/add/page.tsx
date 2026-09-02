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
  fieldControlClassName,
} from "../../../_components/dashboard/DashboardPrimitives";
import { Button } from "@/components/ui/button";

type StaffMember = { _id: string; name: string };
const MAX_DEPARTMENT_HEADS = 2;

export default function AddDepartmentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [headIds, setHeadIds] = useState<string[]>([]);
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
          headIds,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message = data.error || "Failed to create department.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(data.message || "Department added successfully.");
      router.push("/dashboard/departments");
    } catch {
      const message = "Something went wrong.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const toggleDepartmentHead = (staffId: string) => {
    setHeadIds((current) => {
      if (current.includes(staffId)) {
        return current.filter((id) => id !== staffId);
      }

      if (current.length >= MAX_DEPARTMENT_HEADS) {
        return current;
      }

      return [...current, staffId];
    });
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
            <FormField
              label="Department Heads"
              helper="Select up to 2 people."
            >
              <div className="grid gap-2">
                {staffList.map((staff) => {
                  const checked = headIds.includes(staff._id);
                  const disabled =
                    !checked && headIds.length >= MAX_DEPARTMENT_HEADS;

                  return (
                    <label
                      key={staff._id}
                      className={`flex min-h-11 items-center gap-3 rounded-lg border border-input bg-background px-3 text-sm transition ${
                        disabled
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer hover:border-ring"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="size-4 rounded border-input accent-primary"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggleDepartmentHead(staff._id)}
                      />
                      <span className="font-medium text-foreground">
                        {staff.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </FormField>
          )}
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
