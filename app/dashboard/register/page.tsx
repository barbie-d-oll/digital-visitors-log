"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { Loader2, UserPlus } from "lucide-react";

import {
  DashboardPanel,
  FormField,
  PageHeader,
  SelectField,
  fieldControlClassName,
} from "../../components/dashboard/DashboardPrimitives";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";

interface StaffMember {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
}

const getStaffName = (member: StaffMember) =>
  [member.firstName, member.lastName].filter(Boolean).join(" ") || "Unnamed staff";

export default function RegisterVisitorPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [purpose, setPurpose] = useState("");
  const [staff, setStaff] = useState("");
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadStaffList = useCallback(async () => {
    try {
      setLoadingStaff(true);
      const snapshot = await getDocs(collection(db, "staff"));

      const data: StaffMember[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<StaffMember, "id">),
      }));

      setStaffList(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingStaff(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadStaffList();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadStaffList]);

  async function registerVisitor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      const selectedStaff = staffList.find((member) => member.id === staff);

      if (!selectedStaff) {
        alert("Please select a staff member.");
        return;
      }

      await addDoc(collection(db, "visitors"), {
        name,
        phone,
        company,
        purpose,
        staffId: selectedStaff.id,
        staffName: getStaffName(selectedStaff),
        staffEmail: selectedStaff.email,
        staffPhone: selectedStaff.phone,
        department: selectedStaff.department,
        status: "Pending",
        checkIn: new Date(),
      });

      alert("Visitor Registered Successfully");

      setName("");
      setPhone("");
      setCompany("");
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

              <FormField label="Company" htmlFor="visitor-company">
                <input
                  id="visitor-company"
                  className={fieldControlClassName}
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
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

              <FormField
                label="Staff to Visit"
                htmlFor="visitor-staff"
                helper={loadingStaff ? "Loading staff directory..." : undefined}
                className="md:col-span-2"
              >
                <SelectField
                  id="visitor-staff"
                  value={staff}
                  onChange={(event) => setStaff(event.target.value)}
                  disabled={loadingStaff}
                  required
                >
                  <option value="">Select Staff Member</option>
                  {staffList.map((member) => (
                    <option key={member.id} value={member.id}>
                      {getStaffName(member)} - {member.department || "No department"}
                    </option>
                  ))}
                </SelectField>
              </FormField>
            </div>

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
