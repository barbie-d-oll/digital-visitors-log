"use client"

 
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import DashboardImage from '@/public/computer-screen-displaying-detailed-analytics-.jpg'

function DashboardMock() {
  return (
    <div className="relative w-full  m-auto max-w-4xl rounded-2xl border border-border bg-card p-6 shadow-enterprise-lg motion-safe:animate-[visitor-drift_6s_ease-in-out_infinite_alternate]">
      <Image src={DashboardImage} alt="dashboard-image"  className="rounded-2xl object-cover" />
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative isolate h-screen overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl px-6 h-full">
        <div className="grid gap-8 md:grid-cols-2 md:items-center h-full">
          <div className="max-w-xl h-full flex flex-col justify-center">
            <h2 className="mt-6 text-5xl font-bold leading-tight text-foreground md:text-6xl">
              A smarter way to manage <span className="text-brand-gold">every visitor</span>
            </h2>

            <p className="mt-4 text-lg text-muted-foreground">Digital Visitors Log helps organizations securely manage visitors, streamline check-ins, monitor activity, and create a professional experience for every guest.</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/register"><Button>Start Free</Button></Link>
              <Button variant="outline">Book a Demo</Button>
            </div>

            <ul className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><span className="grid size-5 place-items-center rounded-full bg-brand-gold text-brand-foreground"><Check size={12} /></span>No complicated setup</li>
              <li className="flex items-center gap-2"><span className="grid size-5 place-items-center rounded-full bg-brand-gold text-brand-foreground"><Check size={12} /></span>Secure visitor management</li>
              <li className="flex items-center gap-2"><span className="grid size-5 place-items-center rounded-full bg-brand-gold text-brand-foreground"><Check size={12} /></span>Built for modern organizations</li>
            </ul>
          </div>

          <div className="flex items-center justify-center h-full">
            <div className="w-full max-w-4xl h-full flex items-center justify-center">
              <DashboardMock />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
