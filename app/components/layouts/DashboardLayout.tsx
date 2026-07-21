import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">

      <Sidebar />

      <div className="ml-64">

        <Header />

        <main className="pt-24 px-8 pb-8">
          {children}
        </main>

      </div>

    </div>
  );
}
