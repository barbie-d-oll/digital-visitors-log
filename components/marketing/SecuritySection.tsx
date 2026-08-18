import React from "react";

export default function SecuritySection() {
  return (
    <section id="security" className="py-16">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <h3 className="text-2xl font-bold">Built with security in mind</h3>
        <p className="mt-2 text-muted-foreground">Organization-level isolation, role-based permissions, and secure visitor records.</p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="font-semibold">Secure Workspaces</div>
            <div className="mt-2 text-sm text-muted-foreground">Each organization has isolated data and settings.</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="font-semibold">Role-Based Access</div>
            <div className="mt-2 text-sm text-muted-foreground">Grant employees only the access they need.</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="font-semibold">Protected Visitor Info</div>
            <div className="mt-2 text-sm text-muted-foreground">Visitor records are controlled and auditable.</div>
          </div>
        </div>
      </div>
    </section>
  )
}
