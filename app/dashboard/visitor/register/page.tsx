"use client";

import { useState } from "react";
import DashboardLayout from "../../../components/layouts/DashboardLayout";
import { db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";

export default function RegisterVisitorPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [staff, setStaff] = useState("");

  async function registerVisitor() {
    try {
      await addDoc(collection(db, "visitors"), {
        name,
        phone,
        purpose,
        staff,
        status: "Pending",
        checkIn: new Date(),
      });

      alert("Visitor Registered Successfully");

      setName("");
      setPhone("");
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
        <h1 className="text-3xl font-bold mb-6">Register Visitor</h1>

        <div className="rounded-xl border border-border bg-card p-8 shadow">

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
              <label className="block mb-2">Purpose</label>
              <input
                className="w-full border rounded-lg p-3"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>

            <div className="col-span-2">
              <label className="block mb-2">Staff to Visit</label>
              <input
                className="w-full border rounded-lg p-3"
                value={staff}
                onChange={(e) => setStaff(e.target.value)}
              />
            </div>

          </div>

          <button
            onClick={registerVisitor}
            className="mt-8 rounded-lg bg-primary px-6 py-3 text-primary-foreground"
          >
            Register Visitor
          </button>

        </div>
      </div>
    </DashboardLayout>
  );
}
