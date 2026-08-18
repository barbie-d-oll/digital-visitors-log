"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

import {
  DashboardPanel,
  FormField,
  PageHeader,
  fieldControlClassName,
} from "../../_components/dashboard/DashboardPrimitives";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface OrgSettings {
  name: string;
  phone: string;
  address: string;
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
  const { user } = useAuth();
  const [org, setOrg] = useState<OrgSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/organization")
      .then((res) => res.json())
      .then((data) => {
        if (data.organization) {
          setOrg({
            name: data.organization.name || "",
            phone: data.organization.phone || "",
            address: data.organization.address || "",
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
              customBranding: data.organization.settings?.customBranding || false,
              primaryColor: data.organization.settings?.primaryColor || "#1b6b61",
              logoUrl: data.organization.settings?.logoUrl || "",
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
      const res = await fetch("/api/organization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: org.name,
          phone: org.phone,
          address: org.address,
          settings: org.settings,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save settings.");
        return;
      }

      setSuccess("Settings saved successfully.");
    } catch {
      setError("Something went wrong.");
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

  if (loading || !org) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isOwner = user?.role === "owner";

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

            <FormField label="Auto-checkout after (hours)" htmlFor="s-autocheckout" helper="Leave empty to disable. Visitors will be auto-signed-out after this many hours.">
              <input id="s-autocheckout" type="number" min="1" max="24" className={fieldControlClassName} value={org.settings.autoCheckoutHours || ""} onChange={(e) => updateSetting("autoCheckoutHours", e.target.value ? parseInt(e.target.value) : null)} placeholder="8" />
            </FormField>
          </div>
        </DashboardPanel>

        {/* Branding */}
        <DashboardPanel title="Custom Branding" description="Customize the look of your public visitor pages.">
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="size-4 rounded" checked={org.settings.customBranding} onChange={(e) => updateSetting("customBranding", e.target.checked)} />
              <span className="text-sm font-medium">Enable custom branding on public pages</span>
            </label>

            {org.settings.customBranding && (
              <div className="grid gap-4 md:grid-cols-2 pl-7">
                <FormField label="Primary Color" htmlFor="s-color">
                  <div className="flex items-center gap-3">
                    <input id="s-color" type="color" className="size-10 rounded cursor-pointer border border-input" value={org.settings.primaryColor} onChange={(e) => updateSetting("primaryColor", e.target.value)} />
                    <input className={fieldControlClassName} value={org.settings.primaryColor} onChange={(e) => updateSetting("primaryColor", e.target.value)} placeholder="#1b6b61" />
                  </div>
                </FormField>
                <FormField label="Logo URL" htmlFor="s-logo">
                  <input id="s-logo" className={fieldControlClassName} value={org.settings.logoUrl} onChange={(e) => updateSetting("logoUrl", e.target.value)} placeholder="https://..." />
                </FormField>
              </div>
            )}
          </div>
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
