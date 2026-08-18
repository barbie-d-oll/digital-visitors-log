"use client";

import { LockKeyhole, UserRoundCheck } from "lucide-react";
import Link from "next/link";

export function VisitorHeader() {
  return (
    <header className="absolute top-0 left-0 z-10 flex w-full items-center justify-between gap-4 px-[clamp(1.5rem,4.5vw,4.5rem)] py-5 motion-safe:animate-[visitor-reveal_.65s_ease-out_both] max-[620px]:p-5">
      <Link
        href="/"
        className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring/40"
        aria-label="Visitor Log home"
      >
        <span
          className="grid size-10 shrink-0 place-items-center rounded-[.85rem] bg-brand-gold text-brand-foreground shadow-[0_8px_20px_rgba(27,107,97,.22)]"
          aria-hidden="true"
        >
          <UserRoundCheck size={21} strokeWidth={2.3} />
        </span>
        <span className="min-w-0">
          <strong className="block text-[.96rem] font-bold tracking-[-.02em]">
            Visitor Log
          </strong>
          <small className="mt-px block truncate text-[.68rem] tracking-[.09em] text-muted-foreground uppercase max-[480px]:hidden">
            Your digital welcome desk
          </small>
        </span>
      </Link>

      <Link
        href="/auth/login"
        className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-card/90 px-4 text-[.78rem] font-bold text-brand shadow-[0_8px_22px_rgba(27,107,97,.1)] backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-ring hover:bg-accent hover:shadow-[0_12px_26px_rgba(27,107,97,.15)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring/40 max-[480px]:px-3"
      >
        <LockKeyhole size={16} aria-hidden="true" />
        <span>Sign in</span>
      </Link>
    </header>
  );
}
