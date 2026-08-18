import React from "react";

const cases = [
  { title: "Corporate Offices", desc: "Manage employees, guests, and meetings." },
  { title: "Schools", desc: "Track visitors and authorized guests." },
  { title: "Healthcare", desc: "Organize visitor flow and records." },
  { title: "Government", desc: "Improve visibility and accountability." },
  { title: "Multi-Branch", desc: "Centralized management across locations." },
  { title: "Small Business", desc: "Replace paper logs with a modern solution." },
];

export default function UseCasesSection() {
  return (
    <section className="py-16 bg-surface-muted">
      <div className="mx-auto max-w-7xl px-6">
        <h3 className="text-2xl font-bold">Built for organizations of every size</h3>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => (
            <div key={c.title} className="rounded-lg border border-border bg-card p-5">
              <div className="font-semibold">{c.title}</div>
              <div className="mt-2 text-sm text-muted-foreground">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
