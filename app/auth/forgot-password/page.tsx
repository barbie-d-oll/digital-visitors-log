"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";

import { ModeToggle } from "@/components/common/Toggle";

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
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/auth/login" className="flex items-center gap-1 text-sm font-medium text-brand hover:underline">
            <ArrowLeft className="size-4" /> Back to login
          </Link>
          <ModeToggle />
        </div>

        <div className="rounded-2xl border border-border bg-card p-7 shadow-[0_30px_80px_rgba(48,73,68,.1)]">
          {sent ? (
            <div className="text-center py-6">
              <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
                <Mail size={24} />
              </div>
              <h1 className="text-xl font-bold text-foreground">Check your email</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                If an account with that email exists, we've sent a password reset link. Check your inbox and spam folder.
              </p>
              <Link
                href="/auth/login"
                className="mt-6 inline-block text-sm font-semibold text-brand hover:underline"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Forgot password?
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div>
                  <label className="mb-2 block text-xs font-bold text-foreground/80" htmlFor="reset-email">
                    Email address
                  </label>
                  <div className="flex min-h-12 items-center gap-2.5 rounded-xl border border-input bg-background px-4 transition focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/20">
                    <Mail size={18} className="text-muted-foreground" />
                    <input
                      className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {error && <p className="mt-3 text-xs text-destructive">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground transition hover:not-disabled:bg-primary/90 disabled:opacity-70"
                >
                  {isLoading ? "Sending..." : "Send reset link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
