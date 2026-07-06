import DashboardLayout from "../components/layouts/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import VisitorChart from "../components/dashboard/VisitorChart";

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">
                        Dashboard
                    </h2>
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
                            <button className="w-full bg-blue-600 text-white rounded-lg py-3">
                                Register Visitor
                            </button>

                            <button className="w-full bg-green-600 text-white rounded-lg py-3">
                                Add Staff
                            </button>

                            <button className="w-full bg-orange-500 text-white rounded-lg py-3">
                                Visitor History
                            </button>

                            <button className="w-full bg-slate-800 text-white rounded-lg py-3">
                                Reports
                            </button>
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
                            <tr className="border-b">
                                <td className="py-4">John Mensah</td>
                                <td>MTN Ghana</td>
                                <td>Barbara</td>
                                <td>09:30 AM</td>
                                <td className="text-green-600 font-semibold">
                                    Approved
                                </td>
                            </tr>

                            <tr className="border-b">
                                <td className="py-4">Akosua Boateng</td>
                                <td>Vodafone</td>
                                <td>Samuel</td>
                                <td>10:15 AM</td>
                                <td className="text-yellow-600 font-semibold">
                                    Pending
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>
        </DashboardLayout>
    );
}