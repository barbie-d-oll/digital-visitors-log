"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { Building2, Loader2 } from "lucide-react";

import {
  DashboardPanel,
  FormField,
  PageHeader,
  fieldControlClassName,
} from "../../../components/dashboard/DashboardPrimitives";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";

export default function AddCompanyPage() {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      const companyRef = await addDoc(collection(db, "companies"), {
        companyName,
        email,
        phone,
        address,
        status: "active",
        subscription: "trial",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(companyRef.id);

      alert("Company Added Successfully!");

      setCompanyName("");
      setEmail("");
      setPhone("");
      setAddress("");
    } catch (error) {
      console.error(error);
      alert("Failed to save company");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
        <PageHeader
          title="Add Company"
          description="Create a company workspace for staff hosts and visitor records."
        />

        <DashboardPanel
          title="Company Profile"
          description="Company details are used across visitor registration and reporting."
          className="max-w-4xl"
        >
          <form onSubmit={saveCompany} className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                label="Company Name"
                htmlFor="company-name"
                helper="Use the registered business or branch name."
              >
                <input
                  id="company-name"
                  type="text"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  className={fieldControlClassName}
                  placeholder="HWS Company"
                  required
                />
              </FormField>

              <FormField label="Email" htmlFor="company-email">
                <input
                  id="company-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={fieldControlClassName}
                  placeholder="admin@hws.com"
                  required
                />
              </FormField>

              <FormField label="Phone" htmlFor="company-phone">
                <input
                  id="company-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className={fieldControlClassName}
                  placeholder="+233..."
                  required
                />
              </FormField>

              <FormField label="Address" htmlFor="company-address">
                <input
                  id="company-address"
                  type="text"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className={fieldControlClassName}
                  placeholder="Accra"
                  required
                />
              </FormField>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Building2 className="size-4" />
                )}
                {saving ? "Saving..." : "Save Company"}
              </Button>
            </div>
          </form>
        </DashboardPanel>
    </div>
  );
}
