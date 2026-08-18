"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";

import {
  DashboardPanel,
  FormField,
  PageHeader,
  fieldControlClassName,
} from "../../../_components/dashboard/DashboardPrimitives";
import { Button } from "@/components/ui/button";

export default function RegisterVisitorPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [staff, setStaff] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function registerVisitor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, purpose, staff }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to register visitor.");
        return;
      }

      setSuccess("Visitor registered successfully!");
      setName("");
      setPhone("");
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
        description="Capture the visitor details required for front desk review and host notification."
      />

      <DashboardPanel
        title="Visitor Details"
        description="The visitor starts in Checked In status after registration."
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

            <FormField label="Purpose" htmlFor="visitor-purpose">
              <input
                id="visitor-purpose"
                className={fieldControlClassName}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Staff to Visit" htmlFor="visitor-staff">
              <input
                id="visitor-staff"
                className={fieldControlClassName}
                value={staff}
                onChange={(e) => setStaff(e.target.value)}
                required
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
