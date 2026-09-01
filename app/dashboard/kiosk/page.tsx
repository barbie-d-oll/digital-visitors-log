"use client";

import { useEffect, useState } from "react";
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
  const [baseUrl, setBaseUrl] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const orgSlug = user?.organizationSlug || "";
  
  
  const kioskUrl = `${baseUrl}/kiosk/${orgSlug}`;
  const registerUrl = `${baseUrl}/register?org=${orgSlug}`;
  const logoutUrl = `${baseUrl}/logout?org=${orgSlug}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Kiosk & QR Code"
        description="Set up your reception desk tablet or share links for visitor check-in."
        
        actions={
          orgSlug ? (
            <Button asChild>
              <Link href={`/kiosk/${orgSlug}`} target="_blank">
                <ExternalLink className="size-4" /> Open Kiosk
              </Link>
            </Button>
          ) : null
        }
      />

      {/* QR Code */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardPanel title="Check-in QR Code" description="Display this at your reception desk. Visitors scan to register.">
          <div className="flex flex-col items-center">
            <div className="aspect-square w-64 rounded-2xl border border-border bg-background p-4">
              {registerUrl && baseUrl ? (
                <QRCodeSVG
                  value={registerUrl}
                  size={256}
                  level="M"
                  bgColor="var(--background)"
                  fgColor="var(--foreground)"
                  className="size-full"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                  Loading...
                </div>
              )}
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Registration link for <strong>{user?.organizationName}</strong>
            </p>
          </div>
        </DashboardPanel>

        {/* Links */}
        <DashboardPanel title="Shareable Links" description="Copy these URLs to share or embed in your systems.">
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

      {/* Instructions */}
      <DashboardPanel title="How to set up your kiosk">
        <ol className="space-y-3 text-sm text-muted-foreground leading-6">
          <li className="flex gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</span>
            Open the kiosk URL on your reception tablet browser.
          </li>
          <li className="flex gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">2</span>
            Tap the fullscreen button (top-right) to go into kiosk mode.
          </li>
          <li className="flex gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">3</span>
            Visitors scan the QR code with their phone to open the check-in form.
          </li>
          <li className="flex gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">4</span>
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
        <p className="mt-1 truncate font-mono text-xs text-muted-foreground">{url}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onCopy}>
        <Copy className="size-3.5" />
        {copied ? "Copied!" : "Copy"}
      </Button>
    </div>
  );
}
