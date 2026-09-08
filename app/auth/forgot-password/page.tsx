"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import {
  AuthShell,
  AuthHeader,
  AuthInputField,
  AuthError,
  AuthSubmitButton,
  AuthFooterLink,
} from "@/app/_components/auth/AuthShell";

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
    <AuthShell
      imageSrc="/images/auth-forgot.jpg"
      imageAlt="Modern Corporate Lobby with Security Turnstiles"
      heroHeading="Keep your workspace safe and secure."
      heroBody="Reliable access recovery designed with enterprise-grade security protocols to ensure only verified team members access your visitor records."
      backHref="/auth/login"
      backLabel="Back to sign in"
    >
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
          <AuthHeader
            title="Forgot password?"
            description="Enter your email below and we'll send you a link to reset your password."
          />

          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInputField
              id="reset-email"
              label="Email address"
              icon={Mail}
              type="email"
              autoComplete="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <AuthError message={error} />

            <AuthSubmitButton
              isLoading={isLoading}
              label="Send Reset Link"
              loadingLabel="Sending reset link..."
            />
          </form>

          <AuthFooterLink
            prompt="Remember your password?"
            href="/auth/login"
            linkLabel="Sign in"
          />
        </>
      )}
    </AuthShell>
  );
}
