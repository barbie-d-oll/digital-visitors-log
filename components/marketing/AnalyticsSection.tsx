import React from "react";

export default function AnalyticsSection() {
  return (
    <section className="py-16 bg-background">
      <div className="mx-auto max-w-7xl px-6">
        <h3 className="text-2xl font-bold">Turn visitor activity into useful insights</h3>
        <p className="mt-2 text-muted-foreground">Understand peaks, visitor purposes, and location performance.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">Visitors over time</div>
            <div className="mt-2 h-28 rounded bg-surface"></div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">Visitors by purpose</div>
            <div className="mt-2 h-28 rounded bg-surface"></div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">Peak hours</div>
            <div className="mt-2 h-28 rounded bg-surface"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
