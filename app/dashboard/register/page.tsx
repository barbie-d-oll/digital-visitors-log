"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";

import {
  DashboardPanel,
  FormField,
  PageHeader,
  SelectField,
  fieldControlClassName,
} from "../../_components/dashboard/DashboardPrimitives";
import { Button } from "@/components/ui/button";

interface StaffMember {
  _id: string;
  name: string;
  departmentId?: { _id: string; name: string } | string;
}

export default function RegisterVisitorPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [purpose, setPurpose] = useState("");
  const [staff, setStaff] = useState("");
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/staff")
      .then((res) => res.json())
      .then((data) => {
        if (data.staff) setStaffList(data.staff);
      })
      .catch(console.error)
      .finally(() => setLoadingStaff(false));
  }, []);

  async function registerVisitor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const selectedStaff = staffList.find((m) => m._id === staff);
      if (!selectedStaff) {
        setError("Please select a staff member.");
        return;
      }

      const res = await fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          company,
          purpose,
          staff: selectedStaff.name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to register visitor.");
        return;
      }

      setSuccess("Visitor registered successfully!");
      setName("");
      setPhone("");
      setCompany("");
      setPurpose("");
      setStaff("");
    } catch (err) {
      console.error(err);
      setError("Failed to register visitor.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Register Visitor"
        description="Capture visitor and host details for routed approval."
      />

      <DashboardPanel
        title="Visitor Intake"
        description="Staff details are attached to the visitor record when a host is selected."
        className="max-w-4xl"
      >
        <form onSubmit={registerVisitor} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Full Name" htmlFor="visitor-name">
              <input
                id="visitor-name"
                className={fieldControlClassName}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Phone" htmlFor="visitor-phone">
              <input
                id="visitor-phone"
                type="tel"
                className={fieldControlClassName}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Company" htmlFor="visitor-company">
              <input
                id="visitor-company"
                className={fieldControlClassName}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </FormField>

            <FormField label="Purpose" htmlFor="visitor-purpose">
              <input
                id="visitor-purpose"
                className={fieldControlClassName}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                required
              />
            </FormField>

            <FormField
              label="Staff to Visit"
              htmlFor="visitor-staff"
              helper={loadingStaff ? "Loading staff directory..." : undefined}
              className="md:col-span-2"
            >
              <SelectField
                id="visitor-staff"
                value={staff}
                onChange={(e) => setStaff(e.target.value)}
                disabled={loadingStaff}
                required
              >
                <option value="">Select Staff Member</option>
                {staffList.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </SelectField>
            </FormField>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Button type="submit" disabled={saving || loadingStaff}>
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UserPlus className="size-4" />
              )}
              {saving ? "Registering..." : "Register Visitor"}
            </Button>
          </div>
        </form>
      </DashboardPanel>
    </div>
  );
}
