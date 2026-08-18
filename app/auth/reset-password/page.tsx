"use client";

import { FormEvent, Suspense, useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { ModeToggle } from "@/components/common/Toggle";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
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
        setError(data.error || "Failed to reset password.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Invalid or missing reset token.</p>
        <Link href="/auth/forgot-password" className="mt-3 inline-block text-sm font-semibold text-brand hover:underline">
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/auth/login" className="text-sm font-medium text-brand hover:underline">
            ← Back to login
          </Link>
          <ModeToggle />
        </div>

        <div className="rounded-2xl border border-border bg-card p-7 shadow-[0_30px_80px_rgba(48,73,68,.1)]">
          {success ? (
            <div className="text-center py-6">
              <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
                <LockKeyhole size={24} />
              </div>
              <h1 className="text-xl font-bold text-foreground">Password reset!</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Your password has been updated. You can now sign in with your new password.
              </p>
              <Link
                href="/auth/login"
                className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground hover:bg-primary/90"
              >
                Sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Set new password
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose a strong password for your account.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div>
                  <label className="mb-2 block text-xs font-bold text-foreground/80" htmlFor="new-pw">
                    New password
                  </label>
                  <div className="flex min-h-12 items-center gap-2.5 rounded-xl border border-input bg-background px-4 transition focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/20">
                    <LockKeyhole size={18} className="text-muted-foreground" />
                    <input
                      className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                      id="new-pw"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-xs font-bold text-foreground/80" htmlFor="confirm-pw">
                    Confirm password
                  </label>
                  <div className="flex min-h-12 items-center gap-2.5 rounded-xl border border-input bg-background px-4 transition focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/20">
                    <LockKeyhole size={18} className="text-muted-foreground" />
                    <input
                      className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                      id="confirm-pw"
                      type={showPassword ? "text" : "password"}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                  {isLoading ? "Resetting..." : "Reset password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
