import DashboardLayout from "../../../components/layouts/DashboardLayout";


export default function AddStaffPage() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        Add Staff
      </h1>

      <div className="bg-white rounded-xl shadow p-8 max-w-4xl">

        <div className="grid grid-cols-2 gap-6">

          <div>
            <label className="block mb-2">First Name</label>
            <input
              type="text"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2">Last Name</label>
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
            <label className="block mb-2">Phone</label>
            <input
              type="text"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2">Department</label>
            <input
              type="text"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2">Position</label>
            <input
              type="text"
              className="w-full border rounded-lg p-3"
            />
          </div>

        </div>

        <button className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-lg">
          Save Staff
        </button>

      </div>
    </DashboardLayout>
  );
}