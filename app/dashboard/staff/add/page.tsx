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

export default function AddStaffPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      await addDoc(collection(db, "staff"), {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email,
        phone,
        department,
        position,
        companyId: "your-company-id",
        status: "active",
        notificationPreferences: {
          email: true,
          sms: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      alert("Staff Added Successfully!");

      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setDepartment("");
      setPosition("");
    } catch (error) {
      console.error(error);
      alert("Failed to save staff");
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
              <FormField label="First Name" htmlFor="first-name">
                <input
                  id="first-name"
                  className={fieldControlClassName}
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                />
              </FormField>

              <FormField label="Last Name" htmlFor="last-name">
                <input
                  id="last-name"
                  className={fieldControlClassName}
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                />
              </FormField>

              <FormField label="Email" htmlFor="staff-email">
                <input
                  id="staff-email"
                  type="email"
                  className={fieldControlClassName}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </FormField>

              <FormField label="Phone" htmlFor="staff-phone">
                <input
                  id="staff-phone"
                  type="tel"
                  className={fieldControlClassName}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  required
                />
              </FormField>

              <FormField label="Department" htmlFor="staff-department">
                <input
                  id="staff-department"
                  className={fieldControlClassName}
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  required
                />
              </FormField>

              <FormField label="Position" htmlFor="staff-position">
                <input
                  id="staff-position"
                  className={fieldControlClassName}
                  value={position}
                  onChange={(event) => setPosition(event.target.value)}
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
                {saving ? "Saving..." : "Save Staff"}
              </Button>
            </div>
          </form>
        </DashboardPanel>
    </div>
  );
}
