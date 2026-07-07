import DashboardLayout from "../../components/layouts/DashboardLayout";
import Link from "next/link";

export default function VisitorsPage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Visitors</h1>
          <p className="text-gray-500">
            Register and manage visitors
          </p>
        </div>

        <Link
          href="/dashboard/visitor/register"
          className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700">

          + Register Visitor
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">

        <table className="w-full">

          <thead>
            <tr className="border-b">
              <th className="text-left py-3">Visitor</th>
              <th>Host</th>
              <th>Purpose</th>
              <th>Time In</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            <tr className="border-b">
              <td className="py-4">Kwame Asare</td>
              <td>MTN Ghana</td>
              <td>Barbara Logah</td>
              <td>Meeting</td>
              <td>09:15 AM</td>
              <td className="text-green-600 font-semibold">
                Checked In
              </td>
            </tr>

            <tr className="border-b">
              <td className="py-4">Akosua Boateng</td>
              <td>Vodafone Ghana</td>
              <td>John Mensah</td>
              <td>Interview</td>
              <td>10:30 AM</td>
              <td className="text-yellow-600 font-semibold">
                Waiting
              </td>
            </tr>

          </tbody>

        </table>

      </div>
    </DashboardLayout>
  );
}