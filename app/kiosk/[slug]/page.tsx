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

interface OrganizationApiSuccess {
  ok: true;
  name: string;
  branding?: Branding | null;
}

interface OrganizationApiError {
  ok?: false;
  error?: string;
}

type OrganizationApiResponse =
  | OrganizationApiSuccess
  | OrganizationApiError;

export default function KioskPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [orgInfo, setOrgInfo] = useState<OrgInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const registrationUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return `${window.location.origin}/register?org=${encodeURIComponent(slug)}`;
  }, [slug]);

  const logoutUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return `${window.location.origin}/logout?org=${encodeURIComponent(slug)}`;
  }, [slug]);

  useEffect(() => {
    let cancelled = false;

    const loadOrganization = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/organization/public?slug=${encodeURIComponent(slug)}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const data =
          (await response.json()) as OrganizationApiResponse;

        if (!response.ok) {
          throw new Error(
            "error" in data
              ? data.error || "Unable to load this organization's kiosk."
              : "Unable to load this organization's kiosk.",
          );
        }

        if (!data.ok) {
          throw new Error(
            data.error || "This organization could not be found.",
          );
        }

        if (!cancelled) {
          setOrgInfo({
            name: data.name,
            branding: data.branding ?? null,
          });
        }
      } catch (err) {
        console.error("Failed to load kiosk organization:", err);

        if (!cancelled) {
          setOrgInfo(null);
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load this organization's kiosk.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadOrganization();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="size-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Loading kiosk...
          </p>
        </div>
      </div>
    );
  }

  if (error || !orgInfo) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background px-6">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
            <ScanLine size={22} />
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight">
            Kiosk unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {error ||
              "We could not load this organization's kiosk."}
          </p>

          <p className="mt-3 break-all text-xs text-muted-foreground">
            Organization: <strong>{slug}</strong>
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold text-brand transition hover:bg-accent"
          >
            Return to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-svh flex-col bg-background text-foreground">
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <div className="flex items-center gap-3">
          <div
            className="grid size-10 place-items-center rounded-xl bg-brand-gold text-brand-foreground"
            style={
              orgInfo.branding?.primaryColor
                ? {
                    backgroundColor:
                      orgInfo.branding.primaryColor,
                  }
                : undefined
            }
          >
            <UserRoundCheck size={20} strokeWidth={2.3} />
          </div>

          <div>
            <p className="text-sm font-bold">{orgInfo.name}</p>
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

      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-10">
        <div className="w-full max-w-md text-center">
          <div className="rounded-[1.5rem] border border-border bg-card p-6 shadow-[0_30px_80px_rgba(48,73,68,.12)] sm:p-8">
            <span className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-accent text-accent-foreground">
              <ScanLine size={22} />
            </span>

            <h1 className="text-2xl font-bold tracking-tight">
              Scan to check in
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Open your phone camera and point it at the QR code below.
            </p>

            <div className="mx-auto mt-6 aspect-square w-[min(20rem,100%)] rounded-2xl border border-border bg-background p-4">
              <QRCodeSVG
                value={registrationUrl}
                size={352}
                level="M"
                bgColor="var(--background)"
                fgColor="var(--foreground)"
                className="size-full"
                title={`Visitor registration for ${orgInfo.name}`}
              />
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Or visit:
            </p>

            <p className="mt-1 break-all font-mono text-xs font-semibold text-foreground">
              {registrationUrl}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href={`/register?org=${encodeURIComponent(slug)}`}
              className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold text-brand transition hover:bg-accent"
            >
              Manual check-in
            </Link>

            <Link
              href={logoutUrl}
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