"use client";

import { FormEvent, Suspense, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const redirect = searchParams.get("redirect") || "/dashboard";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result.ok) {
        toast.success("Login successful. Redirecting...");
        router.replace(redirect);
      } else {
        const message = result.error || "Login failed.";
        setErrorMessage(message);
        toast.error(message);
      }
    } catch {
      const message = "Something went wrong. Please try again.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="text-sm font-medium text-brand hover:underline">
            ← Back home
          </Link>
          {/* <ModeToggle /> */}
        </div>

        <div className="rounded-2xl border border-border bg-card p-7 shadow-[0_30px_80px_rgba(48,73,68,.1)]">
          <div className="mb-6 text-center">
            <div className="mb-2 grid size-11 mx-auto place-items-center rounded-xl bg-accent text-accent-foreground">
              <LockKeyhole size={20} />
            </div>
            <p className="text-[.68rem] font-bold tracking-[.12em] text-brand uppercase">
              Admin portal
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to manage your visitor desk.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-xs font-bold text-foreground/80" htmlFor="email">
                Email address
              </label>
              <div className="flex min-h-12 items-center gap-2.5 rounded-xl border border-input bg-background px-4 transition focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/20">
                <Mail size={18} className="text-muted-foreground" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-xs font-bold text-foreground/80" htmlFor="password">
                Password
              </label>
              <div className="flex min-h-12 items-center gap-2.5 rounded-xl border border-input bg-background px-4 transition focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/20">
                <LockKeyhole size={18} className="text-muted-foreground" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="min-h-7 text-xs text-destructive" aria-live="polite">
                {errorMessage}
              </div>
              <Link href="/auth/forgot-password" className="text-xs font-medium text-brand hover:underline whitespace-nowrap">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground transition hover:not-disabled:-translate-y-0.5 hover:not-disabled:bg-primary/90 disabled:cursor-wait disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:border-ring hover:shadow-md"
          >
            <svg className="size-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Don&rsquo;t have an account?{" "}
            <Link href="/auth/register" className="font-semibold text-brand hover:underline">
              Create organization
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
