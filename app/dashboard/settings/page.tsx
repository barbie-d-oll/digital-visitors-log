"use client";

/* eslint-disable @next/next/no-img-element -- Organization logos can point to arbitrary external domains. */

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { ImageIcon, Loader2, Save, Upload } from "lucide-react";
import { toast } from "sonner";

import {
  DashboardPanel,
  FormField,
  PageHeader,
  fieldControlClassName,
} from "../../_components/dashboard/DashboardPrimitives";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { BrandingSettingsSection } from "./_components/BrandingSettingsSection";
import { applyBrandingTheme } from "@/lib/theme/branding";

interface OrgSettings {
  name: string;
  phone: string;
  address: string;
  logo: string;
  settings: {
    smsEnabled: boolean;
    smsSenderId: string;
    smsApiKey: string;
    emailNotifications: boolean;
    slackWebhookUrl: string;
    teamsWebhookUrl: string;
    notifyHostOnArrival: boolean;
    requireNda: boolean;
    ndaText: string;
    customBranding: boolean;
    primaryColor: string;
    logoUrl: string;
    visitPurposes: string[];
    requireCompany: boolean;
    autoCheckoutHours: number | null;
  };
}

export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const [org, setOrg] = useState<OrgSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const isOwner = user?.role === "owner";
  const savedBrandingRef = useRef<{ customBranding: boolean; primaryColor: string }>({
    customBranding: false,
    primaryColor: "#1b6b61",
  });

  useEffect(() => {
    return () => {
      // Revert to saved branding when leaving the settings page if unsaved
      applyBrandingTheme(
        savedBrandingRef.current.primaryColor,
        savedBrandingRef.current.customBranding,
      );
    };
  }, []);

  useEffect(() => {
    fetch("/api/organization")
      .then((res) => res.json())
      .then((data) => {
        if (data.organization) {
          const customBranding = Boolean(data.organization.settings?.customBranding);
          const primaryColor = data.organization.settings?.primaryColor || "#1b6b61";
          savedBrandingRef.current = { customBranding, primaryColor };
          applyBrandingTheme(primaryColor, customBranding);

          setOrg({
            name: data.organization.name || "",
            phone: data.organization.phone || "",
            address: data.organization.address || "",
            logo: data.organization.logo || data.organization.settings?.logoUrl || "",
            settings: {
              smsEnabled: data.organization.settings?.smsEnabled || false,
              smsSenderId: data.organization.settings?.smsSenderId || "",
              smsApiKey: data.organization.settings?.smsApiKey || "",
              emailNotifications: data.organization.settings?.emailNotifications !== false,
              slackWebhookUrl: data.organization.settings?.slackWebhookUrl || "",
              teamsWebhookUrl: data.organization.settings?.teamsWebhookUrl || "",
              notifyHostOnArrival: data.organization.settings?.notifyHostOnArrival !== false,
              requireNda: data.organization.settings?.requireNda || false,
              ndaText: data.organization.settings?.ndaText || "",
              customBranding,
              primaryColor,
              logoUrl: data.organization.logo || data.organization.settings?.logoUrl || "",
              visitPurposes: data.organization.settings?.visitPurposes || ["Meeting", "Delivery", "Interview", "Event", "Other"],
              requireCompany: data.organization.settings?.requireCompany || false,
              autoCheckoutHours: data.organization.settings?.autoCheckoutHours || null,
            },
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!org) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const logo = org.logo.trim();
      const settings = {
        ...org.settings,
        logoUrl: logo,
      };

      const res = await fetch("/api/organization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: org.name,
          phone: org.phone,
          address: org.address,
          logo,
          settings,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = data.error || "Failed to save settings.";
        setError(message);
        toast.error(message);
        return;
      }

      setOrg((current) => current ? { ...current, logo, settings } : current);
      savedBrandingRef.current = {
        customBranding: settings.customBranding,
        primaryColor: settings.primaryColor,
      };
      applyBrandingTheme(settings.primaryColor, settings.customBranding);
      await refresh();
      const message = "Settings saved successfully.";
      setSuccess(message);
      toast.success(message);
    } catch {
      const message = "Something went wrong.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof OrgSettings["settings"]>(
    key: K,
    value: OrgSettings["settings"][K]
  ) => {
    setOrg((prev) =>
      prev ? { ...prev, settings: { ...prev.settings, [key]: value } } : prev
    );
  };

  const handlePrimaryColorChange = (newColor: string) => {
    updateSetting("primaryColor", newColor);
    if (org?.settings.customBranding) {
      applyBrandingTheme(newColor, true);
    }
  };

  const handleCustomBrandingToggle = (enabled: boolean) => {
    updateSetting("customBranding", enabled);
    applyBrandingTheme(org?.settings.primaryColor || "#1b6b61", enabled);
  };

  const updateLogo = (value: string) => {
    setOrg((prev) =>
      prev
        ? {
            ...prev,
            logo: value,
            settings: { ...prev.settings, logoUrl: value },
          }
        : prev,
    );
  };

  const handleLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("logo", file);

      const res = await fetch("/api/organization/logo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || typeof data.logoUrl !== "string") {
        const message = data.error || "Failed to upload logo.";
        setError(message);
        toast.error(message);
        return;
      }

      updateLogo(data.logoUrl);
      await refresh();
      const message = "Logo uploaded successfully.";
      setSuccess(message);
      toast.success(message);
    } catch {
      const message = "Failed to upload logo.";
      setError(message);
      toast.error(message);
    } finally {
      setUploadingLogo(false);
      event.target.value = "";
    }
  };

  if (loading || !org) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const logoPreview = org.logo || org.settings.logoUrl;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Configure your organization's visitor desk preferences."
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Organization Details */}
        <DashboardPanel title="Organization" description="Basic company details.">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Organization Name" htmlFor="s-name">
              <input id="s-name" className={fieldControlClassName} value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} disabled={!isOwner} />
            </FormField>
            <FormField label="Phone" htmlFor="s-phone">
              <input id="s-phone" type="tel" className={fieldControlClassName} value={org.phone} onChange={(e) => setOrg({ ...org, phone: e.target.value })} disabled={!isOwner} />
            </FormField>
            <FormField label="Address" htmlFor="s-address" className="md:col-span-2">
              <input id="s-address" className={fieldControlClassName} value={org.address} onChange={(e) => setOrg({ ...org, address: e.target.value })} disabled={!isOwner} />
            </FormField>
            <FormField label="Logo" htmlFor="s-logo" className="md:col-span-2">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted text-muted-foreground">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt={`${org.name || "Organization"} logo`}
                      className="size-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="size-6" />
                  )}
                </div>
                <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                  <input
                    id="s-logo"
                    className={fieldControlClassName}
                    value={org.logo}
                    onChange={(e) => updateLogo(e.target.value)}
                    placeholder="https://..."
                    disabled={!isOwner}
                  />
                  <label
                    className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-input px-4 text-sm font-semibold transition ${
                      isOwner && !uploadingLogo
                        ? "cursor-pointer bg-card hover:border-ring hover:bg-accent"
                        : "cursor-not-allowed opacity-60"
                    }`}
                  >
                    {uploadingLogo ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Upload className="size-4" />
                    )}
                    {uploadingLogo ? "Uploading..." : "Upload"}
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleLogoUpload}
                      disabled={!isOwner || uploadingLogo}
                    />
                  </label>
                </div>
              </div>
            </FormField>
          </div>
        </DashboardPanel>

        {/* Notifications */}
        <DashboardPanel title="Notifications" description="How hosts get notified when visitors arrive.">
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="size-4 rounded" checked={org.settings.notifyHostOnArrival} onChange={(e) => updateSetting("notifyHostOnArrival", e.target.checked)} />
              <span className="text-sm font-medium">Notify host when visitor arrives</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="size-4 rounded" checked={org.settings.emailNotifications} onChange={(e) => updateSetting("emailNotifications", e.target.checked)} />
              <span className="text-sm font-medium">Send email notifications</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="size-4 rounded" checked={org.settings.smsEnabled} onChange={(e) => updateSetting("smsEnabled", e.target.checked)} />
              <span className="text-sm font-medium">Send SMS notifications</span>
            </label>

            {org.settings.smsEnabled && (
              <div className="grid gap-4 md:grid-cols-2 mt-3 pl-7">
                <FormField label="SMS Sender ID" htmlFor="s-sender">
                  <input id="s-sender" className={fieldControlClassName} value={org.settings.smsSenderId} onChange={(e) => updateSetting("smsSenderId", e.target.value)} placeholder="CompanyName" />
                </FormField>
                <FormField label="SMS API Key" htmlFor="s-smskey">
                  <input id="s-smskey" type="password" className={fieldControlClassName} value={org.settings.smsApiKey} onChange={(e) => updateSetting("smsApiKey", e.target.value)} placeholder="••••••••" />
                </FormField>
              </div>
            )}
          </div>
        </DashboardPanel>

        {/* Integrations */}
        <DashboardPanel title="Integrations" description="Connect Slack or Microsoft Teams for real-time notifications.">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Slack Webhook URL" htmlFor="s-slack" helper="Create an incoming webhook in your Slack workspace.">
              <input id="s-slack" className={fieldControlClassName} value={org.settings.slackWebhookUrl} onChange={(e) => updateSetting("slackWebhookUrl", e.target.value)} placeholder="https://hooks.slack.com/services/..." />
            </FormField>
            <FormField label="Teams Webhook URL" htmlFor="s-teams" helper="Create an incoming webhook in your Teams channel.">
              <input id="s-teams" className={fieldControlClassName} value={org.settings.teamsWebhookUrl} onChange={(e) => updateSetting("teamsWebhookUrl", e.target.value)} placeholder="https://outlook.office.com/webhook/..." />
            </FormField>
          </div>
        </DashboardPanel>

        {/* Security / NDA */}
        <DashboardPanel title="Security & Compliance" description="NDA signing, company requirements, and auto-checkout.">
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="size-4 rounded" checked={org.settings.requireNda} onChange={(e) => updateSetting("requireNda", e.target.checked)} />
              <span className="text-sm font-medium">Require NDA/Agreement signing on check-in</span>
            </label>

            {org.settings.requireNda && (
              <div className="pl-7">
                <FormField label="NDA Document Text" htmlFor="s-nda">
                  <textarea
                    id="s-nda"
                    className={`${fieldControlClassName} min-h-32 resize-y`}
                    value={org.settings.ndaText}
                    onChange={(e) => updateSetting("ndaText", e.target.value)}
                    placeholder="Enter the NDA or visitor agreement text that visitors must sign..."
                  />
                </FormField>
              </div>
            )}

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="size-4 rounded" checked={org.settings.requireCompany} onChange={(e) => updateSetting("requireCompany", e.target.checked)} />
              <span className="text-sm font-medium">Require company name from visitors</span>
            </label>

            {/* <FormField label="Auto-checkout after (hours)" htmlFor="s-autocheckout" helper="Leave empty to disable. Visitors will be auto-signed-out after this many hours.">
              <input id="s-autocheckout" type="number" min="1" max="24" className={fieldControlClassName} value={org.settings.autoCheckoutHours || ""} onChange={(e) => updateSetting("autoCheckoutHours", e.target.value ? parseInt(e.target.value) : null)} placeholder="8" />
            </FormField> */}
          </div>
        </DashboardPanel>

        {/* Branding */}
        <DashboardPanel
          title="Custom Branding"
          description="Customize your brand colors across your public visitor pages and workspace in real time."
        >
          <BrandingSettingsSection
            customBranding={org.settings.customBranding}
            primaryColor={org.settings.primaryColor}
            orgName={org.name}
            logoUrl={logoPreview}
            disabled={!isOwner}
            onCustomBrandingChange={handleCustomBrandingToggle}
            onPrimaryColorChange={handlePrimaryColorChange}
          />
        </DashboardPanel>

        {/* Save */}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <div className="flex justify-end">
          <Button type="submit" disabled={saving || !isOwner}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
