import DashboardLayout from "../../components/layouts/DashboardLayout";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure dashboard preferences</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow">
          <p className="text-muted-foreground">Settings content will be added soon.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
