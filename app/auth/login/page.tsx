"use client";

import { FormEvent, Suspense, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
 

function getOAuthErrorMessage(error: string | null) {
  switch (error) {
    case "google_not_configured":
      return "Google login is not configured yet. Please add valid Google OAuth credentials.";
    case "google_email_unverified":
      return "Your Google email must be verified before you can sign in.";
    case "oauth_failed":
      return "Google login failed. Please try again.";
    case "org_inactive":
      return "Your organization is inactive. Please contact an administrator.";
    case "no_code":
      return "Google did not return an authorization code. Please try again.";
    default:
      return "";
  }
}

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
  const oauthErrorMessage = getOAuthErrorMessage(searchParams.get("error"));
  const visibleErrorMessage = errorMessage || oauthErrorMessage;

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
    const params = new URLSearchParams();
    if (redirect) {
      params.set("redirect", redirect);
    }

    window.location.href = `/api/auth/google?${params.toString()}`;
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background">
      {/* LEFT COLUMN: Hero Image Banner */}
      <div className="relative hidden w-full lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-muted p-12 text-white select-none">
        {/* Background Image */}
        <Image
          src="/images/auth-signin.jpg"
          alt="Modern Reception Desk"
          fill
          className="object-cover object-center"
        />

        {/* Ambient Dark Gradient Overlay for Contrast */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/45 to-black/30 backdrop-blur-[0.5px]" />

        {/* Top Branding */}
        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-xl  px-4 py-2.5   border border-white/15 transition hover:bg-black/40"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Building2 className="size-5" />
            </span>
          </Link>
        </div>

        {/* Bottom Highlights & Testimonial Card */}
        <div className="relative z-10 max-w-lg space-y-4">
           

          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            A welcoming desk for every guest and team.
          </h2>

          <p className="text-sm leading-relaxed text-white/80">
            Streamline your lobby operations, notify hosts instantly on arrival,
            and maintain comprehensive, audit-ready compliance across all your sites.
          </p>

           
        </div>
      </div>

      {/* RIGHT COLUMN: Sign In Form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-between p-6 sm:p-10 lg:p-16 min-h-screen overflow-y-auto">
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> Back to website
          </Link>
        </div>

        {/* Centered Form Area */}
        <div className="mx-auto my-auto w-full max-w-md py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Sign In
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-foreground/80 mb-2"
              >
                Username or Email
              </label>
              <div className="flex min-h-11 items-center gap-2.5 rounded-xl border border-input bg-card px-3.5 transition focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20">
                <Mail className="size-4 text-muted-foreground shrink-0" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter username or email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                />
              </div>
            </div>

            {/* Password Field with Forgot Password Link */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-foreground/80"
                >
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-brand hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <div className="flex min-h-11 items-center gap-2.5 rounded-xl border border-input bg-card px-3.5 transition focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20">
                <LockKeyhole className="size-4 text-muted-foreground shrink-0" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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

            {/* Error Message */}
            {visibleErrorMessage && (
              <div
                className="rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive"
                aria-live="polite"
              >
                {visibleErrorMessage}
              </div>
            )}

            {/* Primary Log In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm transition hover:not-disabled:bg-primary/90 hover:not-disabled:-translate-y-0.5 active:translate-y-0 disabled:cursor-wait disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Logging in...
                </>
              ) : (
                <>
                  Log In <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          {/* OR Divider */}
          <div className="relative my-6 text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-3 font-bold uppercase tracking-wider text-muted-foreground">
              OR
            </span>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex min-h-11 w-full items-center justify-center gap-3 rounded-xl border border-input bg-card text-sm font-semibold text-foreground shadow-xs transition hover:bg-accent hover:border-ring hover:-translate-y-0.5"
          >
            <svg className="size-4.5" viewBox="0 0 24 24">
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

          {/* Switch Link */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don&rsquo;t have an account?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-brand hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-muted-foreground/75">
          &copy; {new Date().getFullYear()} Visitor Log. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
