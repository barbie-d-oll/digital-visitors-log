"use client";

import FullscreenButton from "@/components/common/Fullscreen";
import {
  ArrowRight,
  Check,
  ClipboardList,
  LockKeyhole,
  ScanLine,
  Shield,
  Bell,
  UserRoundCheck,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "@/components/common/Toggle";

const features = [
  {
    icon: ScanLine,
    title: "QR Code Check-in",
    description: "Visitors scan and register in seconds from their phone.",
  },
  {
    icon: Bell,
    title: "Instant Notifications",
    description: "Hosts get notified via email, SMS, or Slack the moment a guest arrives.",
  },
  {
    icon: Shield,
    title: "Security & Compliance",
    description: "Blocklists, NDA signing, audit logs, and emergency evacuation lists.",
  },
  {
    icon: ClipboardList,
    title: "Pre-registration",
    description: "Schedule visits in advance. Visitors check in with a code — no forms needed.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description: "Peak hours, busiest days, visit purposes, and exportable reports.",
  },
  {
    icon: UserRoundCheck,
    title: "Multi-organization",
    description: "Each company gets their own workspace, staff, departments, and data.",
  },
];

const HomeLayoutPage = () => {
  return (
    <main className="relative isolate min-h-svh bg-background text-foreground">
      {/* Header */}
      <header className="absolute top-0 left-0 z-10 flex w-full items-center justify-between gap-4 px-[clamp(1.5rem,4.5vw,4.5rem)] py-5 motion-safe:animate-[visitor-reveal_.65s_ease-out_both] max-[620px]:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="grid size-10 shrink-0 place-items-center rounded-[.85rem] bg-brand-gold text-brand-foreground shadow-[0_8px_20px_rgba(27,107,97,.22)]"
            aria-hidden="true"
          >
            <UserRoundCheck size={21} strokeWidth={2.3} />
          </div>
          <div className="min-w-0">
            <p className="m-0 text-[.96rem] font-bold tracking-[-.02em]">
              Visitor Log
            </p>
            <p className="mt-px truncate text-[.68rem] tracking-[.09em] text-muted-foreground uppercase max-[480px]:hidden">
              Your digital welcome desk
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ModeToggle />
          <FullscreenButton />
          <Link
            href="/auth/login"
            className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-card/90 px-4 text-[.78rem] font-bold text-brand shadow-[0_8px_22px_rgba(27,107,97,.1)] backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-ring hover:bg-accent hover:shadow-[0_12px_26px_rgba(27,107,97,.15)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring/40 max-[480px]:px-3"
          >
            <LockKeyhole size={16} aria-hidden="true" />
            <span>Sign in</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex min-h-svh flex-col items-center justify-center px-6 pt-24 pb-16 text-center max-[620px]:px-5 max-[620px]:pt-24">
        <div className="w-full max-w-[52rem] motion-safe:animate-[visitor-reveal_.75s_.1s_ease-out_both]">
          {/* <div className="mx-auto mb-6 flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground shadow-sm w-fit">
            <span className="size-2 rounded-full bg-brand-gold animate-pulse" />
            Trusted by teams across Africa
          </div> */}

          <h1 className="mx-auto max-w-[48rem] text-[clamp(2.8rem,6vw,5.2rem)] leading-[.96] font-bold tracking-[-.06em] text-balance">
            The modern visitor book
            <span className="text-brand-gold"> your front desk deserves.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-[38rem] text-[clamp(1rem,1.4vw,1.15rem)] leading-7 text-muted-foreground">
            Replace paper sign-in books with a secure, intelligent system. Visitors
            check in via QR code, hosts get notified instantly, and you keep a
            complete audit trail.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="flex min-h-13 items-center justify-center gap-2 rounded-xl bg-primary px-7 text-sm font-bold text-primary-foreground shadow-[0_13px_25px_rgba(33,150,243,.2)] transition hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_16px_30px_rgba(33,150,243,.28)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary/40"
            >
              Start for free <ArrowRight size={17} />
            </Link>
            <Link
              href="/auth/login"
              className="flex min-h-13 items-center justify-center rounded-xl border border-border bg-card px-7 text-sm font-bold text-brand shadow-[0_8px_22px_rgba(27,107,97,.08)] transition hover:-translate-y-0.5 hover:border-ring hover:bg-accent hover:shadow-[0_12px_26px_rgba(27,107,97,.14)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring/40"
            >
              Sign in to dashboard
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[.8rem] font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-brand-gold" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-brand-gold" /> Set up in 2 minutes
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-brand-gold" /> Works on any device
            </span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-card/50 px-6 py-20 max-[620px]:px-5 max-[620px]:py-14">
        <div className="mx-auto max-w-[68rem]">
          <div className="text-center mb-12">
            <p className="text-[.72rem] font-bold tracking-[.14em] text-brand uppercase">
              Everything you need
            </p>
            <h2 className="mt-2 text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold tracking-[-.04em]">
              Built for security-conscious workplaces
            </h2>
            <p className="mt-3 mx-auto max-w-lg text-sm text-muted-foreground leading-6">
              From a single reception desk to multiple offices — Visitor Log scales with your team.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-border bg-card p-6 shadow-[0_14px_35px_rgba(48,73,68,.06)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(48,73,68,.1)]"
                >
                  {/* <span className="grid size-11 place-items-center rounded-xl bg-brand-gold/10 text-brand-gold">
                    <Icon size={20} />
                  </span> */}
                  <h3 className="mt-4 text-base font-bold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 max-[620px]:px-5 max-[620px]:py-14">
        <div className="mx-auto max-w-[42rem] text-center">
          <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold tracking-[-.04em]">
            Ready to upgrade your reception?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-6">
            Create your organization in under 2 minutes. No credit card, no commitment.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="flex min-h-13 items-center justify-center gap-2 rounded-xl bg-primary px-7 text-sm font-bold text-primary-foreground shadow-[0_13px_25px_rgba(33,150,243,.2)] transition hover:-translate-y-0.5 hover:bg-primary/90"
            >
              Create your organization <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Visitor Log. Built for modern workplaces.</p>
      </footer>
    </main>
  );
};

export default HomeLayoutPage;
