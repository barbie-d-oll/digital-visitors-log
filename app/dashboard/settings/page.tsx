import DashboardLayout from "../../components/layouts/DashboardLayout";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-500">Configure dashboard preferences</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-600">Settings content will be added soon.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
