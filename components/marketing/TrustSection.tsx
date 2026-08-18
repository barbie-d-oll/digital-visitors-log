import React from "react";

const logos = ["Acme Corp", "InnovateLab", "Global Inc.", "NextGen", "Prime Solutions", "TechStart"];

export default function TrustSection() {
  return (
    <section className="bg-surface-muted py-10">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <p className="text-lg font-semibold text-muted-foreground">Trusted by organizations </p>

        <div className="mt-6 marquee" aria-hidden="false">
          <div className="marquee-track" style={{ ['--marquee-duration' as any]: '22s' }}>
            {logos.concat(logos).map((name, idx) => (
              <div key={`${name}-${idx}`} className="px-4 py-3 rounded-lg bg-card/80 text-sm text-muted-foreground min-w-[8rem] flex items-center justify-center">
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
