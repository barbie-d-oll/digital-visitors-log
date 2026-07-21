import DashboardLayout from "../../components/layouts/DashboardLayout";
import Link from "next/link";

export default function CompaniesPage() {
    return (
        <DashboardLayout>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Companies</h1>
                    <p className="text-muted-foreground">
                        Manage registered companies
                    </p>
                </div>

                <Link
                    href="/dashboard/companies/add"
                    className="rounded-lg bg-primary px-5 py-3 text-primary-foreground hover:bg-primary/90"
                >
                    + Add Company
                </Link>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow">

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
                            <td className="text-brand">Active</td>
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
