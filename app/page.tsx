import Sidebar from "./components/layouts/Sidebar";
import Header from "./components/layouts/Header";
import StatCard from "./components/dasboard/StatCard";

export default function Home() {
  return (
    <main className="flex">

      <Sidebar />

      <div className="flex-1 bg-gray-100 min-h-screen p-8">

        <Header />

        <div className="grid grid-cols-4 gap-6 mt-8">

          <StatCard
            title="Visitors Today"
            value={18}
          />

          <StatCard
            title="Pending Approval"
            value={4}
          />

          <StatCard
            title="Staff Present"
            value={67}
          />

          <StatCard
            title="Checked Out"
            value={11}
          />

        </div>

      </div>

    </main>
  );
}