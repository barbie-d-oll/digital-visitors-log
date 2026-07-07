"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import Link from "next/link";

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);

  useEffect(() => {
    loadStaff();
  }, []);

  async function loadStaff() {
    try {
      const snapshot = await getDocs(collection(db, "staff"));

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setStaff(data);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-gray-500">
            Add and manage company staff
          </p>
        </div>

        <Link
          href="/dashboard/staff/add"
          className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
        >
          + Add Staff
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
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
            {staff.map((member: any) => (
              <tr key={member.id} className="border-b">

                <td className="py-4">
                  {member.firstName} {member.lastName}
                </td>

                <td>{member.department}</td>

                <td>{member.phone}</td>

                <td>{member.email}</td>

                <td className="text-green-600 font-semibold">
                  Active
                </td>

                <td className="space-x-3">
                  <button className="text-blue-600">
                    Edit
                  </button>

                  <button className="text-red-600">
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