import React from "react";
import { Button } from "@/components/ui/button";

const plans = [
  { name: "Free Trial", desc: "Get started with core features", tag: "Best for evaluation", cta: "Get Started" },
  { name: "Professional", desc: "For growing organizations", tag: "Recommended", cta: "Get Started" },
  { name: "Enterprise", desc: "Advanced management and support", tag: "Contact Sales", cta: "Contact Sales" },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-16">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <h3 className="text-2xl font-bold">Simple pricing, built for teams</h3>
        <p className="mt-2 text-muted-foreground">Start with a trial, upgrade when you're ready.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {plans.map((p) => (
            <div key={p.name} className="rounded-lg border border-border bg-card p-6">
              <div className="text-sm text-muted-foreground">{p.tag}</div>
              <div className="mt-2 text-xl font-bold">{p.name}</div>
              <div className="mt-3 text-sm text-muted-foreground">{p.desc}</div>
              <div className="mt-6">
                <Button>{p.cta}</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
