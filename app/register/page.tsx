"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  Phone,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { VisitorHeader } from "@/components/home/visitor-header";
import { db } from "@/lib/firebase";

type VisitorForm = {
  name: string;
  phone: string;
  company: string;
  purpose: string;
  staff: string;
};

type SmsStatus = "idle" | "sent" | "failed";

const emptyForm: VisitorForm = {
  name: "",
  phone: "",
  company: "",
  purpose: "",
  staff: "",
};

const defaultReturnHomeSeconds = 15;
const failedSmsReturnHomeSeconds = 30;
const signedOutStatuses = new Set(["Signed Out", "Checked Out"]);

const getCodeLetters = (name: string) => {
  const letters = name.replace(/[^a-z]/gi, "");
  const firstLetter = letters.at(0)?.toUpperCase() ?? "V";
  const lastLetter = letters.at(-1)?.toUpperCase() ?? firstLetter;

  return `${firstLetter}${lastLetter}`;
};

const getShuffledNumbers = () => {
  const numbers = Array.from({ length: 10 }, (_, index) => index + 1);

  for (let index = numbers.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [numbers[index], numbers[randomIndex]] = [
      numbers[randomIndex],
      numbers[index],
    ];
  }

  return numbers;
};

const generateVisitorCode = async (name: string) => {
  const codeLetters = getCodeLetters(name);

  for (const number of getShuffledNumbers()) {
    const visitorCode = `${codeLetters}${number}`;
    const matchingVisitors = await getDocs(
      query(collection(db, "visitors"), where("visitorCode", "==", visitorCode)),
    );

    const codeIsInUse = matchingVisitors.docs.some((visitor) => {
      const status = String(visitor.data().status ?? "");

      return !signedOutStatuses.has(status);
    });

    if (!codeIsInUse) {
      return visitorCode;
    }
  }

  throw new Error("No available visitor code for these initials.");
};

