"use client";

import { FormEvent, Suspense, useState } from "react";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import {
  AuthShell,
  AuthHeader,
  AuthInputField,
  AuthPasswordField,
  AuthError,
  AuthSubmitButton,
  AuthDivider,
  AuthGoogleButton,
  AuthFooterLink,
} from "@/app/_components/auth/AuthShell";

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
        if (result.isFirstLogin) {
          toast.success("Welcome aboard! 🎉", {
            description: "Your workspace is ready. We've sent a welcome guide to your email.",
            duration: 6000,
          });
        } else {
          toast.success("Login successful. Redirecting...");
        }
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
    if (redirect) params.set("redirect", redirect);
    window.location.href = `/api/auth/google?${params.toString()}`;
  };

  return (
    <AuthShell
      imageSrc="/images/auth-signin.jpg"
      imageAlt="Modern Reception Desk"
      heroHeading="A welcoming desk for every guest and team."
      heroBody="Streamline your lobby operations, notify hosts instantly on arrival, and maintain comprehensive, audit-ready compliance across all your sites."
      backHref="/"
      backLabel="Back to website"
    >
      <AuthHeader
        title="Sign In"
        description="Enter your email below to login to your account"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInputField
          id="email"
          label="Username or Email"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="Enter username or email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <AuthPasswordField
          id="password"
          label="Password"
          autoComplete="current-password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          labelSlot={
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-brand hover:underline"
            >
              Forgot your password?
            </Link>
          }
        />

        <AuthError message={visibleErrorMessage} />

        <AuthSubmitButton
          isLoading={isLoading}
          label="Log In"
          loadingLabel="Logging in..."
        />
      </form>

      <AuthDivider />
      <AuthGoogleButton onClick={handleGoogleLogin} />
      <AuthFooterLink
        prompt="Don&rsquo;t have an account?"
        href="/auth/register"
        linkLabel="Sign up"
      />
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
