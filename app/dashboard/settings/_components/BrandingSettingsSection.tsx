"use client";

/* eslint-disable @next/next/no-img-element -- Organization logos can point to arbitrary external domains. */

import { useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  QrCode,
  UserCheck,
  Building2,
  ExternalLink,
} from "lucide-react";

import {
  DEFAULT_BRAND_COLOR,
  ENTERPRISE_PALETTES,
  getAccessibleForeground,
  isValidHex,
  normalizeHex,
} from "@/lib/theme/branding";

interface BrandingSettingsSectionProps {
  customBranding: boolean;
  primaryColor: string;
  orgName: string;
  logoUrl: string;
  disabled?: boolean;
  onCustomBrandingChange: (enabled: boolean) => void;
  onPrimaryColorChange: (color: string) => void;
}

export function BrandingSettingsSection({
  customBranding,
  primaryColor,
  orgName,
  logoUrl,
  disabled = false,
  onCustomBrandingChange,
  onPrimaryColorChange,
}: BrandingSettingsSectionProps) {
  const [prevPrimaryColor, setPrevPrimaryColor] = useState(primaryColor);
  const [hexInput, setHexInput] = useState(primaryColor || DEFAULT_BRAND_COLOR);

  // Sync state during render when prop changes (React recommended pattern)
  if (primaryColor !== prevPrimaryColor) {
    setPrevPrimaryColor(primaryColor);
    setHexInput(primaryColor || DEFAULT_BRAND_COLOR);
  }

  // Active color representation
  const activeColor = useMemo(() => {
    return normalizeHex(primaryColor) || DEFAULT_BRAND_COLOR;
  }, [primaryColor]);

  // Dynamic accessibility calculations
  const contrastInfo = useMemo(() => {
    return getAccessibleForeground(activeColor);
  }, [activeColor]);

  const isInputValid = useMemo(() => {
    return isValidHex(hexInput);
  }, [hexInput]);

  const handleColorChange = (newColor: string) => {
    setHexInput(newColor);
    const normalized = normalizeHex(newColor);
    if (normalized) {
      onPrimaryColorChange(normalized);
    }
  };

  const handleResetToDefault = () => {
    handleColorChange(DEFAULT_BRAND_COLOR);
  };

  return (
    <div className="space-y-6">
      {/* Enable Custom Branding Toggle */}
      <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card/60 p-4 shadow-sm transition-colors hover:bg-card">
        <label
          htmlFor="toggle-branding"
          className="flex cursor-pointer items-start gap-3.5 select-none"
        >
          <input
            id="toggle-branding"
            type="checkbox"
            className="mt-1 size-4.5 rounded border-input text-primary focus:ring-ring"
            checked={customBranding}
            onChange={(e) => onCustomBrandingChange(e.target.checked)}
            disabled={disabled}
          />
          <div>
            <span className="block text-sm font-semibold text-foreground">
              Enable custom company branding
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Applies your corporate primary color in real time across the
              dashboard, buttons, navigation, and public visitor check-in kiosk.
            </span>
          </div>
        </label>

        {customBranding && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-primary/20">
            <Sparkles className="size-3" />
            Active
          </span>
        )}
      </div>

      {/* Main Branding Configuration & Live Preview Area */}
      {customBranding && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Color Controls & Presets (7 cols) */}
          <div className="space-y-5 lg:col-span-7">
            {/* Color Picker & Manual Hex Input */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">
                  Primary Brand Color
                </label>
                {activeColor !== DEFAULT_BRAND_COLOR && (
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    disabled={disabled}
                    className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition"
                  >
                    <RotateCcw className="size-3" />
                    Reset to default
                  </button>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                {/* Native Color Wheel Swatch */}
                <div className="relative group">
                  <input
                    type="color"
                    id="branding-color-picker"
                    value={activeColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    disabled={disabled}
                    className="absolute inset-0 size-full cursor-pointer opacity-0"
                    title="Click to open color picker"
                  />
                  <div
                    className="flex size-11 items-center justify-center rounded-xl border-2 border-border shadow-sm ring-offset-background transition group-hover:scale-105 group-hover:border-foreground/40"
                    style={{ backgroundColor: activeColor }}
                  >
                    <div
                      className="size-3.5 rounded-full border border-black/20 shadow-inner"
                      style={{ backgroundColor: contrastInfo.foreground }}
                    />
                  </div>
                </div>

                {/* Hex Input Field */}
                <div className="relative flex-1 min-w-36">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm font-semibold text-muted-foreground">
                    #
                  </span>
                  <input
                    type="text"
                    value={hexInput.replace(/^#/, "")}
                    onChange={(e) => handleColorChange(`#${e.target.value}`)}
                    placeholder="1B6B61"
                    maxLength={7}
                    disabled={disabled}
                    className="w-full rounded-xl border border-input bg-background pl-8 pr-9 py-2.5 font-mono text-sm uppercase tracking-wider text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/30 transition disabled:opacity-60"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isInputValid ? (
                      <Check className="size-4 text-green-600" />
                    ) : (
                      <AlertCircle className="size-4 text-destructive" />
                    )}
                  </div>
                </div>
              </div>

              {!isInputValid && (
                <p className="mt-2 text-xs font-medium text-destructive">
                  Please enter a valid 3 or 6-digit hex color code (e.g. #1A73E8).
                </p>
              )}
            </div>

            {/* Curated Enterprise Palettes */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Curated Enterprise Palettes
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Select a high-performing, professionally balanced corporate palette.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {ENTERPRISE_PALETTES.map((palette) => {
                  const isSelected =
                    activeColor.toLowerCase() === palette.hex.toLowerCase();
                  return (
                    <button
                      key={palette.hex}
                      type="button"
                      onClick={() => handleColorChange(palette.hex)}
                      disabled={disabled}
                      className={`group relative flex flex-col items-start rounded-xl border p-2.5 text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/30"
                          : "border-border bg-background/60 hover:border-foreground/30 hover:bg-accent/40"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span
                          className="size-6 rounded-lg border border-black/10 shadow-xs"
                          style={{ backgroundColor: palette.hex }}
                        />
                        {isSelected && (
                          <span className="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="size-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <span className="mt-2 block truncate text-xs font-semibold text-foreground">
                        {palette.name}
                      </span>
                      <span className="block font-mono text-[10px] text-muted-foreground">
                        {palette.hex}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accessibility & Contrast Scorecard */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2.5">
                {contrastInfo.isAccessibleAA ? (
                  <CheckCircle2 className="size-5 text-green-600 shrink-0" />
                ) : (
                  <AlertCircle className="size-5 text-amber-500 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    WCAG 2.1 Contrast:{" "}
                    <span className="font-mono font-bold">
                      {contrastInfo.contrastRatio}:1
                    </span>{" "}
                    ({contrastInfo.isAccessibleAAA ? "AAA Compliant" : "AA Compliant"})
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Dynamic foreground calculates to{" "}
                    <span className="font-mono font-semibold">
                      {contrastInfo.foreground}
                    </span>{" "}
                    for optimal readability.
                  </p>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  contrastInfo.isAccessibleAA
                    ? "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                }`}
              >
                {contrastInfo.isAccessibleAAA
                  ? "WCAG AAA"
                  : contrastInfo.isAccessibleAA
                    ? "WCAG AA"
                    : "Low Contrast"}
              </span>
            </div>
          </div>

          {/* Right Column: Live Interactive Preview (5 cols) */}
          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Real-Time Live Preview
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                  Live Sync
                </span>
              </div>

              <div className="mt-4 space-y-4">
                {/* Simulated Primary & Outline Buttons */}
                <div className="space-y-2">
                  <p className="text-[11px] font-medium text-muted-foreground">
                    Action Buttons
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold shadow-xs transition hover:opacity-90 active:scale-98"
                      style={{
                        backgroundColor: activeColor,
                        color: contrastInfo.foreground,
                      }}
                    >
                      <UserCheck className="size-3.5" />
                      Check In Visitor
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3.5 text-xs font-semibold text-foreground transition hover:bg-accent"
                    >
                      <QrCode className="size-3.5" />
                      Scan QR
                    </button>
                  </div>
                </div>

                {/* Simulated Badges & Tags */}
                <div className="space-y-2">
                  <p className="text-[11px] font-medium text-muted-foreground">
                    Badges & Status Highlights
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor: `${activeColor}1F`, // ~12% opacity
                        color: activeColor,
                      }}
                    >
                      <span
                        className="size-1.5 rounded-full"
                        style={{ backgroundColor: activeColor }}
                      />
                      14 Visitors Expected Today
                    </span>
                    <span
                      className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold"
                      style={{
                        backgroundColor: activeColor,
                        color: contrastInfo.foreground,
                      }}
                    >
                      VIP Host
                    </span>
                  </div>
                </div>

                {/* Simulated Sidebar Nav Highlight */}
                <div className="space-y-2">
                  <p className="text-[11px] font-medium text-muted-foreground">
                    Sidebar Navigation Active State
                  </p>
                  <div
                    className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 transition"
                    style={{
                      backgroundColor: activeColor,
                      color: contrastInfo.foreground,
                    }}
                  >
                    <UserCheck className="size-4 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold">Visitors Directory</p>
                      <p
                        className="text-[10px] opacity-85 truncate"
                      >
                        Real-time visitor logs
                      </p>
                    </div>
                  </div>
                </div>

                {/* Simulated Public Visitor Kiosk Card */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-medium text-muted-foreground">
                      Public Kiosk Welcome Desk Card
                    </p>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      visitor-desk <ExternalLink className="size-2.5" />
                    </span>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
                    {/* Top Accent Bar in Primary Color */}
                    <div
                      className="h-1.5 w-full"
                      style={{ backgroundColor: activeColor }}
                    />
                    <div className="p-3.5 text-center">
                      <div className="mx-auto flex size-10 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt="Logo"
                            className="size-full object-cover"
                          />
                        ) : (
                          <Building2 className="size-5 text-muted-foreground" />
                        )}
                      </div>
                      <p className="mt-2 text-xs font-bold text-foreground truncate">
                        Welcome to {orgName || "Our Workplace"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Please touch to begin check-in
                      </p>

                      <div className="mt-3">
                        <span
                          className="inline-block w-full rounded-lg py-1.5 text-xs font-bold shadow-xs"
                          style={{
                            backgroundColor: activeColor,
                            color: contrastInfo.foreground,
                          }}
                        >
                          Start Check-in
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
