"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import DashboardLayout from "../components/layouts/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import VisitorChart from "../components/dashboard/VisitorChart";

type FirestoreDate = Date | string | { toDate: () => Date } | null | undefined;

interface Visitor {
  id: string;
  name: string;
  company: string;
  staff: string;
  checkIn?: FirestoreDate;
  checkOut?: FirestoreDate;
  status: string;
  [key: string]: unknown;
}

const formatVisitorTime = (value: FirestoreDate) => {
  if (!value) {
    return "-";
  }

  if (value instanceof Date) {
    return value.toLocaleTimeString();
  }

  if (typeof value === "string") {
    const parsedDate = new Date(value);

    return Number.isNaN(parsedDate.getTime())
      ? value
      : parsedDate.toLocaleTimeString();
  }

  return value.toDate().toLocaleTimeString();
};

export default function DashboardPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);

  useEffect(() => {
    const abortController = new AbortController();

    const loadVisitors = async () => {
      try {
        const snapshot = await getDocs(collection(db, "visitors"));

        if (!abortController.signal.aborted) {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Visitor[];

          setVisitors(data);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Error loading visitors:", error);
        }
      }
    };

    loadVisitors();

    return () => abortController.abort();
  }, []);

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <p className="text-gray-500">
                        Welcome to the dashboard, 👋
                    </p>
                </div>

                <StatCard
    title="Total Visitors"
    value={visitors.length}
/>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    <div className="xl:col-span-2 bg-white rounded-xl shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            Visitor Check-ins
                        </h3>

                        <div className="h-[520px]">
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
                                <th>Time In</th>
                                <th>Time Out</th>
                                <th>Status</th>
                            </tr>
                        </thead>

    <tbody>
      {visitors.map((visitor: Visitor) => (

     <tr key={visitor.id} className="border-b">
      
      <td className="py-4">
        {visitor.name}
      </td>

      <td>
  {visitor.company}
</td>

<td>
  {visitor.staff}
</td>

<td>
  {formatVisitorTime(visitor.checkIn)}
</td>

<td>
  {formatVisitorTime(visitor.checkOut)}
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
