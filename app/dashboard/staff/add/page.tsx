"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import {
  DashboardPanel,
  FormField,
  PageHeader,
  SelectField,
  fieldControlClassName,
} from "../../../_components/dashboard/DashboardPrimitives";
import { Button } from "@/components/ui/button";

type Department = {
  _id: string;
  name: string;
};

export default function AddStaffPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [position, setPosition] = useState("");
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => {
        if (data.departments) setDepartments(data.departments);
      })
      .catch(console.error);
  }, []);

  async function saveStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, departmentId, position }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message = data.error || "Failed to save staff.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Staff added successfully!");
      setSuccess("Staff added successfully!");
      setName("");
      setEmail("");
      setPhone("");
      setDepartmentId("");
      setPosition("");
    } catch (err) {
      console.error(err);
      const message = "Failed to save staff.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Add Staff"
        description="Create a host profile so visitors can be routed to the right team member."
      />

      <DashboardPanel
        title="Staff Profile"
        description="Contact details support visitor notifications and host lookup."
        className="max-w-4xl"
      >
        <form onSubmit={saveStaff} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Full Name" htmlFor="staff-name">
              <input
                id="staff-name"
                className={fieldControlClassName}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Email" htmlFor="staff-email">
              <input
                id="staff-email"
                type="email"
                className={fieldControlClassName}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Phone" htmlFor="staff-phone">
              <input
                id="staff-phone"
                type="tel"
                className={fieldControlClassName}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </FormField>

            {departments.length > 0 && (
              <FormField label="Department" htmlFor="staff-department">
                <SelectField
                  id="staff-department"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                >
                  <option value="">No department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </SelectField>
              </FormField>
            )}

            <FormField label="Position" htmlFor="staff-position">
              <input
                id="staff-position"
                className={fieldControlClassName}
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
            </FormField>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {success && (
            <p className="text-sm text-green-600">{success}</p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UserPlus className="size-4" />
              )}
              {saving ? "Saving..." : "Save Staff"}
            </Button>
          </div>
        </form>
      </DashboardPanel>
    </div>
  );
}
