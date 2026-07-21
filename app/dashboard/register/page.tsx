"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { db } from "@/lib/firebase";
import { addDoc, collection, getDocs } from "firebase/firestore";

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
}

export default function RegisterVisitorPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [purpose, setPurpose] = useState("");

  // Selected staff ID
  const [staff, setStaff] = useState("");

  // Staff list from Firestore
  const [staffList, setStaffList] = useState<StaffMember[]>([]);

  useEffect(() => {
    loadStaffList();
  }, []);

  async function loadStaffList() {
    try {
      const snapshot = await getDocs(collection(db, "staff"));

      const data: StaffMember[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<StaffMember, "id">),
      }));

      setStaffList(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function registerVisitor() {
    try {
      const selectedStaff = staffList.find(
        (member) => member.id === staff
      );

      if (!selectedStaff) {
        alert("Please select a staff member.");
        return;
      }

      await addDoc(collection(db, "visitors"), {
        name,
        phone,
        company,
        purpose,

        staffId: selectedStaff.id,
        staffName: `${selectedStaff.firstName} ${selectedStaff.lastName}`,
        staffEmail: selectedStaff.email,
        staffPhone: selectedStaff.phone,
        department: selectedStaff.department,

        status: "Pending",

        checkIn: new Date(),
      });

      alert("Visitor Registered Successfully");

      setName("");
      setPhone("");
      setCompany("");
      setPurpose("");
      setStaff("");
    } catch (error) {
      console.error(error);
      alert("Failed to register visitor");
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">
          Register Visitor
        </h1>

        <div className="bg-white rounded-xl shadow p-8">
          <div className="grid grid-cols-2 gap-6">

            <div>
              <label className="block mb-2">Full Name</label>
              <input
                className="w-full border rounded-lg p-3"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-2">Phone</label>
              <input
                className="w-full border rounded-lg p-3"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-2">Company</label>
              <input
                className="w-full border rounded-lg p-3"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-2">Purpose</label>
              <input
                className="w-full border rounded-lg p-3"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>

            <div className="col-span-2">
              <label className="block mb-2">
                Staff to Visit
              </label>

              <select
                className="w-full border rounded-lg p-3"
                value={staff}
                onChange={(e) => setStaff(e.target.value)}
              >
                <option value="">
                  Select Staff Member
                </option>

                {staffList.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.firstName} {member.lastName} —{" "}
                    {member.department}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <button
            onClick={registerVisitor}
            className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Register Visitor
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
