import DashboardLayout from "../../components/layouts/DashboardLayout";
import Link from "next/link";

export default function CompaniesPage() {
    return (
        <DashboardLayout>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Companies</h1>
                    <p className="text-gray-500">
                        Manage registered companies
                    </p>
                </div>

                <Link
                    href="/components/dashboard/companies/add"
                    className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
                >
                    + Add Company
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow p-6">

                <table className="w-full">

                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-3">Company</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>

                        <tr className="border-b">
                            <td className="py-4">HWS Company</td>
                            <td>admin@hws.com</td>
                            <td>0240000000</td>
                            <td className="text-green-600">Active</td>
                            <td>
                                <button>Edit</button>
                            </td>
                        </tr>

                    </tbody>

                </table>

            </div>

        </DashboardLayout>
    );
}