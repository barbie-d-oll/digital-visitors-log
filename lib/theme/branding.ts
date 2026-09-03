/**
 * Enterprise Branding Theme Engine
 * Provides real-time dynamic CSS variable injection, WCAG AA/AAA compliant
 * contrast calculation, hex normalization, and curated color palettes.
 */

export interface ColorContrastInfo {
  foreground: string; // e.g., '#ffffff' or '#091e1b'
  contrastRatio: number; // e.g., 7.42
  isAccessibleAA: boolean; // contrastRatio >= 4.5:1
  isAccessibleAAA: boolean; // contrastRatio >= 7.0:1
}

export interface EnterprisePreset {
  name: string;
  hex: string;
  description: string;
}

export const DEFAULT_BRAND_COLOR = "#1b6b61";

export const ENTERPRISE_PALETTES: EnterprisePreset[] = [
  {
    name: "Enterprise Teal",
    hex: "#1b6b61",
    description: "Default balanced professional teal",
  },
  {
    name: "Google Blue",
    hex: "#1a73e8",
    description: "Modern, trustworthy tech blue",
  },
  {
    name: "Emerald Green",
    hex: "#059669",
    description: "Vibrant, eco and finance modern green",
  },
  {
    name: "Royal Indigo",
    hex: "#4f46e5",
    description: "Deep, sophisticated digital indigo",
  },
  {
    name: "Electric Violet",
    hex: "#7c3aed",
    description: "Creative, premium royal purple",
  },
  {
    name: "Crimson Ruby",
    hex: "#dc2626",
    description: "Bold, energetic corporate red",
  },
  {
    name: "Sunset Amber",
    hex: "#d97706",
    description: "Warm, welcoming hospitality amber",
  },
  {
    name: "Midnight Slate",
    hex: "#334155",
    description: "Sleek, minimalist enterprise slate",
  },
];

/**
 * Validates whether an input string is a valid 3-digit or 6-digit hex code.
 */
export function isValidHex(hex: string): boolean {
  if (!hex || typeof hex !== "string") return false;
  const clean = hex.trim().replace(/^#/, "");
  return (
    (clean.length === 3 || clean.length === 6) && /^[0-9A-Fa-f]+$/.test(clean)
  );
}

/**
 * Normalizes any valid hex string into a standard #RRGGBB format.
 */
export function normalizeHex(hex: string): string | null {
  if (!isValidHex(hex)) return null;
  let clean = hex.trim().replace(/^#/, "");
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return `#${clean.toUpperCase()}`;
}

/**
 * Converts a hex string to RGB components.
 */
export function hexToRgb(
  hex: string,
): { r: number; g: number; b: number } | null {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;
  const num = parseInt(normalized.slice(1), 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Computes WCAG 2.1 relative luminance for an sRGB color.
 * Reference: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Computes the contrast ratio between two luminance values (1 to 21).
 */
export function getContrastRatioFromLuminances(
  lum1: number,
  lum2: number,
): number {
  const brighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (brighter + 0.05) / (darker + 0.05);
}

/**
 * Calculates the optimal high-contrast foreground color (#ffffff or #091e1b)
 * and returns detailed WCAG contrast ratio information.
 */
export function getAccessibleForeground(hex: string): ColorContrastInfo {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return {
      foreground: "#ffffff",
      contrastRatio: 21,
      isAccessibleAA: true,
      isAccessibleAAA: true,
    };
  }

  const bgLum = getRelativeLuminance(rgb.r, rgb.g, rgb.b);
  const whiteLum = 1.0;
  const darkLum = getRelativeLuminance(9, 30, 27); // #091e1b

  const contrastWithWhite = getContrastRatioFromLuminances(bgLum, whiteLum);
  const contrastWithDark = getContrastRatioFromLuminances(bgLum, darkLum);

  // Pick whichever offers greater contrast
  const useWhite = contrastWithWhite >= contrastWithDark;
  const ratio = useWhite ? contrastWithWhite : contrastWithDark;
  const roundedRatio = Math.round(ratio * 10) / 10;

  return {
    foreground: useWhite ? "#ffffff" : "#091e1b",
    contrastRatio: roundedRatio,
    isAccessibleAA: roundedRatio >= 4.5,
    isAccessibleAAA: roundedRatio >= 7.0,
  };
}

/**
 * Dynamically applies the branding colors to document.documentElement.style.
 * This delivers instantaneous, 60fps real-time updates across the dashboard.
 */
export function applyBrandingTheme(
  primaryColor?: string | null,
  customBranding: boolean = true,
): void {
  if (typeof window === "undefined" || !document?.documentElement) return;

  const rootStyle = document.documentElement.style;

  if (!customBranding || !primaryColor || !isValidHex(primaryColor)) {
    clearBrandingTheme();
    return;
  }

  const normalized = normalizeHex(primaryColor);
  if (!normalized) {
    clearBrandingTheme();
    return;
  }

  const contrast = getAccessibleForeground(normalized);

  // Set the primary and brand color tokens
  rootStyle.setProperty("--primary", normalized);
  rootStyle.setProperty("--primary-foreground", contrast.foreground);
  rootStyle.setProperty("--brand", normalized);
  rootStyle.setProperty("--brand-foreground", contrast.foreground);
  rootStyle.setProperty("--ring", normalized);
  rootStyle.setProperty("--sidebar-primary", normalized);
  rootStyle.setProperty("--sidebar-primary-foreground", contrast.foreground);
}

/**
 * Removes custom property overrides, restoring the default stylesheet variables.
 */
export function clearBrandingTheme(): void {
  if (typeof window === "undefined" || !document?.documentElement) return;

  const rootStyle = document.documentElement.style;
  rootStyle.removeProperty("--primary");
  rootStyle.removeProperty("--primary-foreground");
  rootStyle.removeProperty("--brand");
  rootStyle.removeProperty("--brand-foreground");
  rootStyle.removeProperty("--ring");
  rootStyle.removeProperty("--sidebar-primary");
  rootStyle.removeProperty("--sidebar-primary-foreground");
}
