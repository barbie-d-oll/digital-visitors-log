import DashboardLayout from "../../components/layouts/DashboardLayout";

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-gray-500">View visitor and staff reports</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-600">Reports content will be added soon.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
