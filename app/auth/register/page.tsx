"use client";

import { FormEvent, useState } from "react";
import { Building2, Mail, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, organizationName }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message = data.error || "Registration failed.";
        setErrorMessage(message);
        toast.error(message);
        return;
      }

      toast.success("Registration successful. Please log in to continue.");
      router.replace("/auth/login");
    } catch {
      const message = "Something went wrong. Please try again.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      imageSrc="/images/auth-register.jpg"
      imageAlt="Team Collaboration and Partnership"
      heroHeading="Build trust from the very first greeting."
      heroBody="Set up your organization's reception desk in under 3 minutes. Invite hosts, customize your brand colors, and deliver a 5-star welcome experience to every client, partner, and visitor."
      backHref="/"
      backLabel="Back to website"
    >
      <AuthHeader
        title="Create your organization"
        description="Set up your workspace and start managing visitors with ease."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInputField
          id="name"
          label="Your full name"
          icon={UserRound}
          type="text"
          autoComplete="name"
          placeholder="e.g. Alex Morgan"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <AuthInputField
          id="org-name"
          label="Organization / Company name"
          icon={Building2}
          type="text"
          autoComplete="organization"
          placeholder="e.g. Acme Corporation"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          required
        />

        <AuthInputField
          id="reg-email"
          label="Work email address"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <AuthPasswordField
          id="reg-password"
          label="Password"
          autoComplete="new-password"
          placeholder="Minimum 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        <AuthError message={errorMessage} />

        <AuthSubmitButton
          isLoading={isLoading}
          label="Create organization"
          loadingLabel="Creating organization..."
        />
      </form>

      <AuthDivider />
      <AuthGoogleButton onClick={() => { window.location.href = "/api/auth/google"; }} />
      <AuthFooterLink
        prompt="Already have an organization?"
        href="/auth/login"
        linkLabel="Sign in"
      />
    </AuthShell>
  );
}
