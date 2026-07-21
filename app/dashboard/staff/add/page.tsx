"use client";

import { useState } from "react";
import DashboardLayout from "../../../components/layouts/DashboardLayout";
import { db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";

export default function AddStaffPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");

  async function saveStaff() {
    try {
      await addDoc(collection(db, "staff"), {
        firstName,
        lastName,
        email,
        phone,
        department,
        position,
        createdAt: new Date(),
      });

      alert("Staff Added Successfully!");

      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setDepartment("");
      setPosition("");
    } catch (error) {
      console.error(error);
      alert("Failed to save staff");
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Add Staff</h1>

        <div className="rounded-xl border border-border bg-card p-8 shadow">
          <div className="grid grid-cols-2 gap-6">

            <div>
              <label className="block mb-2">First Name</label>
              <input
                className="w-full border rounded-lg p-3"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-2">Last Name</label>
              <input
                className="w-full border rounded-lg p-3"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-2">Email</label>
              <input
                type="email"
                className="w-full border rounded-lg p-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              <label className="block mb-2">Department</label>
              <input
                className="w-full border rounded-lg p-3"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-2">Position</label>
              <input
                className="w-full border rounded-lg p-3"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
            </div>

          </div>

          <button
            type="button"
            onClick={saveStaff}
            className="mt-8 rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
          >
            Save Staff
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
