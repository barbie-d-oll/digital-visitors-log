"use client";

import { FormEvent, Suspense, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

 

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background">
      {/* LEFT COLUMN: Hero Image Banner */}
      <div className="relative hidden w-full lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-muted p-12 text-white select-none">
        {/* Background Image */}
        <Image
          src="/images/auth-reset.jpg"
          alt="Modern Executive Reception and Security Desk"
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
            Seamless recovery, uncompromising security.
          </h2>

          <p className="text-sm leading-relaxed text-white/80">
            Restore your credentials with peace of mind. Your organization&apos;s
            visitor privacy and front-desk security remain fully safeguarded.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Form Container */}
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

        {/* Centered Area */}
        <div className="mx-auto my-auto w-full max-w-md py-8">
          {!token ? (
            /* Missing or invalid token screen */
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
            /* Success confirmation screen */
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
              <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Set new password
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Please choose a strong password with at least 6 characters.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div>
                  <label
                    htmlFor="reset-new-password"
                    className="block text-xs font-bold uppercase tracking-wider text-foreground/80 mb-2"
                  >
                    New Password
                  </label>
                  <div className="flex min-h-11 items-center gap-2.5 rounded-xl border border-input bg-card px-3.5 transition focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20">
                    <LockKeyhole className="size-4 text-muted-foreground shrink-0" />
                    <input
                      id="reset-new-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="reset-confirm-password"
                    className="block text-xs font-bold uppercase tracking-wider text-foreground/80 mb-2"
                  >
                    Confirm New Password
                  </label>
                  <div className="flex min-h-11 items-center gap-2.5 rounded-xl border border-input bg-card px-3.5 transition focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20">
                    <LockKeyhole className="size-4 text-muted-foreground shrink-0" />
                    <input
                      id="reset-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
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
                      Updating password...
                    </>
                  ) : (
                    <>
                      Reset Password <ArrowRight className="size-4" />
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
