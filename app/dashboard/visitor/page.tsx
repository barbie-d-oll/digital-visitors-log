"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Visitor {
  id: string;
  name: string;
  company: string;
  purpose: string;

  staffName?: string;
  staff?: string;

  status: string;

  checkIn?: {
    toDate: () => Date;
  };
}

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadVisitors();
  }, []);

  async function loadVisitors() {
    try {
      setLoading(true);

      const snapshot = await getDocs(collection(db, "visitors"));

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Visitor[];

      setVisitors(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const filteredVisitors = useMemo(() => {
    return visitors.filter((visitor) => {
      const keyword = search.toLowerCase();

      return (
        visitor.name?.toLowerCase().includes(keyword) ||
        visitor.company?.toLowerCase().includes(keyword) ||
        visitor.staffName?.toLowerCase().includes(keyword) ||
        visitor.staff?.toLowerCase().includes(keyword)
      );
    });
  }, [search, visitors]);

  function statusColor(status: string) {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";

      case "Approved":
        return "bg-green-100 text-green-700";

      case "Rejected":
        return "bg-red-100 text-red-700";

      case "Checked Out":
        return "bg-gray-200 text-gray-700";

      default:
        return "bg-blue-100 text-blue-700";
    }
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Visitor History
          </h1>

          <p className="text-gray-500">
            Manage all visitor records
          </p>
        </div>

        <Link
          href="/dashboard/visitor/register"
          className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
        >
          + Register Visitor
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow p-6">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

          <input
            type="text"
            placeholder="Search visitor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full md:w-80"
          />

          <button
            onClick={loadVisitors}
            className="bg-slate-800 text-white px-5 py-2 rounded-lg hover:bg-slate-900"
          >
            Refresh
          </button>
        </div>

        <p className="text-gray-500 mb-4">
          Total Visitors:{" "}
          <span className="font-semibold">
            {filteredVisitors.length}
          </span>
        </p>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-3">
                  Visitor
                </th>

                <th className="px-3">
                  Company
                </th>

                <th className="px-3">
                  Staff
                </th>

                <th className="px-3">
                  Purpose
                </th>

                <th className="px-3">
                  Check In
                </th>

                <th className="px-3">
                  Status
                </th>

                <th className="px-3">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-8"
                  >
                    Loading visitors...
                  </td>
                </tr>

              ) : filteredVisitors.length === 0 ? (

                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-8 text-gray-500"
                  >
                    No visitors found.
                  </td>
                </tr>

              ) : (

                filteredVisitors.map((visitor) => (

                  <tr
                    key={visitor.id}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="py-4 px-3 font-medium">
                      {visitor.name}
                    </td>

                    <td className="px-3">
                      {visitor.company}
                    </td>

                    <td className="px-3">
                      {visitor.staffName || visitor.staff}
                    </td>

                    <td className="px-3">
                      {visitor.purpose}
                    </td>

                    <td className="px-3">
                      {visitor.checkIn?.toDate
                        ? visitor.checkIn
                            .toDate()
                            .toLocaleString()
                        : "-"}
                    </td>

                    <td className="px-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor(
                          visitor.status
                        )}`}
                      >
                        {visitor.status}
                      </span>
                    </td>

                    <td className="px-3">
                      <button
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </button>
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>
      </div>
    </DashboardLayout>
  );
}