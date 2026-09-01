"use client";

import { use, useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ScanLine, UserRoundCheck } from "lucide-react";
import Link from "next/link";

import FullscreenButton from "@/components/common/Fullscreen";
import { ModeToggle } from "@/components/common/Toggle";

interface Branding {
  primaryColor?: string;
  logoUrl?: string;
}

interface OrgInfo {
  name: string;
  branding?: Branding | null;
}

interface OrganizationResponse {
  ok: true;
  name: string;
  branding?: Branding | null;
}

interface OrganizationErrorResponse {
  ok: false;
  error?: string;
}

type OrganizationResponseData =
  | OrganizationResponse
  | OrganizationErrorResponse;

export default function KioskPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [orgInfo, setOrgInfo] = useState<OrgInfo | null>(null);
  const [loading, setLoading] = useState(true);

  /*
   * Build URLs from the current browser origin.
   * This works both locally and on Vercel.
   */
  const registrationUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return `${window.location.origin}/register?org=${encodeURIComponent(
      slug
    )}`;
  }, [slug]);

  const logoutUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return `${window.location.origin}/logout?org=${encodeURIComponent(
      slug
    )}`;
  }, [slug]);

  useEffect(() => {
    let cancelled = false;

    async function loadOrganization() {
      try {
        const response = await fetch(
          `/api/organization/public?slug=${encodeURIComponent(slug)}`,
          {
            cache: "no-store",
          }
        );

        const data =
          (await response.json()) as OrganizationResponseData;

        if (!response.ok || !data.ok) {
          throw new Error(
            "error" in data
              ? data.error || "Organization could not be loaded."
              : "Organization could not be loaded."
          );
        }

        if (!cancelled) {
          setOrgInfo({
            name: data.name,
            branding: data.branding ?? null,
          });
        }
      } catch (error) {
        console.error("Failed to load kiosk organization:", error);

        if (!cancelled) {
          setOrgInfo(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadOrganization();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <span className="size-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
      </div>
    );
  }

  const organizationName = orgInfo?.name || "Visitor Log";

  /*
   * These are relative URLs, so they automatically use:
   *
   * Local:
   * http://localhost:3000/register?org=assic
   *
   * Production:
   * https://digital-visitors-log.vercel.app/register?org=assic
   */
  const manualRegistrationPath = `/register?org=${encodeURIComponent(
    slug
  )}`;

  const visitorLogoutPath = `/logout?org=${encodeURIComponent(slug)}`;

  return (
    <main className="relative flex min-h-svh flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-brand-gold text-brand-foreground">
            <UserRoundCheck size={20} strokeWidth={2.3} />
          </div>

          <div>
            <p className="text-sm font-bold">{organizationName}</p>

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
          {/* Kiosk Card */}
          <div className="rounded-[1.5rem] border border-border bg-card p-6 shadow-[0_30px_80px_rgba(48,73,68,.12)] sm:p-8">
            {/* Icon */}
            <span className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-accent text-accent-foreground">
              <ScanLine size={22} />
            </span>

            <h1 className="text-2xl font-bold tracking-tight">
              Welcome
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Scan the QR code with your phone or use the button below
              to check in manually.
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
                  title={`Visitor registration for ${organizationName}`}
                />
              ) : (
                <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                  Loading...
                </div>
              )}
            </div>

            {/* Registration URL */}
            {registrationUrl && (
              <p className="mt-4 break-all text-xs text-muted-foreground">
                Or visit:
                <span className="ml-1 font-mono font-semibold text-foreground">
                  {registrationUrl}
                </span>
              </p>
            )}

            {/* Main Manual Registration Button */}
            <div className="mt-6">
              <Link
                href={manualRegistrationPath}
                className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"
              >
                Register Manually
              </Link>
            </div>

            {/* Bottom Links */}
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                href={manualRegistrationPath}
                className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold text-brand transition hover:bg-accent"
              >
                Manual Check-in
              </Link>

              <Link
                href={visitorLogoutPath}
                className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold text-brand transition hover:bg-accent"
              >
                Visitor Sign Out
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}