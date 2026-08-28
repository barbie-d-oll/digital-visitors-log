"use client";

import type { CSSProperties } from "react";
import { useTheme } from "next-themes";
import { Toaster } from "sonner";

type ToastCssVariables = CSSProperties & {
  [key: `--${string}`]: string;
};

const toastThemeVariables: ToastCssVariables = {
  "--normal-bg": "var(--popover)",
  "--normal-border": "var(--border)",
  "--normal-text": "var(--popover-foreground)",
  "--success-bg": "var(--background)",
  "--success-border": "var(--success)",
  "--success-text": "var(--foreground)",
  "--info-bg": "var(--info)",
  "--info-border": "var(--info)",
  "--info-text": "var(--info-foreground)",
  "--warning-bg": "var(--warning)",
  "--warning-border": "var(--warning)",
  "--warning-text": "var(--warning-foreground)",
  "--error-bg": "var(--destructive)",
  "--error-border": "var(--destructive)",
  "--error-text": "var(--destructive-foreground)",
  "--border-radius": "var(--radius-md)",
};

export function AppToaster() {
  const { resolvedTheme } = useTheme();
  const toasterTheme = resolvedTheme === "dark" ? "dark" : "light";

  return (
    <Toaster
      closeButton
      richColors
      position="top-right"
      theme={toasterTheme}
      style={toastThemeVariables}
      toastOptions={{
        classNames: {
          toast: "shadow-enterprise-overlay",
          title: "font-semibold",
        },
      }}
    />
  );
}
