"use client";

import { FormEvent, useState, useSyncExternalStore } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { QRCodeSVG } from "qrcode.react";
import FullscreenButton from "@/components/common/Fullscreen";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ScanLine,
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
import { ModeToggle } from "@/components/common/Toggle";


const errorMessages: Record<string, string> = {
  "auth/invalid-credential": "That email or password doesn't look right.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
};

const subscribeToOrigin = () => () => undefined;
const getRegistrationUrl = () => `${window.location.origin}/register`;
const getServerRegistrationUrl = () => "/register";

const HomeLayoutPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const registrationUrl = useSyncExternalStore(
    subscribeToOrigin,
    getRegistrationUrl,
    getServerRegistrationUrl,
  );

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
    <main className="relative isolate min-h-svh overflow-hidden bg-background text-foreground">
      <Dialog open={isLoginOpen} onOpenChange={handleLoginOpenChange}>
        <header className="absolute top-0 left-0 z-10 flex w-full items-center justify-between gap-4 px-[clamp(1.5rem,4.5vw,4.5rem)] py-5 motion-safe:animate-[visitor-reveal_.65s_ease-out_both] max-[620px]:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="grid size-10 shrink-0 place-items-center rounded-[.85rem] bg-brand-gold text-brand-foreground shadow-[0_8px_20px_rgba(27,107,97,.22)]"
              aria-hidden="true"
            >
              <UserRoundCheck size={21} strokeWidth={2.3} />
            </div>
            <div className="min-w-0">
              <p className="m-0 text-[.96rem] font-bold tracking-[-.02em]">
                Visitor Log
              </p>
              <p className="mt-px truncate text-[.68rem] tracking-[.09em] text-muted-foreground uppercase max-[480px]:hidden">
                Your digital welcome desk
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* FullScreen */}
            <ModeToggle />
            <FullscreenButton />
            <DialogTrigger asChild>
              <button
                type="button"
                className="flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-card/90 px-4 text-[.78rem] font-bold text-brand shadow-[0_8px_22px_rgba(27,107,97,.1)] backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-ring hover:bg-accent hover:shadow-[0_12px_26px_rgba(27,107,97,.15)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring/40 max-[480px]:px-3"
              >
                <LockKeyhole size={16} aria-hidden="true" />
                <span>Sign in</span>
              </button>
            </DialogTrigger>
          </div>
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
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
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

      <div className="grid min-h-svh grid-cols-[minmax(0,1.12fr)_minmax(22rem,.72fr)] max-[980px]:grid-cols-1">
        <section
          className="flex min-w-0 flex-col justify-center pt-[7.5rem] pr-[clamp(3rem,7vw,7.5rem)] pb-16 pl-[clamp(1.5rem,6vw,6rem)] max-[980px]:min-h-[37rem] max-[980px]:pr-[clamp(1.5rem,8vw,5rem)] max-[980px]:pb-12 max-[620px]:min-h-0 max-[620px]:px-5 max-[620px]:pt-[6.6rem] max-[620px]:pb-9"
          aria-labelledby="welcome-heading"
        >
          <div className="w-full max-w-[42rem] motion-safe:animate-[visitor-reveal_.75s_.1s_ease-out_both]">
            <h1
              id="welcome-heading"
              className="m-0 max-w-[40rem] text-[clamp(3rem,5.2vw,5.65rem)] leading-[.96] font-bold tracking-[-.066em] text-balance max-[980px]:max-w-[45rem] max-[620px]:text-[clamp(2.65rem,13vw,4rem)]"
            >
              A warmer welcome
              <span className="text-brand-gold"> starts at the door.</span>
            </h1>

            <p className="mt-6 max-w-[35rem] text-[clamp(1rem,1.3vw,1.14rem)] leading-7 text-muted-foreground max-[620px]:mt-4 max-[620px]:text-[.94rem]">
              Give every guest a smooth arrival while your team stays informed,
              secure, and ready to say hello.
            </p>

            <div
              className="mt-6 flex flex-wrap gap-x-5 gap-y-3 max-[620px]:mt-5 max-[620px]:gap-2.5"
              aria-label="Platform benefits"
            >
              <div className="flex items-center gap-2 text-[.8rem] font-semibold text-muted-foreground max-[620px]:text-[.72rem]">
                <span className="grid size-5 place-items-center rounded-full bg-brand-gold text-background">
                  <Check size={14} />
                </span>
                Quick check-ins
              </div>
              <div className="flex items-center gap-2 text-[.8rem] font-semibold text-muted-foreground max-[620px]:text-[.72rem]">
                <span className="grid size-5 place-items-center rounded-full bg-brand-gold text-background">
                  <Check size={14} />
                </span>
                Real-time visibility
              </div>
              <div className="flex items-center gap-2 text-[.8rem] font-semibold text-muted-foreground max-[620px]:text-[.72rem]">
                <span className="grid size-5 place-items-center rounded-full bg-brand-gold text-background">
                  <Check size={14} />
                </span>
                Secure records
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-[0_13px_25px_rgba(33,150,243,.2)] transition hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_16px_30px_rgba(33,150,243,.28)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary/40"
              >
                Check in visitor <ArrowRight size={17} />
              </Link>
              <Link
                href="/logout"
                className="flex min-h-12 items-center justify-center rounded-xl border border-border bg-card px-5 text-sm font-bold text-brand shadow-[0_8px_22px_rgba(27,107,97,.08)] transition hover:-translate-y-0.5 hover:border-ring hover:bg-accent hover:shadow-[0_12px_26px_rgba(27,107,97,.14)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring/40"
              >
                Visitor sign out
              </Link>
            </div>
          </div>
          {/* signing option */}
        </section>

        <section className="mr-[clamp(1rem,4vw,4.5rem)] my-8 w-[calc(100%_-_clamp(2rem,5vw,5.5rem))] max-w-[38rem] self-center rounded-[1.7rem] border border-border bg-card/90 p-[clamp(1.5rem,3vw,3rem)] shadow-[0_32px_80px_rgba(48,73,68,.13),0_3px_10px_rgba(48,73,68,.05)] backdrop-blur-3xl motion-safe:animate-[visitor-panel_.8s_.12s_cubic-bezier(.22,1,.36,1)_both] max-[980px]:mx-auto max-[980px]:mt-0 max-[980px]:mb-12 max-[980px]:w-[min(calc(100%_-_3rem),38rem)] max-[980px]:max-w-none max-[620px]:mb-3 max-[620px]:w-[calc(100%_-_1.5rem)] max-[620px]:rounded-[1.25rem] max-[620px]:p-4">
          <a
            // href="/register"
            className="group relative block overflow-hidden rounded-[1.25rem] border border-border bg-card/90 p-5 shadow-[0_20px_45px_rgba(43,75,69,.11)] backdrop-blur-[15px] transition duration-300 hover:-translate-y-1 hover:shadow-[0_25px_50px_rgba(43,75,69,.16)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring/40 max-[620px]:p-3"
            aria-label="Open the visitor check-in form"
          >
            <span
              className="absolute top-3 right-3 grid size-7 place-items-center rounded-full bg-accent text-accent-foreground transition group-hover:scale-110"
              aria-hidden="true"
            >
              <ScanLine size={15} />
            </span>
            <div className="mx-auto grid aspect-square w-[min(24rem,100%)] place-items-center rounded-2xl border border-border bg-background p-4 max-[620px]:p-3">
              <QRCodeSVG
                value={registrationUrl}
                size={352}
                level="M"
                bgColor="var(--background)"
                fgColor="var(--foreground)"
                className="size-full"
                title="Visitor registration QR code"
              />
            </div>
            <div className="mt-4">
              <strong className="block text-center text-xl tracking-[-.025em] text-foreground">
                Scan to check in
              </strong>
            </div>
          </a>
        </section>
      </div>
    </main>
  );
};

export default HomeLayoutPage;
