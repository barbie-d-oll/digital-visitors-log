"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import DashboardLayout from "../components/layouts/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import VisitorChart from "../components/dashboard/VisitorChart";

export default function DashboardPage() {
  const [visitors, setVisitors] = useState<any[]>([]);

  useEffect(() => {
    void loadVisitors();
  }, []);

  async function loadVisitors() {
    const snapshot = await getDocs(collection(db, "visitors"));

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setVisitors(data);
  }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <p className="text-gray-500">
                        Welcome back, Barbara 👋
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <StatCard title="Visitors Today" value={18} />
                    <StatCard title="Pending Approval" value={4} />
                    <StatCard title="Staff Present" value={67} />
                    <StatCard title="Checked Out" value={11} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    <div className="xl:col-span-2 bg-white rounded-xl shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            Visitor Check-ins
                        </h3>

                        <div className="h-80 flex items-center justify-center text-gray-400">
                            <VisitorChart />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            Quick Actions
                        </h3>

                        <div className="space-y-3">
                            <Link href="/dashboard/visitor/register" className="block w-full bg-blue-600 text-white rounded-lg py-3 text-center">
                                Register Visitor
                            </Link>

                            <Link href="/dashboard/staff/add" className="block w-full bg-green-600 text-white rounded-lg py-3 text-center">
                                Add Staff
                            </Link>

                            <Link href="/dashboard/visitor" className="block w-full bg-orange-500 text-white rounded-lg py-3 text-center">
                                Visitor History
                            </Link>

                            <Link href="/dashboard/companies" className="block w-full bg-slate-800 text-white rounded-lg py-3 text-center">
                                Companies
                            </Link>
                        </div>
                    </div>

                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">
                        Recent Visitors
                    </h3>

                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b">
                                <th className="py-3">Name</th>
                                <th>Company</th>
                                <th>Staff</th>
                                <th>Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>

    <tbody>
      {visitors.map((visitor: any) => (

     <tr key={visitor.id} className="border-b">
      
      <td className="py-4">
        {visitor.name}
      </td>

      <td>
        {visitor.staff}
      </td>

      <td>
        {visitor.checkIn?.toDate
          ? visitor.checkIn.toDate().toLocaleTimeString()
          : "-"}
      </td>

      <td className="text-green-600 font-semibold">
        {visitor.status}
      </td>
      </tr>
      ))}
    </tbody>
                    </table>
                </div>

            </div>
        </DashboardLayout>
    );
}