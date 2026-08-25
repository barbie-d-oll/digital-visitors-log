import { LockKeyhole } from "lucide-react";

export function RegistrationHero() {
  return (
    <section className="motion-safe:animate-[visitor-reveal_.7s_ease-out_both]">
      <h1 className="max-w-xl text-[clamp(2.8rem,7vw,5.7rem)] leading-[.95] font-bold tracking-normal text-balance">
        Let&rsquo;s get you <span className="text-brand-gold">checked in.</span>
      </h1>
      <p className="mt-5 max-w-lg text-[.98rem] leading-7 text-muted-foreground sm:text-[1.05rem]">
        Share a few details and we&rsquo;ll let your host know you&rsquo;ve
        arrived. It only takes a minute.
      </p>
      <div className="mt-8 flex max-w-md items-start gap-3 rounded-xl border border-border bg-card p-4 text-muted-foreground shadow-enterprise-sm">
        <LockKeyhole className="mt-0.5 shrink-0 text-brand-gold" size={18} />
        <p className="text-xs leading-5">
          Your details are used only to manage your visit and keep the workplace
          secure.
        </p>
      </div>
    </section>
  );
}
