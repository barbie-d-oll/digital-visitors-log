import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { SmsStatus } from "./types";

type RegistrationSuccessProps = {
  organizationSlug: string;
  secondsUntilHome: number;
  smsStatus: SmsStatus;
  visitorCode: string;
};

export function RegistrationSuccess({
  organizationSlug,
  secondsUntilHome,
  smsStatus,
  visitorCode,
}: RegistrationSuccessProps) {
  return (
    <div
      className="flex min-h-[30rem] flex-col items-center justify-center text-center"
      aria-live="polite"
    >
      <span className="grid size-20 place-items-center rounded-full bg-brand-gold text-background shadow-enterprise-md">
        <CheckCircle2 size={38} strokeWidth={1.8} />
      </span>
      <p className="mt-7 text-[.7rem] font-bold tracking-[.12em] text-brand uppercase">
        Registration received
      </p>
      <h2 className="mt-2 text-3xl font-bold tracking-normal">
        You&rsquo;re all set
      </h2>
      <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
        Please have a seat or let the front desk know. Your host will be
        notified of your arrival.
      </p>

      <div className="mt-6 w-full max-w-xs rounded-xl border border-border bg-background p-5 shadow-enterprise-sm">
        <p className="text-[.68rem] font-bold tracking-[.12em] text-brand uppercase">
          Your sign-out code
        </p>
        <p className="mt-2 font-mono text-4xl font-black tracking-[.18em] text-foreground">
          {visitorCode}
        </p>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Keep this code. You&rsquo;ll enter it on the logout page when you are
          leaving.
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
          Your check-in was saved, but the SMS could not be sent. Please keep
          the code shown here.
        </p>
      )}

      <Button asChild variant="outline" className="mt-8 h-12 rounded-xl px-5 font-bold">
        <Link href={`/kiosk/${organizationSlug}`}>Check in another visitor</Link>
      </Button>
    </div>
  );
}
