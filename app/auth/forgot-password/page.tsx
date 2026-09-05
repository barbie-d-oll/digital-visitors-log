"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, Building2, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

 

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
        toast.success("Reset instructions sent. Please check your email.");
      } else {
        const data = await res.json();
        const msg = data.error || "Something went wrong.";
        setError(msg);
        toast.error(msg);
      }
    } catch {
      const msg = "Network error. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background">
      {/* LEFT COLUMN: Hero Image Banner */}
      <div className="relative hidden w-full lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-muted p-12 text-white select-none">
        {/* Background Image */}
        <Image
          src="/images/auth-forgot.jpg"
          alt="Modern Corporate Lobby with Security Turnstiles"
          fill
          priority
          className="object-cover object-center"
        />

        {/* Ambient Dark Gradient Overlay for Contrast */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/45 to-black/30 backdrop-blur-[0.5px]" />

        {/* Top Branding */}
        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-xl px-4 py-2.5 border border-white/15 transition hover:bg-black/40"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Building2 className="size-5" />
            </span>
          </Link>
        </div>

        {/* Bottom Highlights */}
        <div className="relative z-10 max-w-lg space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Keep your workspace safe and secure.
          </h2>

          <p className="text-sm leading-relaxed text-white/80">
            Reliable access recovery designed with enterprise-grade security protocols
            to ensure only verified team members access your visitor records.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Forgot Password Form Area */}
      <div className="flex w-full lg:w-1/2 flex-col justify-between p-6 sm:p-10 lg:p-16 min-h-screen overflow-y-auto">
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> Back to sign in
          </Link>
          
        </div>

        {/* Centered Form Area */}
        <div className="mx-auto my-auto w-full max-w-md py-8">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
                <Mail className="size-8" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Check your email
              </h1>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                If an account with{" "}
                <span className="font-semibold text-foreground">{email}</span>{" "}
                exists, we have sent a password reset link to your inbox and spam folder.
              </p>

              <div className="mt-8 space-y-3">
                <Link
                  href="/auth/login"
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Return to sign in <ArrowRight className="size-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="flex min-h-11 w-full items-center justify-center rounded-xl border border-input bg-card text-sm font-semibold text-foreground shadow-xs transition hover:bg-accent hover:border-ring"
                >
                  Try another email
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Forgot password?
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enter your email below and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="reset-email"
                    className="block text-xs font-bold uppercase tracking-wider text-foreground/80 mb-2"
                  >
                    Email address
                  </label>
                  <div className="flex min-h-11 items-center gap-2.5 rounded-xl border border-input bg-card px-3.5 transition focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20">
                    <Mail className="size-4 text-muted-foreground shrink-0" />
                    <input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div
                    className="rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive"
                    aria-live="polite"
                  >
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm transition hover:not-disabled:bg-primary/90 hover:not-disabled:-translate-y-0.5 active:translate-y-0 disabled:cursor-wait disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Sending reset link...
                    </>
                  ) : (
                    <>
                      Send Reset Link <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Switch Link */}
              <p className="mt-8 text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link
                  href="/auth/login"
                  className="font-semibold text-brand hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-muted-foreground/75">
          &copy; {new Date().getFullYear()} Visitor Log. All rights reserved.
        </p>
      </div>
    </div>
  );
}
