"use client";

import React, { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function OrganizationLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.message ?? "Sign in failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Organization Sign In</h1>
        <p className="text-sm text-muted-foreground mb-6">Sign in with your organization account to manage visitors and view the dashboard.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-xs font-bold text-foreground/80">Email</span>
            <input
              type="email"
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="block relative">
            <span className="block text-xs font-bold text-foreground/80">Password</span>
            <input
              type={showPassword ? "text" : "password"}
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center rounded-md p-1 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </label>

          {error ? <div className="text-xs text-destructive">{error}</div> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-70"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-4 text-sm text-muted-foreground">
          Need an account? <Link href="/register/organization" className="text-brand">Create organization</Link>
        </div>
      </div>
    </main>
  );
}
