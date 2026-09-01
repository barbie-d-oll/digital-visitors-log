"use client";

import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, ExternalLink, Monitor, QrCode } from "lucide-react";
import Link from "next/link";

import {
  DashboardPanel,
  PageHeader,
} from "../../_components/dashboard/DashboardPrimitives";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function KioskDashboardPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState("");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "") ||
    (typeof window !== "undefined" ? window.location.origin : "");

  const orgSlug = user?.organizationSlug?.trim() || "";
  const encodedOrgSlug = encodeURIComponent(orgSlug);

  const kioskUrl = useMemo(() => {
    if (!baseUrl || !orgSlug) {
      return "";
    }

    return `${baseUrl}/kiosk/${encodedOrgSlug}`;
  }, [baseUrl, encodedOrgSlug, orgSlug]);

  const registerUrl = useMemo(() => {
    if (!baseUrl || !orgSlug) {
      return "";
    }

    return `${baseUrl}/register?org=${encodedOrgSlug}`;
  }, [baseUrl, encodedOrgSlug, orgSlug]);

  const logoutUrl = useMemo(() => {
    if (!baseUrl || !orgSlug) {
      return "";
    }

    return `${baseUrl}/logout?org=${encodedOrgSlug}`;
  }, [baseUrl, encodedOrgSlug, orgSlug]);

  const copyToClipboard = async (text: string, label: string) => {
    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);

      window.setTimeout(() => {
        setCopied("");
      }, 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Kiosk & QR Code"
        description="Set up your reception desk tablet or share links for visitor check-in."
        actions={
          kioskUrl ? (
            <Button asChild>
              <Link
                href={kioskUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-4" />
                Open Kiosk
              </Link>
            </Button>
          ) : null
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardPanel
          title="Check-in QR Code"
          description="Display this at your reception desk. Visitors scan to register."
        >
          <div className="flex flex-col items-center">
            <div className="aspect-square w-64 rounded-2xl border border-border bg-background p-4">
              {registerUrl ? (
                <QRCodeSVG
                  value={registerUrl}
                  size={256}
                  level="M"
                  bgColor="var(--background)"
                  fgColor="var(--foreground)"
                  className="size-full"
                  title={`Visitor registration for ${
                    user?.organizationName || "your organization"
                  }`}
                />
              ) : (
                <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                  Loading...
                </div>
              )}
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Registration link for{" "}
              <strong>
                {user?.organizationName || "your organization"}
              </strong>
            </p>
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="Shareable Links"
          description="Copy these URLs to share or embed in your systems."
        >
          <div className="space-y-4">
            <LinkRow
              label="Kiosk Page (for tablet)"
              description="Full-screen mode with QR code — put this on your reception tablet."
              url={kioskUrl}
              copied={copied === "kiosk"}
              onCopy={() => copyToClipboard(kioskUrl, "kiosk")}
              icon={Monitor}
            />

            <LinkRow
              label="Direct Registration"
              description="Direct link visitors can open to check in."
              url={registerUrl}
              copied={copied === "register"}
              onCopy={() => copyToClipboard(registerUrl, "register")}
              icon={QrCode}
            />

            <LinkRow
              label="Visitor Sign-out"
              description="Where visitors go to sign out with their code."
              url={logoutUrl}
              copied={copied === "logout"}
              onCopy={() => copyToClipboard(logoutUrl, "logout")}
              icon={ExternalLink}
            />
          </div>
        </DashboardPanel>
      </div>

      <DashboardPanel title="How to set up your kiosk">
        <ol className="space-y-3 text-sm leading-6 text-muted-foreground">
          <li className="flex gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              1
            </span>
            Open the kiosk URL on your reception tablet browser.
          </li>

          <li className="flex gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              2
            </span>
            Tap the fullscreen button (top-right) to go into kiosk mode.
          </li>

          <li className="flex gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              3
            </span>
            Visitors scan the QR code with their phone to open the check-in
            form.
          </li>

          <li className="flex gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              4
            </span>
            Their host gets notified automatically via email, SMS, or Slack.
          </li>
        </ol>
      </DashboardPanel>
    </div>
  );
}

function LinkRow({
  label,
  description,
  url,
  copied,
  onCopy,
  icon: Icon,
}: {
  label: string;
  description: string;
  url: string;
  copied: boolean;
  onCopy: () => void;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>

        <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
          {url || "Loading..."}
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onCopy}
        disabled={!url}
      >
        <Copy className="size-3.5" />
        {copied ? "Copied!" : "Copy"}
      </Button>
    </div>
  );
}