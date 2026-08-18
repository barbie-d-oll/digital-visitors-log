"use client"

import React from "react";
import { Card } from "@/components/ui/card";
import { ClipboardList, QrCode, Users, BarChart2, Lock, Bell } from "lucide-react";

const features = [
//   { title: "Multi-Tenant Management", icon: Users, desc: "Each organization gets its own secure workspace and settings." },
  { title: "Visitor Check-In", icon: ClipboardList, desc: "Fast visitor registration and simple workflows for reception." },
  { title: "QR Check-In", icon: QrCode, desc: "Visitors can scan a QR code for quick check-ins." },
//   { title: "Multiple Locations", icon: BarChart2, desc: "Manage visitors across branches from one account." },
  { title: "Notifications", icon: Bell, desc: "Notify hosts when their visitors arrive." },
  { title: "Security", icon: Lock, desc: "Organization-level data isolation and role-based access." },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-16">
      <div className="mx-auto max-w-7xl px-6">
        <h3 className="text-3xl font-bold">
          Everything you need to manage visitors with confidence
        </h3>
        <p className="mt-2 text-muted-foreground">
          From first check-in to final checkout, Digital Visitors Log gives your
          organization complete visibility over visitor activity.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {features.map((f) => (
            <Card
              key={f.title}
              className="p-5 hover:-translate-y-1 hover:shadow-enterprise-md transition"
            >
              <div className="flex items-start gap-4">
                <div className="grid size-10 place-items-center rounded-lg bg-primary text-brand-foreground">
                  <f.icon size={18} />
                </div>
                <div>
                  <div className="font-semibold">{f.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {f.desc}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
