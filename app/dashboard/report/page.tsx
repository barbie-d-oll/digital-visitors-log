import DashboardLayout from "../../components/layouts/DashboardLayout";

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">View visitor and staff reports</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow">
          <p className="text-muted-foreground">Reports content will be added soon.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
