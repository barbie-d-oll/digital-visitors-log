import React from "react";
import { CheckCircle } from "lucide-react";

const steps = [
  { title: "Create your organization", desc: "Create your organization and set up your workspace." },
  { title: "Set up your locations", desc: "Add offices, branches, and reception areas." },
  { title: "Invite your team", desc: "Add employees and assign roles." },
  { title: "Start managing visitors", desc: "Check visitors in and monitor activity." },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <h3 className="text-2xl font-bold">Get started in minutes</h3>
        <p className="mt-2 text-muted-foreground">A few simple steps to onboard your organization.</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="rounded-lg border border-border bg-card p-6 text-left">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-md bg-primary text-brand-foreground"><CheckCircle size={18} /></div>
                <div>
                  <div className="font-semibold">{`Step ${String(i + 1).padStart(2, "0")}`}</div>
                  <div className="mt-1 text-lg font-bold">{s.title}</div>
                  <div className="mt-2 text-sm text-muted-foreground">{s.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