const sendVisitorCodeSms = async ({
  name,
  phone,
  visitorCode,
}: {
  name: string;
  phone: string;
  visitorCode: string;
}) => {
  const response = await fetch("/api/sms/visitor-code", {
    body: JSON.stringify({ name, phone, visitorCode }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    throw new Error(data?.error ?? "SMS sending failed.");
  }
};

export default function PublicVisitorRegistrationPage() {
  const router = useRouter();
  const [form, setForm] = useState<VisitorForm>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [visitorCode, setVisitorCode] = useState("");
  const [smsStatus, setSmsStatus] = useState<SmsStatus>("idle");
  const [secondsUntilHome, setSecondsUntilHome] = useState(
    defaultReturnHomeSeconds,
  );

  const updateField = <K extends keyof VisitorForm>(
    field: K,
    value: VisitorForm[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  useEffect(() => {
    if (!isComplete) {
      return;
    }

    if (secondsUntilHome <= 0) {
      router.push("/");
      return;
    }

    const timerId = window.setTimeout(() => {
      setSecondsUntilHome((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [isComplete, router, secondsUntilHome]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSmsStatus("idle");
    setIsSubmitting(true);

    try {
      const name = form.name.trim();
      const phone = form.phone.trim();
      const generatedVisitorCode = await generateVisitorCode(name);
      let nextSmsStatus: SmsStatus = "idle";

      const visitorRef = await addDoc(collection(db, "visitors"), {
        name,
        phone,
        company: form.company.trim(),
        purpose: form.purpose,
        staff: form.staff.trim(),
        status: "Checked In",
        visitorCode: generatedVisitorCode,
        checkIn: serverTimestamp(),
        checkOut: null,
        smsStatus: "Pending",
      });

      try {
        await sendVisitorCodeSms({
          name,
          phone,
          visitorCode: generatedVisitorCode,
        });

        nextSmsStatus = "sent";
        setSmsStatus(nextSmsStatus);
        await updateDoc(visitorRef, {
          smsSentAt: serverTimestamp(),
          smsStatus: "Sent",
        }).catch((updateError) => {
          console.error("Error saving SMS status:", updateError);
        });
      } catch (smsError) {
        const smsErrorMessage =
          smsError instanceof Error ? smsError.message : "SMS sending failed.";

        nextSmsStatus = "failed";
        setSmsStatus(nextSmsStatus);
        await updateDoc(visitorRef, {
          smsError: smsErrorMessage,
          smsFailedAt: serverTimestamp(),
          smsStatus: "Failed",
        }).catch((updateError) => {
          console.error("Error saving SMS status:", updateError);
        });
      }

      setForm(emptyForm);
      setVisitorCode(generatedVisitorCode);
      setSecondsUntilHome(
        nextSmsStatus === "failed"
          ? failedSmsReturnHomeSeconds
          : defaultReturnHomeSeconds,
      );
      setIsComplete(true);
    } catch (error) {
      const message =
        error instanceof Error && error.message.includes("No available")
          ? "We couldn't create a unique sign-out code for those initials right now. Please ask the front desk for help."
          : "We couldn't complete your check-in. Please ask the front desk for help.";

      setErrorMessage(
        message,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative isolate min-h-svh overflow-hidden bg-background text-foreground">
      <VisitorHeader />

      <div className="relative z-[1] mx-auto grid min-h-svh w-full max-w-[92rem] items-center gap-10 px-[clamp(1.5rem,4.5vw,4.5rem)] pt-28 pb-10 lg:grid-cols-[minmax(18rem,.78fr)_minmax(34rem,1.22fr)] lg:gap-[clamp(3rem,7vw,7rem)] max-[620px]:px-5 max-[620px]:pt-24">
        <section className="motion-safe:animate-[visitor-reveal_.7s_ease-out_both]">
        
          <h1 className="max-w-xl text-[clamp(2.8rem,7vw,5.7rem)] leading-[.95] font-bold tracking-[-.065em] text-balance">
            Let&rsquo;s get you <span className="text-brand-gold">checked in.</span>
          </h1>
          <p className="mt-5 max-w-lg text-[.98rem] leading-7 text-muted-foreground sm:text-[1.05rem]">
            Share a few details and we&rsquo;ll let your host know you&rsquo;ve arrived. It only takes a minute.
          </p>

          <div className="mt-8 flex max-w-md items-start gap-3 rounded-2xl border border-border bg-card p-4 text-muted-foreground shadow-[0_14px_35px_rgba(48,73,68,.07)]">
            <LockKeyhole className="mt-0.5 shrink-0 text-brand-gold" size={18} />
            <p className="text-xs leading-5">
              Your details are used only to manage your visit and keep the workplace secure.
            </p>
          </div>
        </section>

        <section className="rounded-[1.6rem] border border-border bg-card/95 p-5 shadow-[0_30px_80px_rgba(48,73,68,.13)] backdrop-blur-3xl motion-safe:animate-[visitor-panel_.75s_.1s_cubic-bezier(.22,1,.36,1)_both] sm:p-8 lg:p-10">
          {isComplete ? (
            <div className="flex min-h-[30rem] flex-col items-center justify-center text-center" aria-live="polite">
              <span className="grid size-20 place-items-center rounded-full bg-brand-gold text-background shadow-[0_14px_30px_rgba(213,180,0,.22)] motion-safe:animate-[visitor-success_.55s_cubic-bezier(.22,1,.36,1)_both]">
                <CheckCircle2 size={38} strokeWidth={1.8} />
              </span>
              <p className="mt-7 text-[.7rem] font-bold tracking-[.12em] text-brand uppercase">Registration received</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-.045em]">You&rsquo;re all set</h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                Please have a seat or let the front desk know. Your host will be notified of your arrival.
              </p>
              <div className="mt-6 w-full max-w-xs rounded-2xl border border-border bg-background p-5 shadow-[0_14px_35px_rgba(48,73,68,.08)]">
                <p className="text-[.68rem] font-bold tracking-[.12em] text-brand uppercase">
                  Your sign-out code
                </p>
                <p className="mt-2 font-mono text-4xl font-black tracking-[.18em] text-foreground">
                  {visitorCode}
                </p>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  Keep this code. You&rsquo;ll enter it on the logout page when you are leaving the company.
                </p>
                <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-xs font-semibold text-secondary-foreground">
                  This screen will automatically go off in{" "}
                  <span className="font-black">{secondsUntilHome}</span>{" "}
                  seconds.
                </p>
                 
              </div>
              {smsStatus === "sent" ? (
                <p className="mt-4 max-w-sm rounded-xl border border-border bg-secondary px-4 py-3 text-xs font-semibold text-secondary-foreground">
                  We also sent this code to your phone number by SMS.
                </p>
              ) : null}
              {smsStatus === "failed" ? (
                <p className="mt-4 max-w-sm rounded-xl border border-brand-gold/40 bg-accent px-4 py-3 text-xs font-semibold text-accent-foreground">
                  Your check-in was saved, but the SMS could not be sent. Please keep the code shown here.
                </p>
              ) : null}
              <Link
                href="/"
                className="mt-8 cursor-pointer rounded-xl border border-border bg-card px-5 py-3 text-xs font-bold text-brand transition hover:-translate-y-0.5 hover:border-ring hover:bg-accent hover:shadow-md focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring/40"
              >
                Check in another visitor
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <p className="text-[.7rem] font-bold tracking-[.12em] text-brand uppercase">Visitor details</p>
                <h2 className="mt-1 text-3xl font-bold tracking-[-.045em]">Tell us about your visit</h2>
                <p className="mt-2 text-sm text-muted-foreground">All fields marked with * are required.</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="mb-2 block text-xs font-bold text-foreground/80">Full name *</span>
                    <span className="flex min-h-13 items-center gap-3 rounded-xl border border-input bg-background px-4 text-muted-foreground transition focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/20">
                      <UserRound size={18} />
                      <input className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" name="name" autoComplete="name" placeholder="Your full name" value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
                    </span>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-foreground/80">Phone number *</span>
                    <span className="flex min-h-13 items-center gap-3 rounded-xl border border-input bg-background px-4 text-muted-foreground transition focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/20">
                      <Phone size={18} />
                      <input className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="Phone number" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} required />
                    </span>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-foreground/80">Company *</span>
                    <span className="flex min-h-13 items-center gap-3 rounded-xl border border-input bg-background px-4 text-muted-foreground transition focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/20">
                      <Building2 size={18} />
                      <input className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" name="company" autoComplete="organization" placeholder="Company name" value={form.company} onChange={(event) => updateField("company", event.target.value)} required />
                    </span>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-foreground/80">Purpose of visit *</span>
                    <select className="min-h-13 w-full appearance-none rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/20" name="purpose" value={form.purpose} onChange={(event) => updateField("purpose", event.target.value)} required>
                      <option value="" disabled>Select purpose</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Delivery">Delivery</option>
                      <option value="Interview">Interview</option>
                      <option value="Event">Event</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-foreground/80">Who are you visiting? *</span>
                    <input className="min-h-13 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-4 focus:ring-ring/20" name="staff" placeholder="Host's name" value={form.staff} onChange={(event) => updateField("staff", event.target.value)} required />
                  </label>
                </div>

                <div className="min-h-8 pt-2 text-xs text-destructive" aria-live="polite">{errorMessage}</div>

                <button type="submit" disabled={isSubmitting} className="flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-[0_13px_25px_rgba(33,150,243,.24)] transition hover:not-disabled:-translate-y-0.5 hover:not-disabled:bg-primary/90 hover:not-disabled:shadow-[0_16px_30px_rgba(33,150,243,.3)] disabled:cursor-wait disabled:opacity-70 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary/40">
                  {isSubmitting ? (
                    <><Loader2 className="animate-spin" size={18} /> Submitting...</>
                  ) : (
                    <>Complete check-in <ArrowRight size={18} /></>
                  )}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
