"use client";

import { useState } from "react";
import DashboardLayout from "../../../components/layouts/DashboardLayout";
import { db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";

export default function AddCompanyPage() {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  async function saveCompany() {
    try {
      await addDoc(collection(db, "companies"), {
        companyName,
        email,
        phone,
        address,
        createdAt: new Date(),
      });

      alert("Company Added Successfully!");

      setCompanyName("");
      setEmail("");
      setPhone("");
      setAddress("");
    } catch (error) {
      console.error(error);
      alert("Failed to save company");
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Add Company</h1>

        <div className="space-y-6 rounded-xl border border-border bg-card p-8 shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="HWS Company"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="admin@hws.com"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="+233..."
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="Accra"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={saveCompany}
            className="rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
          >
            Save Company
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
