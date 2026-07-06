import DashboardLayout from "../../components/layouts/DashboardLayout";


export default function RegisterVisitorPage() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        Register Visitor
      </h1>

      <div className="bg-white rounded-xl shadow p-8 max-w-5xl">

        <div className="grid grid-cols-2 gap-6">

          <div>
            <label className="block mb-2">Full Name</label>
            <input
              type="text"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2">Phone Number</label>
            <input
              type="text"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2">Company</label>
            <input
              type="text"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2">Email</label>
            <input
              type="email"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2">Purpose of Visit</label>
            <input
              type="text"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2">Staff to Visit</label>

            <select className="w-full border rounded-lg p-3">
              <option>Barbara Logah</option>
              <option>John Mensah</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block mb-2">Visitor Photo</label>

            <input
              type="file"
              className="w-full border rounded-lg p-3"
            />
          </div>

        </div>

        <button className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Register Visitor
        </button>

      </div>
    </DashboardLayout>
  );
}