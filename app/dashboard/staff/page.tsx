import DashboardLayout from "../../components/layouts/DashboardLayout";
import Link from "next/link";

export default function StaffPage() {
    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Staff Management</h1>
                    <p className="text-gray-500">
                        Add and manage company staff
                    </p>
                </div>

                <Link href="/components/dashboard/staff/add" className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700">
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

                        <tr className="border-b">
                            <td className="py-4">Barbara Logah</td>
                            <td>IT</td>
                            <td>0240000000</td>
                            <td>barbara@hws.com</td>
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

                        <tr className="border-b">
                            <td className="py-4">John Mensah</td>
                            <td>Finance</td>
                            <td>0551234567</td>
                            <td>john@hws.com</td>
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

                    </tbody>

                </table>

            </div>
        </DashboardLayout>
    );
}