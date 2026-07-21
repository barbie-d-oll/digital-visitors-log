"use client";

import { FormEvent, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRoundCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { auth } from "@/lib/firebase";

const errorMessages: Record<string, string> = {
  "auth/invalid-credential": "That email or password doesn't look right.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
};

export function VisitorHeader() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsLoginOpen(false);
      router.push("/dashboard");
    } catch (error: unknown) {
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? String(error.code)
          : "";

      setErrorMessage(
        errorMessages[code] ?? "We couldn't sign you in. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginOpenChange = (open: boolean) => {
    setIsLoginOpen(open);

    if (!open) {
      setErrorMessage("");
      setPassword("");
      setShowPassword(false);
    }
  };

  return (
    <Dialog open={isLoginOpen} onOpenChange={handleLoginOpenChange}>
      <header className="absolute top-0 left-0 z-10 flex w-full items-center justify-between gap-4 px-[clamp(1.5rem,4.5vw,4.5rem)] py-5 motion-safe:animate-[visitor-reveal_.65s_ease-out_both] max-[620px]:p-5">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring/40"
          aria-label="Visitor Log home"
        >
          <span
            className="grid size-10 shrink-0 place-items-center rounded-[.85rem] bg-brand-gold text-brand-foreground shadow-[0_8px_20px_rgba(27,107,97,.22)]"
            aria-hidden="true"
          >
            <UserRoundCheck size={21} strokeWidth={2.3} />
          </span>
          <span className="min-w-0">
            <strong className="block text-[.96rem] font-bold tracking-[-.02em]">
              Visitor Log
            </strong>
            <small className="mt-px block truncate text-[.68rem] tracking-[.09em] text-muted-foreground uppercase max-[480px]:hidden">
              Your digital welcome desk
            </small>
          </span>
        </Link>

        <DialogTrigger asChild>
          <button
            type="button"
            className="flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-card/90 px-4 text-[.78rem] font-bold text-brand shadow-[0_8px_22px_rgba(27,107,97,.1)] backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-ring hover:bg-accent hover:shadow-[0_12px_26px_rgba(27,107,97,.15)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring/40 max-[480px]:px-3"
          >
            <LockKeyhole size={16} aria-hidden="true" />
            <span>Sign in</span>
          </button>
        </DialogTrigger>
      </header>

      <DialogContent className="max-h-[calc(100svh-2rem)] w-[min(calc(100%-2rem),29rem)] max-w-[29rem] gap-0 overflow-y-auto rounded-[1.5rem] border border-border bg-popover p-0 text-popover-foreground shadow-[0_35px_90px_rgba(24,59,56,.28)] ring-0">
        <div className="p-7 max-[520px]:p-5">
          <DialogHeader className="pr-9 text-left">
            <div
              className="mb-1 grid size-11 place-items-center rounded-[.9rem] bg-accent text-accent-foreground"
              aria-hidden="true"
            >
              <LockKeyhole size={20} />
            </div>
            <p className="m-0 text-[.68rem] font-bold tracking-[.12em] text-brand uppercase">
              Admin portal
            </p>
            <DialogTitle className="text-[2rem] leading-tight font-bold tracking-[-.05em] text-foreground">
              Welcome back
            </DialogTitle>
            <DialogDescription className="text-[.86rem] leading-6 text-muted-foreground">
              Sign in to see who is here and manage visitor activity.
            </DialogDescription>
          </DialogHeader>

          <form className="mt-6" onSubmit={handleLogin}>
            <div>
              <label
                className="mb-2 block text-xs font-bold text-foreground/80"
                htmlFor="admin-email"
              >
                Email address
              </label>
              <div className="flex min-h-13 items-center gap-2.5 rounded-[.8rem] border border-input bg-background px-4 text-muted-foreground transition duration-200 focus-within:-translate-y-px focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/20">
                <Mail size={18} aria-hidden="true" />
                <input
                  className="min-w-0 flex-1 border-0 bg-transparent text-[.84rem] text-foreground outline-none placeholder:text-muted-foreground"
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label
                className="mb-2 block text-xs font-bold text-foreground/80"
                htmlFor="admin-password"
              >
                Password
              </label>
              <div className="flex min-h-13 items-center gap-2.5 rounded-[.8rem] border border-input bg-background px-4 text-muted-foreground transition duration-200 focus-within:-translate-y-px focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/20">
                <LockKeyhole size={18} aria-hidden="true" />
                <input
                  className="min-w-0 flex-1 border-0 bg-transparent text-[.84rem] text-foreground outline-none placeholder:text-muted-foreground"
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg border-0 bg-transparent text-muted-foreground transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring/40"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div
              className="min-h-7 pt-2 text-xs text-destructive"
              aria-live="polite"
            >
              {errorMessage}
            </div>

            <button
              type="submit"
              className="flex min-h-[3.35rem] w-full cursor-pointer items-center justify-center gap-2 rounded-[.85rem] border-0 bg-primary text-[.84rem] font-bold text-primary-foreground transition duration-200 hover:not-disabled:-translate-y-0.5 hover:not-disabled:bg-primary/90 hover:not-disabled:shadow-[0_16px_30px_rgba(27,107,97,.29)] active:not-disabled:translate-y-0 disabled:cursor-wait disabled:opacity-75 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring/40"
              disabled={isLoading}
            >
              <span>
                {isLoading ? "Signing you in..." : "Sign in to dashboard"}
              </span>
              {isLoading ? (
                <span
                  className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white"
                  aria-hidden="true"
                />
              ) : (
                <ArrowRight size={18} aria-hidden="true" />
              )}
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
