import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-100 min-h-screen">

      <Sidebar />

      <div className="ml-64">

        <Header />

        <main className="p-8">
          {children}
        </main>

      </div>

    </div>
  );
}