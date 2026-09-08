"use client";

import type {
  ComponentType,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Building2, Eye, EyeOff, LockKeyhole } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// ---------------------------------------------------------------------------
// AuthShell – two-column page wrapper (hero image left, form right)
// ---------------------------------------------------------------------------

type AuthShellProps = {
  /** Path inside /public, e.g. "/images/auth-signin.jpg" */
  imageSrc: string;
  imageAlt: string;
  heroHeading: string;
  heroBody: string;
  /** href + label for the top-left back link */
  backHref: string;
  backLabel: string;
  children: ReactNode;
};

export function AuthShell({
  imageSrc,
  imageAlt,
  heroHeading,
  heroBody,
  backHref,
  backLabel,
  children,
}: AuthShellProps) {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background">
      {/* LEFT – Hero image panel */}
      <div className="relative hidden w-full lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-muted p-12 text-white select-none">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/45 to-black/30 backdrop-blur-[0.5px]" />

        {/* Branding badge */}
        <div className="relative z-10">
          <div className="flex items-center justify-between">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-5" />
             
          </Link>
        </div>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 max-w-lg space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {heroHeading}
          </h2>
          <p className="text-sm leading-relaxed text-white/80">{heroBody}</p>
        </div>
      </div>

      {/* RIGHT – Form panel */}
      <div className="flex w-full lg:w-1/2 flex-col justify-between p-6 sm:p-10 lg:p-16 min-h-screen overflow-y-auto">
         

        <div className="mx-auto my-auto w-full max-w-md py-8">{children}</div>

        <p className="text-center text-xs text-muted-foreground/75">
          &copy; {new Date().getFullYear()} Visitor Log. All rights reserved.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AuthHeader – page title + subtitle
// ---------------------------------------------------------------------------

export function AuthHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AuthInputField – icon-prefixed labelled input
// ---------------------------------------------------------------------------

type AuthInputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** Optional element placed to the right of the label (e.g. "Forgot password?") */
  labelSlot?: ReactNode;
};

export function AuthInputField({
  label,
  icon: Icon,
  labelSlot,
  id,
  ...props
}: AuthInputFieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor={id}
          className="block text-xs font-bold uppercase tracking-wider text-foreground/80"
        >
          {label}
        </label>
        {labelSlot}
      </div>
      <div className="flex min-h-11 items-center gap-2.5 rounded-xl border border-input bg-card px-3.5 transition focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20">
        <Icon className="size-4 text-muted-foreground shrink-0" />
        <input
          id={id}
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
          {...props}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AuthPasswordField – password input with built-in show/hide toggle
// ---------------------------------------------------------------------------

type AuthPasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  labelSlot?: ReactNode;
};

export function AuthPasswordField({
  label,
  labelSlot,
  id,
  ...props
}: AuthPasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor={id}
          className="block text-xs font-bold uppercase tracking-wider text-foreground/80"
        >
          {label}
        </label>
        {labelSlot}
      </div>
      <div className="flex min-h-11 items-center gap-2.5 rounded-xl border border-input bg-card px-3.5 transition focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20">
        <LockKeyhole className="size-4 text-muted-foreground shrink-0" />
        <input
          id={id}
          type={show ? "text" : "password"}
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AuthError – inline destructive error banner
// ---------------------------------------------------------------------------

export function AuthError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div
      className="rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive"
      aria-live="polite"
    >
      {message}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AuthSubmitButton – primary CTA with loading spinner
// ---------------------------------------------------------------------------

export function AuthSubmitButton({
  isLoading,
  loadingLabel,
  label,
}: {
  isLoading: boolean;
  loadingLabel: string;
  label: string;
}) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="mt-2 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm transition hover:not-disabled:bg-primary/90 hover:not-disabled:-translate-y-0.5 active:translate-y-0 disabled:cursor-wait disabled:opacity-70"
    >
      {isLoading ? (
        <>
          <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          {loadingLabel}
        </>
      ) : (
        <>
          {label} <ArrowRight className="size-4" />
        </>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// AuthDivider – "OR" horizontal rule separator
// ---------------------------------------------------------------------------

export function AuthDivider() {
  return (
    <div className="relative my-6 text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
      <span className="relative z-10 bg-background px-3 font-bold uppercase tracking-wider text-muted-foreground">
        OR
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AuthGoogleButton – Google OAuth CTA
// ---------------------------------------------------------------------------

export function AuthGoogleButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-11 w-full items-center justify-center gap-3 rounded-xl border border-input bg-card text-sm font-semibold text-foreground shadow-xs transition hover:bg-accent hover:border-ring hover:-translate-y-0.5"
    >
      <svg className="size-4.5" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      Continue with Google
    </button>
  );
}

// ---------------------------------------------------------------------------
// AuthFooterLink – bottom "Already have an account? Sign in" line
// ---------------------------------------------------------------------------

export function AuthFooterLink({
  prompt,
  href,
  linkLabel,
}: {
  prompt: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <p className="mt-8 text-center text-sm text-muted-foreground">
      {prompt}{" "}
      <Link href={href} className="font-semibold text-brand hover:underline">
        {linkLabel}
      </Link>
    </p>
  );
}
