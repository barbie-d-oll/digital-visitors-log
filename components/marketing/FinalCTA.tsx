import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FinalCTA() {
  return (
    <section className="py-16 bg-brand-muted">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <h3 className="text-3xl font-bold">Ready to modernize your visitor experience?</h3>
        <p className="mt-2 text-muted-foreground">Start managing visitors more efficiently with Digital Visitors Log.</p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <Link href="/register"><Button>Get Started</Button></Link>
          <Button variant="outline">Book a Demo</Button>
        </div>
      </div>
    </section>
  )
}
