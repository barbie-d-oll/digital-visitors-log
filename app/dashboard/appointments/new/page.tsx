"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarPlus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  DashboardPanel,
  FormField,
  PageHeader,
  SelectField,
  fieldControlClassName,
} from "../../../_components/dashboard/DashboardPrimitives";
import { Button } from "@/components/ui/button";

type StaffMember = { _id: string; name: string };

export default function NewAppointmentPage() {
  const router = useRouter();

  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [visitorCompany, setVisitorCompany] = useState("");
  const [purpose, setPurpose] = useState("");
  const [hostId, setHostId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [expectedDuration, setExpectedDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preRegCode, setPreRegCode] = useState("");

  useEffect(() => {
    fetch("/api/staff")
      .then((res) => res.json())
      .then((data) => {
        if (data.staff) setStaffList(data.staff);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    setPreRegCode("");

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorName,
          visitorEmail,
          visitorPhone,
          visitorCompany,
          purpose,
          hostId,
          scheduledDate,
          scheduledTime,
          expectedDuration: expectedDuration ? parseInt(expectedDuration) : undefined,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create appointment.");
        return;
      }

      setSuccess("Appointment created!");
      setPreRegCode(data.appointment.preRegCode);

      // Reset form
      setVisitorName("");
      setVisitorEmail("");
      setVisitorPhone("");
      setVisitorCompany("");
      setPurpose("");
      setHostId("");
      setScheduledDate("");
      setScheduledTime("");
      setExpectedDuration("");
      setNotes("");
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="New Appointment"
        description="Pre-register a visitor. They'll receive a code to check in quickly."
        meta={
          <Link
            href="/dashboard/appointments"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to appointments
          </Link>
        }
      />

      {success && preRegCode && (
        <div className="rounded-xl border border-border bg-card p-6 text-center shadow-enterprise-sm">
          <p className="text-sm font-medium text-brand">Appointment created!</p>
          <p className="mt-1 text-muted-foreground text-sm">
            Share this pre-registration code with the visitor:
          </p>
          <p className="mt-3 font-mono text-3xl font-black tracking-[.12em] text-foreground">
            {preRegCode}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            The visitor enters this code on the check-in page for instant registration.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Button variant="outline" onClick={() => { setSuccess(""); setPreRegCode(""); }}>
              Create Another
            </Button>
            <Button onClick={() => router.push("/dashboard/appointments")}>
              View All Appointments
            </Button>
          </div>
        </div>
      )}

      {!success && (
        <DashboardPanel
          title="Visitor & Schedule Details"
          description="Fill in the expected visitor information and schedule."
          className="max-w-4xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Visitor Name *" htmlFor="v-name">
                <input
                  id="v-name"
                  className={fieldControlClassName}
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="Jane Smith"
                  required
                />
              </FormField>

              <FormField label="Visitor Email" htmlFor="v-email">
                <input
                  id="v-email"
                  type="email"
                  className={fieldControlClassName}
                  value={visitorEmail}
                  onChange={(e) => setVisitorEmail(e.target.value)}
                  placeholder="jane@company.com"
                />
              </FormField>

              <FormField label="Visitor Phone" htmlFor="v-phone">
                <input
                  id="v-phone"
                  type="tel"
                  className={fieldControlClassName}
                  value={visitorPhone}
                  onChange={(e) => setVisitorPhone(e.target.value)}
                  placeholder="+233..."
                />
              </FormField>

              <FormField label="Visitor Company" htmlFor="v-company">
                <input
                  id="v-company"
                  className={fieldControlClassName}
                  value={visitorCompany}
                  onChange={(e) => setVisitorCompany(e.target.value)}
                  placeholder="Acme Corp"
                />
              </FormField>

              <FormField label="Purpose *" htmlFor="v-purpose">
                <input
                  id="v-purpose"
                  className={fieldControlClassName}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Client meeting"
                  required
                />
              </FormField>

              <FormField label="Host (Staff) *" htmlFor="v-host">
                <SelectField
                  id="v-host"
                  value={hostId}
                  onChange={(e) => setHostId(e.target.value)}
                  required
                >
                  <option value="" disabled>Select host</option>
                  {staffList.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </SelectField>
              </FormField>

              <FormField label="Date *" htmlFor="v-date">
                <input
                  id="v-date"
                  type="date"
                  className={fieldControlClassName}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                />
              </FormField>

              <FormField label="Time *" htmlFor="v-time">
                <input
                  id="v-time"
                  type="time"
                  className={fieldControlClassName}
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  required
                />
              </FormField>

              <FormField label="Expected Duration (minutes)" htmlFor="v-duration">
                <input
                  id="v-duration"
                  type="number"
                  className={fieldControlClassName}
                  value={expectedDuration}
                  onChange={(e) => setExpectedDuration(e.target.value)}
                  placeholder="60"
                  min="5"
                />
              </FormField>

              <FormField label="Notes" htmlFor="v-notes">
                <input
                  id="v-notes"
                  className={fieldControlClassName}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions..."
                />
              </FormField>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CalendarPlus className="size-4" />
                )}
                {saving ? "Creating..." : "Create Appointment"}
              </Button>
            </div>
          </form>
        </DashboardPanel>
      )}
    </div>
  );
}
