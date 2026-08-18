import React from "react";

export default function MultiTenantSection() {
  return (
    <section className="py-16 bg-surface-muted">
      <div className="mx-auto max-w-7xl px-6">
        <h3 className="text-2xl font-bold">One platform. Every organization.</h3>
        <p className="mt-2 text-muted-foreground">Each company receives an independent workspace with isolated data, users, and settings.</p>

        <div className="mt-8 flex items-center justify-center">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-enterprise-md">
            <pre className="text-sm">{`                 Digital Visitors Log
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   Company A        Company B        Company C
        │                │                │
   ┌────┼────┐      ┌────┼────┐      ┌────┼────┐
   HQ  Branch 2      HQ  Branch 2      HQ  Branch 2`}</pre>
          </div>
        </div>
      </div>
    </section>
  )
}
