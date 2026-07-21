"use client";

import { FormEvent, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  KeyRound,
  Loader2,
  LogOut,
  Phone,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { VisitorHeader } from "@/components/home/visitor-header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { db } from "@/lib/firebase";

type FirestoreTimestamp = {
  toDate: () => Date;
};

type FirestoreDate = Date | FirestoreTimestamp | string | null | undefined;

type VisitorRecord = {
  id: string;
  name: string;
  phone: string;
  company: string;
  purpose: string;
  staff: string;
  status: string;
  visitorCode: string;
  checkIn?: FirestoreDate;
};

const signedOutStatuses = new Set(["Signed Out", "Checked Out"]);

const getStringValue = (value: unknown) =>
  typeof value === "string" ? value : "";

const formatDateTime = (value: FirestoreDate) => {
  if (!value) {
    return "-";
  }

  if (value instanceof Date) {
    return value.toLocaleString();
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value.toDate === "function") {
    return value.toDate().toLocaleString();
  }

  return "-";
};

const getReadableValue = (value: string) => value.trim() || "-";

export default function VisitorLogoutPage() {
  const [code, setCode] = useState("");
  const [visitor, setVisitor] = useState<VisitorRecord | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dialogError, setDialogError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFindVisitor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      setErrorMessage("Please enter your visitor code.");
      return;
    }

    setErrorMessage("");
    setDialogError("");
    setSuccessMessage("");
    setIsSearching(true);

    try {
      const matchingVisitors = await getDocs(
        query(
          collection(db, "visitors"),
          where("visitorCode", "==", normalizedCode),
        ),
      );

      const activeVisitor = matchingVisitors.docs
        .map((visitorDoc) => {
          const data = visitorDoc.data();

          return {
            id: visitorDoc.id,
            name: getStringValue(data.name),
            phone: getStringValue(data.phone),
            company: getStringValue(data.company),
            purpose: getStringValue(data.purpose),
            staff: getStringValue(data.staff),
            status: getStringValue(data.status),
            visitorCode: getStringValue(data.visitorCode),
            checkIn: data.checkIn as FirestoreDate,
          };
        })
        .find((visitorRecord) => !signedOutStatuses.has(visitorRecord.status));

      if (!activeVisitor) {
        setErrorMessage(
          "We couldn't find an active visitor with that code. Please check the code or ask the front desk for help.",
        );
        return;
      }

      setVisitor(activeVisitor);
      setIsDialogOpen(true);
    } catch {
      setErrorMessage(
        "We couldn't look up your visitor record right now. Please ask the front desk for help.",
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleSignOut = async () => {
    if (!visitor) {
      return;
    }

    setDialogError("");
    setIsSigningOut(true);

    try {
      await updateDoc(doc(db, "visitors", visitor.id), {
        status: "Signed Out",
        checkOut: serverTimestamp(),
      });

      setSuccessMessage(
        `${getReadableValue(visitor.name)} has been signed out successfully.`,
      );
      setCode("");
      setVisitor(null);
      setIsDialogOpen(false);
    } catch {
      setDialogError(
        "We couldn't sign you out right now. Please ask the front desk for help.",
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);

    if (!open && !isSigningOut) {
      setDialogError("");
    }
  };

  return (
    <main className="relative isolate min-h-svh overflow-hidden bg-background text-foreground">
      <VisitorHeader />

      <div className="relative z-[1] mx-auto grid min-h-svh w-full max-w-[92rem] items-center gap-10 px-[clamp(1.5rem,4.5vw,4.5rem)] pt-28 pb-10 lg:grid-cols-[minmax(18rem,.82fr)_minmax(32rem,1.18fr)] lg:gap-[clamp(3rem,7vw,7rem)] max-[620px]:px-5 max-[620px]:pt-24">
        <section className="motion-safe:animate-[visitor-reveal_.7s_ease-out_both]">
          <Link
            href="/"
            className="mb-7 inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-xs font-bold text-brand shadow-[0_8px_22px_rgba(27,107,97,.08)] transition hover:-translate-y-0.5 hover:border-ring hover:bg-accent focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring/40"
          >
            <ArrowLeft size={16} />
            Back home
          </Link>

          <p className="text-[.72rem] font-bold tracking-[.14em] text-brand uppercase">
            Visitor logout
          </p>
          <h1 className="mt-2 max-w-xl text-[clamp(2.8rem,7vw,5.7rem)] leading-[.95] font-bold tracking-[-.065em] text-balance">
            Leaving the <span className="text-brand-gold">company?</span>
          </h1>
          <p className="mt-5 max-w-lg text-[.98rem] leading-7 text-muted-foreground sm:text-[1.05rem]">
            Enter the sign-out code you received after check-in. We&rsquo;ll
            show your visitor details for confirmation, then record your
            leaving time.
          </p>

          <div className="mt-8 flex max-w-md items-start gap-3 rounded-2xl border border-border bg-card p-4 text-muted-foreground shadow-[0_14px_35px_rgba(48,73,68,.07)]">
            <Clock3 className="mt-0.5 shrink-0 text-brand-gold" size={18} />
            <p className="text-xs leading-5">
              Your checkout time is captured only after you confirm the visitor
              details in the pop-up.
            </p>
          </div>
        </section>

        <section className="rounded-[1.6rem] border border-border bg-card/95 p-5 shadow-[0_30px_80px_rgba(48,73,68,.13)] backdrop-blur-3xl motion-safe:animate-[visitor-panel_.75s_.1s_cubic-bezier(.22,1,.36,1)_both] sm:p-8 lg:p-10">
          <div className="mb-7">
            <span className="grid size-14 place-items-center rounded-2xl bg-accent text-accent-foreground">
              <LogOut size={25} />
            </span>
            <p className="mt-5 text-[.7rem] font-bold tracking-[.12em] text-brand uppercase">
              Enter your code
            </p>
            <h2 className="mt-1 text-3xl font-bold tracking-[-.045em]">
              Sign out securely
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Your code uses your first letter, last letter, and a number from
              1-10.
            </p>
          </div>

          <form onSubmit={handleFindVisitor}>
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-foreground/80">
                Visitor code *
              </span>
              <span className="flex min-h-14 items-center gap-3 rounded-xl border border-input bg-background px-4 text-muted-foreground transition focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/20">
                <KeyRound size={18} />
                <input
                  className="min-w-0 flex-1 bg-transparent font-mono text-lg font-bold tracking-[.16em] text-foreground uppercase outline-none placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-muted-foreground"
                  name="visitorCode"
                  autoComplete="one-time-code"
                  placeholder="Example: KA7"
                  value={code}
                  onChange={(event) => setCode(event.target.value.toUpperCase())}
                  required
                />
              </span>
            </label>

            <div
              className="min-h-8 pt-2 text-xs text-destructive"
              aria-live="polite"
            >
              {errorMessage}
            </div>

            {successMessage ? (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-border bg-secondary p-4 text-secondary-foreground">
                <CheckCircle2 className="mt-0.5 shrink-0" size={19} />
                <p className="text-sm leading-6">{successMessage}</p>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSearching}
              className="flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-[0_13px_25px_rgba(33,150,243,.24)] transition hover:not-disabled:-translate-y-0.5 hover:not-disabled:bg-primary/90 hover:not-disabled:shadow-[0_16px_30px_rgba(33,150,243,.3)] disabled:cursor-wait disabled:opacity-70 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary/40"
            >
              {isSearching ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Checking code...
                </>
              ) : (
                <>
                  Find my details <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </section>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-h-[calc(100svh-2rem)] w-[min(calc(100%-2rem),33rem)] max-w-[33rem] gap-0 overflow-y-auto rounded-[1.5rem] border border-border bg-popover p-0 text-popover-foreground shadow-[0_35px_90px_rgba(24,59,56,.28)] ring-0">
          <div className="p-7 max-[520px]:p-5">
            <DialogHeader className="pr-9 text-left">
              <div
                className="mb-1 grid size-11 place-items-center rounded-[.9rem] bg-accent text-accent-foreground"
                aria-hidden="true"
              >
                <UserRound size={20} />
              </div>
              <p className="m-0 text-[.68rem] font-bold tracking-[.12em] text-brand uppercase">
                Confirm visitor
              </p>
              <DialogTitle className="text-[2rem] leading-tight font-bold tracking-[-.05em] text-foreground">
                Are these your details?
              </DialogTitle>
              <DialogDescription className="text-[.86rem] leading-6 text-muted-foreground">
                Confirm before signing out so the leaving time is recorded on
                the correct visitor record.
              </DialogDescription>
            </DialogHeader>

            {visitor ? (
              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-[.65rem] font-bold tracking-[.12em] text-muted-foreground uppercase">
                    Visitor code
                  </p>
                  <p className="mt-1 font-mono text-2xl font-black tracking-[.16em] text-foreground">
                    {visitor.visitorCode}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <UserRound className="mb-3 text-brand" size={18} />
                    <p className="text-[.65rem] font-bold tracking-[.12em] text-muted-foreground uppercase">
                      Name
                    </p>
                    <p className="mt-1 text-sm font-bold text-foreground">
                      {getReadableValue(visitor.name)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-background p-4">
                    <Phone className="mb-3 text-brand" size={18} />
                    <p className="text-[.65rem] font-bold tracking-[.12em] text-muted-foreground uppercase">
                      Phone
                    </p>
                    <p className="mt-1 text-sm font-bold text-foreground">
                      {getReadableValue(visitor.phone)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-background p-4">
                    <Building2 className="mb-3 text-brand" size={18} />
                    <p className="text-[.65rem] font-bold tracking-[.12em] text-muted-foreground uppercase">
                      Company
                    </p>
                    <p className="mt-1 text-sm font-bold text-foreground">
                      {getReadableValue(visitor.company)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-background p-4">
                    <Clock3 className="mb-3 text-brand" size={18} />
                    <p className="text-[.65rem] font-bold tracking-[.12em] text-muted-foreground uppercase">
                      Time in
                    </p>
                    <p className="mt-1 text-sm font-bold text-foreground">
                      {formatDateTime(visitor.checkIn)}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-[.65rem] font-bold tracking-[.12em] text-muted-foreground uppercase">
                    Visit
                  </p>
                  <p className="mt-1 text-sm font-bold text-foreground">
                    {getReadableValue(visitor.purpose)} with{" "}
                    {getReadableValue(visitor.staff)}
                  </p>
                </div>
              </div>
            ) : null}

            <div
              className="min-h-7 pt-3 text-xs text-destructive"
              aria-live="polite"
            >
              {dialogError}
            </div>

            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="min-h-12 cursor-pointer rounded-xl border border-border bg-card px-5 text-sm font-bold text-brand transition hover:-translate-y-0.5 hover:border-ring hover:bg-accent hover:shadow-md focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring/40"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSigningOut}
              >
                Not me
              </button>
              <button
                type="button"
                className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-[0_13px_25px_rgba(33,150,243,.24)] transition hover:not-disabled:-translate-y-0.5 hover:not-disabled:bg-primary/90 hover:not-disabled:shadow-[0_16px_30px_rgba(33,150,243,.3)] disabled:cursor-wait disabled:opacity-70 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary/40"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Signing out...
                  </>
                ) : (
                  <>
                    Confirm sign out <LogOut size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
