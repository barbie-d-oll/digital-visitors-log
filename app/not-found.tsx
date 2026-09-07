"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Home,
  LayoutDashboard,
  LogIn,
  Compass,
  UserRoundCheck,
  Building2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-background text-foreground antialiased selection:bg-brand/20">
      {/* Ambient background glow elements */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px] dark:bg-brand/15"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 right-10 -z-10 h-[400px] w-[400px] rounded-full bg-primary/15 blur-[100px] dark:bg-primary/10"
        aria-hidden="true"
      />

      {/* Header bar */}
      <header className="relative z-10 flex w-full items-center justify-between px-6 py-5 sm:px-12">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Visitor Log Homepage"
        >
          <span
            className="grid size-10 place-items-center rounded-xl bg-brand-gold text-brand-foreground shadow-sm transition-transform duration-200 group-hover:scale-105"
            aria-hidden="true"
          >
            <UserRoundCheck size={20} strokeWidth={2.4} />
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-foreground">
              Visitor Log
            </span>
            <span className="text-[0.68rem] tracking-wider text-muted-foreground uppercase">
              Digital Reception Desk
            </span>
          </div>
        </Link>

        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/80 px-3.5 py-2 text-xs font-semibold text-foreground/80 shadow-xs backdrop-blur-sm transition hover:border-ring hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LogIn size={14} className="text-brand" aria-hidden="true" />
          <span>Staff Sign In</span>
        </Link>
      </header>

      {/* Main error presentation */}
      <main className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-10 text-center sm:py-16">
         

        {/* Big 404 Headline */}
        <div className="relative my-2 select-none motion-safe:animate-[visitor-reveal_0.6s_ease-out_both]">
          <span
            className="block text-[6.5rem]  motion-safe:animate-[visitor-float_4s_ease-in-out_infinite] font-black leading-none tracking-tighter text-foreground/10 sm:text-[10rem] dark:text-foreground/10"
            aria-hidden="true"
          >
            404
          </span>
           
        </div>

        {/* Text Content */}
        <div className="space-y-3 motion-safe:animate-[visitor-reveal_0.7s_ease-out_both]">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            We couldn&apos;t find this page
          </h1>
          <p className="mx-auto max-w-md text-sm text-muted-foreground sm:text-base">
            The link you followed may have expired, been moved, or does not exist.
            Let&apos;s get you back to where you need to be.
          </p>
        </div>

        {/* Call to Action Buttons */}
        <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:flex-row motion-safe:animate-[visitor-reveal_0.8s_ease-out_both]">
          <Button
            asChild
            size="lg"
            className="h-11 w-full gap-2 rounded-xl bg-brand font-semibold text-brand-foreground shadow-sm transition hover:bg-brand/90 sm:w-auto sm:px-6"
          >
            <Link href="/" aria-label="Return to homepage">
              <Home size={17} aria-hidden="true" />
              <span>Return to Home</span>
            </Link>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => router.back()}
            className="h-11 w-full gap-2 rounded-xl border-border bg-card/60 font-medium transition hover:bg-accent sm:w-auto sm:px-5"
            aria-label="Go back to the previous page"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Go Back</span>
          </Button>
        </div>

         
      </main>

      {/* Footer info */}
      <footer className="relative z-10 w-full px-6 py-5 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Visitor Log. All rights reserved.</p>
      </footer>
    </div>
  );
}
