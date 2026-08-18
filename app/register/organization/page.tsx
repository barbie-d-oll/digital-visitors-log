"use client";

import React, { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Eye, EyeOff, Building2, Mail, Lock, UserRound, Check } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import Image from "next/image";
import registerImage from '@/public/african-american-girl-sitting-cafe-with-mobile-phone-black-woman-having-rest.jpg'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OrganizationRegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !orgName.trim() || !email.trim() || !password) {
      setError("Please complete all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "organizations", uid), {
        fullName: fullName.trim(),
        name: orgName.trim(),
        email: email.trim().toLowerCase(),
        ownerUid: uid,
        createdAt: serverTimestamp(),
      });

      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Org signup error:", err);
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClassName =
    "mt-2 h-12 w-full rounded-xl border border-border bg-secondary/30   text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20";

  return (
    <main className="min-h-screen bg-background px-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] lg:grid-cols-[1.05fr_0.95fr] lg:min-h-[calc(100vh-2rem)]">
        <section className="relative flex h-[55vh] w-full items-center justify-center overflow-hidden lg:h-full">
          <div className="relative h-full w-full overflow-hidden">
            <Image
              src={registerImage}
              alt="dashboard-image"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-(--background)/20" />
          </div>
        </section>
        <section className="relative flex items-center justify-center bg-background px-6 py-8 sm:px-10 lg:px-12">
          <div className="w-full max-w-xl">
            <h1 className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl lg:text-[3rem]">
              Create your account
            </h1>

            <p className="mt-3 max-w-md text-base text-muted-foreground">
              Join us to simplify and secure your visitor management.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  <span className="mb-2 flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-brand" />
                    Full Name
                  </span>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Full Name"
                    className={fieldClassName}
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">
                  <span className="mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-brand" />
                    Email Address
                  </span>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Email Address"
                    className={fieldClassName}
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">
                  <span className="mb-2 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-brand" />
                    Organization Name
                  </span>
                  <Input
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                    placeholder="Organization Name"
                    className={fieldClassName}
                  />
                </label>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-foreground">
                  <span className="mb-2 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-brand" />
                    Password
                  </span>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Password"
                      className={`${fieldClassName} ${"pr-11!"}`}
                    />
                    <button
                      type="button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </label>

                <label className="block text-sm font-medium text-foreground">
                  <span className="mb-2 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-brand" />
                    Confirm Password
                  </span>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Confirm Password"
                      className={`${fieldClassName} ${"pr-11!"}`}
                    />
                    <button
                      type="button"
                      aria-label={
                        showConfirm ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowConfirm((s) => !s)}
                      className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition hover:text-foreground"
                    >
                      {showConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </label>
              </div>

              {error ? (
                <div className="text-sm text-destructive">{error}</div>
              ) : null}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 h-12 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-enterprise-md hover:bg-primary/90"
              >
                {isSubmitting ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login/organization"
                className="font-medium text-brand underline-offset-4 hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </section>

        
      </div>
    </main>
  );
}
