"use client";

import { FormEvent, Suspense, useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import {
  AuthShell,
  AuthHeader,
  AuthPasswordField,
  AuthError,
  AuthSubmitButton,
  AuthFooterLink,
} from "@/app/_components/auth/AuthShell";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      const msg = "Password must be at least 6 characters.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = "Passwords do not match.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error || "Failed to reset password.";
        setError(msg);
        toast.error(msg);
        return;
      }

      setSuccess(true);
      toast.success("Password reset successfully!");
    } catch {
      const msg = "Something went wrong. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      imageSrc="/images/auth-reset.jpg"
      imageAlt="Modern Executive Reception and Security Desk"
      heroHeading="Seamless recovery, uncompromising security."
      heroBody="Restore your credentials with peace of mind. Your organization's visitor privacy and front-desk security remain fully safeguarded."
      backHref="/auth/login"
      backLabel="Back to sign in"
    >
      {!token ? (
        /* Invalid / expired token screen */
        <div className="text-center">
          <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-xs">
            <AlertCircle className="size-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Invalid or expired link
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            This password reset link is invalid or has already expired.
            Please request a new reset link to proceed.
          </p>

          <div className="mt-8 space-y-3">
            <Link
              href="/auth/forgot-password"
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0"
            >
              Request new reset link <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/auth/login"
              className="flex min-h-11 w-full items-center justify-center rounded-xl border border-input bg-card text-sm font-semibold text-foreground shadow-xs transition hover:bg-accent hover:border-ring"
            >
              Return to sign in
            </Link>
          </div>
        </div>
      ) : success ? (
        /* Success screen */
        <div className="text-center">
          <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-xs">
            <CheckCircle2 className="size-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Password updated!
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Your password has been changed successfully. You can now sign in with your new credentials.
          </p>

          <div className="mt-8">
            <Link
              href="/auth/login"
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0"
            >
              Sign in to your account <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Reset password form */
        <>
          <AuthHeader
            title="Set new password"
            description="Please choose a strong password with at least 6 characters."
          />

          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthPasswordField
              id="reset-new-password"
              label="New Password"
              autoComplete="new-password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />

            <AuthPasswordField
              id="reset-confirm-password"
              label="Confirm New Password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />

            <AuthError message={error} />

            <AuthSubmitButton
              isLoading={isLoading}
              label="Reset Password"
              loadingLabel="Updating password..."
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
