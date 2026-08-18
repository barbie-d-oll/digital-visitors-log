"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
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
import { useRouter, useSearchParams } from "next/navigation";

import { VisitorHeader } from "@/components/home/visitor-header";

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

export default function PublicVisitorRegistrationPage() {
  return (
    <Suspense>
      <RegistrationContent />
    </Suspense>
  );
}

function RegistrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Organization slug from URL — e.g. /register?org=acme-inc
  const organizationSlug = searchParams.get("org") || "default";

  const [form, setForm] = useState<VisitorForm>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [visitorCode, setVisitorCode] = useState("");
  const [smsStatus, setSmsStatus] = useState<SmsStatus>("idle");
  const [secondsUntilHome, setSecondsUntilHome] = useState(
    defaultReturnHomeSeconds
  );

  // Pre-registration code flow
  const [preRegCode, setPreRegCode] = useState("");
  const [showPreReg, setShowPreReg] = useState(false);
  const [preRegLoading, setPreRegLoading] = useState(false);

  // Returning visitor detection
  const [returningChecked, setReturningChecked] = useState(false);

  // NDA signing
  const [showNda, setShowNda] = useState(false);
  const [ndaText, setNdaText] = useState("");
  const [ndaSignature, setNdaSignature] = useState("");
  const [visitorId, setVisitorId] = useState("");

  // Staff & departments for the org
  const [staffList, setStaffList] = useState<{ id: string; name: string; position: string; department: string }[]>([]);
  const [departmentList, setDepartmentList] = useState<{ id: string; name: string }[]>([]);
  const [staffLoaded, setStaffLoaded] = useState(false);

  useEffect(() => {
    if (organizationSlug === "default") return;
    fetch(`/api/organization/public/staff?slug=${organizationSlug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.staff) setStaffList(data.staff);
        if (data.departments) setDepartmentList(data.departments);
      })
      .catch(() => {})
      .finally(() => setStaffLoaded(true));
  }, [organizationSlug]);

  const updateField = <K extends keyof VisitorForm>(
    field: K,
    value: VisitorForm[K]
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  // Check for returning visitor when phone is entered
  const checkReturningVisitor = async (phone: string) => {
    if (returningChecked || phone.length < 9) return;
    try {
      const res = await fetch("/api/visitors/returning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, organizationSlug }),
      });
      const data = await res.json();
      if (data.found && data.visitor) {
        setReturningChecked(true);
        setForm((current) => ({
          ...current,
          name: current.name || data.visitor.name || "",
          company: current.company || data.visitor.company || "",
          purpose: current.purpose || data.visitor.purpose || "",
          staff: current.staff || data.visitor.staff || "",
        }));
      }
    } catch { /* ignore */ }
  };

  // Pre-registration code check-in
  const handlePreRegCheckin = async () => {
    if (!preRegCode.trim()) return;
    setPreRegLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/appointments/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preRegCode: preRegCode.trim(),
          organizationSlug,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Invalid pre-registration code.");
        return;
      }

      setVisitorCode(data.visitor.visitorCode);
      setIsComplete(true);
    } catch {
      setErrorMessage("Something went wrong. Please try the full form.");
    } finally {
      setPreRegLoading(false);
    }
  };

  useEffect(() => {
    if (!isComplete) return;
    if (secondsUntilHome <= 0) {
      router.push(`/kiosk/${organizationSlug}`);
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

      if (!name || !phone || !form.purpose || !form.staff.trim()) {
        setErrorMessage("Please complete all required fields.");
        return;
      }

      // Register visitor via API
      const res = await fetch("/api/visitors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          company: form.company.trim(),
          purpose: form.purpose,
          staff: form.staff.trim(),
          organizationSlug,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(
          data.error || "We couldn't complete your check-in. Please ask the front desk for help."
        );
        return;
      }

      const generatedVisitorCode = data.visitor.visitorCode;
      setVisitorId(data.visitor.id);

      // Check if NDA is required
      if (data.requiresNda) {
        // Fetch org NDA text
        try {
          const orgRes = await fetch(`/api/organization/public?slug=${organizationSlug}`);
          const orgData = await orgRes.json();
          if (orgData.ndaText) {
            setNdaText(orgData.ndaText);
            setVisitorCode(generatedVisitorCode);
            setForm(emptyForm);
            setShowNda(true);
            return;
          }
        } catch { /* proceed without NDA */ }
      }

      // Try to send SMS
      let nextSmsStatus: SmsStatus = "idle";
      try {
        const smsRes = await fetch("/api/sms/visitor-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            phone,
            visitorCode: generatedVisitorCode,
            organizationSlug,
          }),
        });

        if (smsRes.ok) {
          nextSmsStatus = "sent";
          setSmsStatus("sent");
        } else {
          nextSmsStatus = "failed";
          setSmsStatus("failed");
        }
      } catch {
        nextSmsStatus = "failed";
        setSmsStatus("failed");
      }

      setForm(emptyForm);
      setVisitorCode(generatedVisitorCode);
      setSecondsUntilHome(
        nextSmsStatus === "failed" ? failedSmsReturnHomeSeconds : defaultReturnHomeSeconds
      );
      setIsComplete(true);
    } catch (error) {
      console.error("Visitor registration error:", error);
      setErrorMessage(
        "We couldn't complete your check-in. Please ask the front desk for help."
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
            Let&rsquo;s get you{" "}
            <span className="text-brand-gold">checked in.</span>
          </h1>
          <p className="mt-5 max-w-lg text-[.98rem] leading-7 text-muted-foreground sm:text-[1.05rem]">
            Share a few details and we&rsquo;ll let your host know you&rsquo;ve
            arrived. It only takes a minute.
          </p>
          <div className="mt-8 flex max-w-md items-start gap-3 rounded-2xl border border-border bg-card p-4 text-muted-foreground shadow-[0_14px_35px_rgba(48,73,68,.07)]">
            <LockKeyhole className="mt-0.5 shrink-0 text-brand-gold" size={18} />
            <p className="text-xs leading-5">
              Your details are used only to manage your visit and keep the workplace secure.
            </p>
          </div>
        </section>

        <section className="rounded-[1.6rem] border border-border bg-card/95 p-5 shadow-[0_30px_80px_rgba(48,73,68,.13)] backdrop-blur-3xl motion-safe:animate-[visitor-panel_.75s_.1s_cubic-bezier(.22,1,.36,1)_both] sm:p-8 lg:p-10">
          {showNda ? (
            <div className="flex min-h-[30rem] flex-col items-center justify-center">
              <div className="w-full max-w-md">
                <h2 className="text-2xl font-bold text-center tracking-tight">Visitor Agreement</h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  Please read and sign the agreement before proceeding.
                </p>

                <div className="mt-5 max-h-48 overflow-y-auto rounded-xl border border-border bg-background p-4 text-xs leading-5 text-muted-foreground">
                  {ndaText || "No agreement text configured."}
                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-xs font-bold text-foreground/80">
                    Type your full name to sign
                  </label>
                  <input
                    className="min-h-12 w-full rounded-xl border border-input bg-background px-4 font-mono text-sm text-foreground outline-none focus:border-ring focus:ring-4 focus:ring-ring/20"
                    placeholder="Your full name as signature"
                    value={ndaSignature}
                    onChange={(e) => setNdaSignature(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    if (!ndaSignature.trim()) return;
                    try {
                      await fetch("/api/nda/sign", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          visitorId,
                          visitorName: ndaSignature.trim(),
                          organizationSlug,
                          signature: ndaSignature.trim(),
                          signatureType: "typed",
                        }),
                      });
                    } catch { /* proceed anyway */ }
                    setShowNda(false);
                    setIsComplete(true);
                  }}
                  disabled={!ndaSignature.trim()}
                  className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                >
                  I agree &amp; sign
                </button>
              </div>
            </div>
          ) : isComplete ? (
            <div className="flex min-h-[30rem] flex-col items-center justify-center text-center" aria-live="polite">
              <span className="grid size-20 place-items-center rounded-full bg-brand-gold text-background shadow-[0_14px_30px_rgba(213,180,0,.22)]">
                <CheckCircle2 size={38} strokeWidth={1.8} />
              </span>
              <p className="mt-7 text-[.7rem] font-bold tracking-[.12em] text-brand uppercase">
                Registration received
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-.045em]">
                You&rsquo;re all set
              </h2>
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
                  Keep this code. You&rsquo;ll enter it on the logout page when you are leaving.
                </p>
                <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-xs font-semibold text-secondary-foreground">
                  This screen will automatically go off in{" "}
                  <span className="font-black">{secondsUntilHome}</span> seconds.
                </p>
              </div>
              {smsStatus === "sent" && (
                <p className="mt-4 max-w-sm rounded-xl border border-border bg-secondary px-4 py-3 text-xs font-semibold text-secondary-foreground">
                  We also sent this code to your phone number by SMS.
                </p>
              )}
              {smsStatus === "failed" && (
                <p className="mt-4 max-w-sm rounded-xl border border-brand-gold/40 bg-accent px-4 py-3 text-xs font-semibold text-accent-foreground">
                  Your check-in was saved, but the SMS could not be sent. Please keep the code shown here.
                </p>
              )}
              <Link
                href={`/kiosk/${organizationSlug}`}
                className="mt-8 cursor-pointer rounded-xl border border-border bg-card px-5 py-3 text-xs font-bold text-brand transition hover:-translate-y-0.5 hover:border-ring hover:bg-accent hover:shadow-md"
              >
                Check in another visitor
              </Link>
            </div>
          ) : (
            <>
              {/* Pre-registration code option */}
              <div className="mb-6 rounded-xl border border-border bg-secondary/50 p-4">
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => setShowPreReg(!showPreReg)}
                >
                  <p className="text-sm font-semibold text-foreground">
                    Have a pre-registration code?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    If your host pre-registered you, enter your code for instant check-in.
                  </p>
                </button>

                {showPreReg && (
                  <div className="mt-3 flex gap-2">
                    <input
                      className="min-h-12 flex-1 rounded-xl border border-input bg-background px-4 font-mono text-sm font-bold tracking-wider uppercase text-foreground outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-muted-foreground focus:border-ring focus:ring-4 focus:ring-ring/20"
                      placeholder="PR-XXXXXX"
                      value={preRegCode}
                      onChange={(e) => setPreRegCode(e.target.value.toUpperCase())}
                    />
                    <button
                      type="button"
                      onClick={handlePreRegCheckin}
                      disabled={preRegLoading || !preRegCode.trim()}
                      className="min-h-12 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                    >
                      {preRegLoading ? "Checking..." : "Check In"}
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-7">
                <p className="text-[.7rem] font-bold tracking-[.12em] text-brand uppercase">
                  Visitor details
                </p>
                <h2 className="mt-1 text-3xl font-bold tracking-[-.045em]">
                  Tell us about your visit
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  All fields marked with * are required.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="mb-2 block text-xs font-bold text-foreground/80">Full name *</span>
                    <span className="flex min-h-13 items-center gap-3 rounded-xl border border-input bg-background px-4 text-muted-foreground">
                      <UserRound size={18} />
                      <input
                        className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                        name="name"
                        autoComplete="name"
                        placeholder="Your full name"
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        required
                      />
                    </span>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-foreground/80">Phone number *</span>
                    <span className="flex min-h-13 items-center gap-3 rounded-xl border border-input bg-background px-4 text-muted-foreground">
                      <Phone size={18} />
                      <input
                        className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="Phone number"
                        value={form.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        onBlur={(e) => checkReturningVisitor(e.target.value)}
                        required
                      />
                    </span>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-foreground/80">Company</span>
                    <span className="flex min-h-13 items-center gap-3 rounded-xl border border-input bg-background px-4 text-muted-foreground transition focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/20">
                      <Building2 size={18} />
                      <input
                        className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                        name="company"
                        autoComplete="organization"
                        placeholder="Company name"
                        value={form.company}
                        onChange={(e) => updateField("company", e.target.value)}
                      />
                    </span>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-foreground/80">Purpose of visit *</span>
                    <select
                      className="min-h-13 w-full appearance-none rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none"
                      name="purpose"
                      value={form.purpose}
                      onChange={(e) => updateField("purpose", e.target.value)}
                      required
                    >
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
                    {staffList.length > 0 ? (
                      <select
                        className="min-h-13 w-full appearance-none rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none"
                        name="staff"
                        value={form.staff}
                        onChange={(e) => updateField("staff", e.target.value)}
                        required
                      >
                        <option value="" disabled>Select staff member</option>
                        {staffList.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name}{s.department ? ` — ${s.department}` : ""}{s.position ? ` (${s.position})` : ""}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="min-h-13 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                        name="staff"
                        placeholder="Host's name"
                        value={form.staff}
                        onChange={(e) => updateField("staff", e.target.value)}
                        required
                      />
                    )}
                  </label>
                </div>

                <div className="min-h-8 pt-2 text-xs text-destructive" aria-live="polite">
                  {errorMessage}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-[0_13px_25px_rgba(33,150,243,.24)] transition hover:not-disabled:-translate-y-0.5 hover:not-disabled:bg-primary/90 disabled:cursor-wait disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Complete check-in
                      <ArrowRight size={18} />
                    </>
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
