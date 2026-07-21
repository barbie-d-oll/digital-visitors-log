"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import Link from "next/link";

type StaffMember = {
  id: string;
  department?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);

  useEffect(() => {
    async function loadStaff() {
      try {
        const snapshot = await getDocs(collection(db, "staff"));

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as StaffMember[];

        setStaff(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadStaff();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">
            Add and manage company staff
          </p>
        </div>

        <Link
          href="/dashboard/staff/add"
          className="rounded-lg bg-primary px-5 py-3 text-primary-foreground hover:bg-primary/90"
        >
          + Add Staff
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow">
        <table className="w-full">

          <thead>
            <tr className="border-b">
              <th className="text-left py-3">Name</th>
              <th>Department</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {staff.map((member) => (
              <tr key={member.id} className="border-b">

                <td className="py-4">
                  {member.firstName} {member.lastName}
                </td>

                <td>{member.department}</td>

                <td>{member.phone}</td>

                <td>{member.email}</td>

                <td className="font-semibold text-brand">
                  Active
                </td>

                <td className="space-x-3">
                  <button className="text-primary">
                    Edit
                  </button>

                  <button className="text-destructive">
                    Delete
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </DashboardLayout>
  );
}
