"use client";

import { use, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ScanLine, UserRoundCheck } from "lucide-react";
import Link from "next/link";

import FullscreenButton from "@/components/common/Fullscreen";
import { ModeToggle } from "@/components/common/Toggle";

interface OrgInfo {
  name: string;
  branding?: {
    primaryColor?: string;
    logoUrl?: string;
  } | null;
}

export default function KioskPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [orgInfo, setOrgInfo] = useState<OrgInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [logoutUrl, setLogoutUrl] = useState("");

  useEffect(() => {
    setRegistrationUrl(`${window.location.origin}/register?org=${slug}`);
    setLogoutUrl(`${window.location.origin}/logout?org=${slug}`);

    fetch(`/api/organization/public?slug=${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setOrgInfo({ name: data.name, branding: data.branding });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <span className="size-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
      </div>
    );
  }

  return (
    <main className="relative flex min-h-svh flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-brand-gold text-brand-foreground">
            <UserRoundCheck size={20} strokeWidth={2.3} />
          </div>
          <div>
            <p className="text-sm font-bold">{orgInfo?.name || "Visitor Log"}</p>
            <p className="text-[.65rem] tracking-wide text-muted-foreground uppercase">
              Digital welcome desk
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ModeToggle />
          <FullscreenButton />
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-10">
        <div className="w-full max-w-md text-center">
          <div className="rounded-[1.5rem] border border-border bg-card p-6 shadow-[0_30px_80px_rgba(48,73,68,.12)] sm:p-8">
            <span className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-accent text-accent-foreground">
              <ScanLine size={22} />
            </span>

            <h1 className="text-2xl font-bold tracking-tight">Scan to check in</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Open your phone camera and point it at the QR code below.
            </p>

            {/* QR Code */}
            <div className="mx-auto mt-6 aspect-square w-[min(20rem,100%)] rounded-2xl border border-border bg-background p-4">
              {registrationUrl ? (
                <QRCodeSVG
                  value={registrationUrl}
                  size={352}
                  level="M"
                  bgColor="var(--background)"
                  fgColor="var(--foreground)"
                  className="size-full"
                  title={`Visitor registration for ${orgInfo?.name || slug}`}
                />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground text-sm">
                  Loading...
                </div>
              )}
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Or visit: <span className="font-mono font-semibold text-foreground">{registrationUrl}</span>
            </p>
          </div>

          {/* Bottom links */}
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href={`/register?org=${slug}`}
              className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold text-brand transition hover:bg-accent"
            >
              Manual check-in
            </Link>
            <Link
              href={`/logout?org=${slug}`}
              className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold text-brand transition hover:bg-accent"
            >
              Visitor sign out
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
