"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Building2, Loader2 } from "lucide-react";

import {
  DashboardPanel,
  FormField,
  PageHeader,
  fieldControlClassName,
} from "../../../_components/dashboard/DashboardPrimitives";
import { Button } from "@/components/ui/button";

export default function AddDepartmentPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function saveDepartment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create department.");
        return;
      }

      setSuccess("Department created successfully!");
      setName("");
      setDescription("");
    } catch (err) {
      console.error(err);
      setError("Failed to create department.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Add Department"
        description="Create a department for organizing staff members."
      />

      <DashboardPanel
        title="Department Details"
        description="Departments help organize staff and route visitors efficiently."
        className="max-w-4xl"
      >
        <form onSubmit={saveDepartment} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Department Name" htmlFor="dept-name">
              <input
                id="dept-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldControlClassName}
                placeholder="Engineering"
                required
              />
            </FormField>

            <FormField label="Description" htmlFor="dept-description">
              <input
                id="dept-description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={fieldControlClassName}
                placeholder="Software development team"
              />
            </FormField>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Building2 className="size-4" />
              )}
              {saving ? "Saving..." : "Create Department"}
            </Button>
          </div>
        </form>
      </DashboardPanel>
    </div>
  );
}
