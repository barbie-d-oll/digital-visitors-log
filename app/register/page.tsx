"use client";

import { FormEvent, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
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

import { VisitorHeader } from "@/components/home/visitor-header";
import { db } from "@/lib/firebase";

type VisitorForm = {
  name: string;
  phone: string;
  company: string;
  purpose: string;
  staff: string;
};

const emptyForm: VisitorForm = {
  name: "",
  phone: "",
  company: "",
  purpose: "",
  staff: "",
};

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

export default function PublicVisitorRegistrationPage() {
  const [form, setForm] = useState<VisitorForm>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [visitorCode, setVisitorCode] = useState("");

  const updateField = <K extends keyof VisitorForm>(
    field: K,
    value: VisitorForm[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const generatedVisitorCode = await generateVisitorCode(form.name.trim());

      await addDoc(collection(db, "visitors"), {
        name: form.name.trim(),
        phone: form.phone.trim(),
        company: form.company.trim(),
        purpose: form.purpose,
        staff: form.staff.trim(),
        status: "Checked In",
        visitorCode: generatedVisitorCode,
        checkIn: serverTimestamp(),
        checkOut: null,
      });

      setForm(emptyForm);
      setVisitorCode(generatedVisitorCode);
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
    <main className="relative isolate min-h-svh overflow-hidden bg-white text-[#183b38]">
      <VisitorHeader />

      <div className="relative z-[1] mx-auto grid min-h-svh w-full max-w-[92rem] items-center gap-10 px-[clamp(1.5rem,4.5vw,4.5rem)] pt-28 pb-10 lg:grid-cols-[minmax(18rem,.78fr)_minmax(34rem,1.22fr)] lg:gap-[clamp(3rem,7vw,7rem)] max-[620px]:px-5 max-[620px]:pt-24">
        <section className="motion-safe:animate-[visitor-reveal_.7s_ease-out_both]">
        
          <h1 className="max-w-xl text-[clamp(2.8rem,7vw,5.7rem)] leading-[.95] font-bold tracking-[-.065em] text-balance">
            Let&rsquo;s get you <span className="text-[#FFD700]">checked in.</span>
          </h1>
          <p className="mt-5 max-w-lg text-[.98rem] leading-7 text-[#617773] sm:text-[1.05rem]">
            Share a few details and we&rsquo;ll let your host know you&rsquo;ve arrived. It only takes a minute.
          </p>

          <div className="mt-8 flex max-w-md items-start gap-3 rounded-2xl border border-[#20534c1a] bg-[#fffefb] p-4 text-[#526b67] shadow-[0_14px_35px_rgba(48,73,68,.07)]">
            <LockKeyhole className="mt-0.5 shrink-0 text-[#d5b400]" size={18} />
            <p className="text-xs leading-5">
              Your details are used only to manage your visit and keep the workplace secure.
            </p>
          </div>
        </section>

        <section className="rounded-[1.6rem] border border-[#20534c1a] bg-[#fffefbed] p-5 shadow-[0_30px_80px_rgba(48,73,68,.13)] backdrop-blur-3xl motion-safe:animate-[visitor-panel_.75s_.1s_cubic-bezier(.22,1,.36,1)_both] sm:p-8 lg:p-10">
          {isComplete ? (
            <div className="flex min-h-[30rem] flex-col items-center justify-center text-center" aria-live="polite">
              <span className="grid size-20 place-items-center rounded-full bg-[#FFD700] text-white shadow-[0_14px_30px_rgba(213,180,0,.22)] motion-safe:animate-[visitor-success_.55s_cubic-bezier(.22,1,.36,1)_both]">
                <CheckCircle2 size={38} strokeWidth={1.8} />
              </span>
              <p className="mt-7 text-[.7rem] font-bold tracking-[.12em] text-[#1b6b61] uppercase">Registration received</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-.045em]">You&rsquo;re all set</h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-[#617773]">
                Please have a seat or let the front desk know. Your host will be notified of your arrival.
              </p>
              <div className="mt-6 w-full max-w-xs rounded-2xl border border-[#1b6b6126] bg-white p-5 shadow-[0_14px_35px_rgba(48,73,68,.08)]">
                <p className="text-[.68rem] font-bold tracking-[.12em] text-[#1b6b61] uppercase">
                  Your sign-out code
                </p>
                <p className="mt-2 font-mono text-4xl font-black tracking-[.18em] text-[#183b38]">
                  {visitorCode}
                </p>
                <p className="mt-3 text-xs leading-5 text-[#617773]">
                  Keep this code. You&rsquo;ll enter it on the logout page when you are leaving the company.
                </p>
              </div>
              <Link
                href="/"
                className="mt-8 cursor-pointer rounded-xl border border-[#1b6b6130] bg-white px-5 py-3 text-xs font-bold text-[#1b6b61] transition hover:-translate-y-0.5 hover:border-[#1b6b61] hover:shadow-md focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#1b6b614d]"
              >
                Check in another visitor
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <p className="text-[.7rem] font-bold tracking-[.12em] text-[#1b6b61] uppercase">Visitor details</p>
                <h2 className="mt-1 text-3xl font-bold tracking-[-.045em]">Tell us about your visit</h2>
                <p className="mt-2 text-sm text-[#617773]">All fields marked with * are required.</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="mb-2 block text-xs font-bold text-[#36524e]">Full name *</span>
                    <span className="flex min-h-13 items-center gap-3 rounded-xl border border-[#d7dfdc] bg-white px-4 text-[#82918e] transition focus-within:border-[#1b6b61] focus-within:ring-4 focus-within:ring-[#1b6b611c]">
                      <UserRound size={18} />
                      <input className="min-w-0 flex-1 bg-transparent text-sm text-[#183b38] outline-none placeholder:text-[#a3aeac]" name="name" autoComplete="name" placeholder="Your full name" value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
                    </span>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-[#36524e]">Phone number *</span>
                    <span className="flex min-h-13 items-center gap-3 rounded-xl border border-[#d7dfdc] bg-white px-4 text-[#82918e] transition focus-within:border-[#1b6b61] focus-within:ring-4 focus-within:ring-[#1b6b611c]">
                      <Phone size={18} />
                      <input className="min-w-0 flex-1 bg-transparent text-sm text-[#183b38] outline-none placeholder:text-[#a3aeac]" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="Phone number" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} required />
                    </span>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-[#36524e]">Company *</span>
                    <span className="flex min-h-13 items-center gap-3 rounded-xl border border-[#d7dfdc] bg-white px-4 text-[#82918e] transition focus-within:border-[#1b6b61] focus-within:ring-4 focus-within:ring-[#1b6b611c]">
                      <Building2 size={18} />
                      <input className="min-w-0 flex-1 bg-transparent text-sm text-[#183b38] outline-none placeholder:text-[#a3aeac]" name="company" autoComplete="organization" placeholder="Company name" value={form.company} onChange={(event) => updateField("company", event.target.value)} required />
                    </span>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-[#36524e]">Purpose of visit *</span>
                    <select className="min-h-13 w-full appearance-none rounded-xl border border-[#d7dfdc] bg-white px-4 text-sm text-[#183b38] outline-none transition focus:border-[#1b6b61] focus:ring-4 focus:ring-[#1b6b611c]" name="purpose" value={form.purpose} onChange={(event) => updateField("purpose", event.target.value)} required>
                      <option value="" disabled>Select purpose</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Delivery">Delivery</option>
                      <option value="Interview">Interview</option>
                      <option value="Event">Event</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-[#36524e]">Who are you visiting? *</span>
                    <input className="min-h-13 w-full rounded-xl border border-[#d7dfdc] bg-white px-4 text-sm text-[#183b38] outline-none transition placeholder:text-[#a3aeac] focus:border-[#1b6b61] focus:ring-4 focus:ring-[#1b6b611c]" name="staff" placeholder="Host's name" value={form.staff} onChange={(event) => updateField("staff", event.target.value)} required />
                  </label>
                </div>

                <div className="min-h-8 pt-2 text-xs text-[#b65345]" aria-live="polite">{errorMessage}</div>

                <button type="submit" disabled={isSubmitting} className="flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2196F3] px-5 text-sm font-bold text-white shadow-[0_13px_25px_rgba(33,150,243,.24)] transition hover:not-disabled:-translate-y-0.5 hover:not-disabled:bg-[#1976d2] hover:not-disabled:shadow-[0_16px_30px_rgba(33,150,243,.3)] disabled:cursor-wait disabled:opacity-70 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#2196F366]">
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
