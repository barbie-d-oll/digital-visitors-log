"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { Loader2, UserPlus } from "lucide-react";

import {
  DashboardPanel,
  FormField,
  PageHeader,
  fieldControlClassName,
} from "../../../components/dashboard/DashboardPrimitives";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";

export default function RegisterVisitorPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [staff, setStaff] = useState("");
  const [saving, setSaving] = useState(false);

  async function registerVisitor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      await addDoc(collection(db, "visitors"), {
        name,
        phone,
        purpose,
        staff,
        status: "Pending",
        checkIn: new Date(),
      });

      alert("Visitor Registered Successfully");

      setName("");
      setPhone("");
      setPurpose("");
      setStaff("");
    } catch (error) {
      console.error(error);
      alert("Failed to register visitor");
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
          description="The visitor starts in Pending status after registration."
          className="max-w-4xl"
        >
          <form onSubmit={registerVisitor} className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Full Name" htmlFor="visitor-name">
                <input
                  id="visitor-name"
                  className={fieldControlClassName}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </FormField>

              <FormField label="Phone" htmlFor="visitor-phone">
                <input
                  id="visitor-phone"
                  type="tel"
                  className={fieldControlClassName}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  required
                />
              </FormField>

              <FormField label="Purpose" htmlFor="visitor-purpose">
                <input
                  id="visitor-purpose"
                  className={fieldControlClassName}
                  value={purpose}
                  onChange={(event) => setPurpose(event.target.value)}
                  required
                />
              </FormField>

              <FormField label="Staff to Visit" htmlFor="visitor-staff">
                <input
                  id="visitor-staff"
                  className={fieldControlClassName}
                  value={staff}
                  onChange={(event) => setStaff(event.target.value)}
                  required
                />
              </FormField>
            </div>

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
