import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PwaServiceWorker } from "@/components/pwa-service-worker";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/Theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Visitor Log | Digital Welcome Desk",
  description: "A simple, secure, and welcoming way to manage every visitor.",
  applicationName: "Visitor Log",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Visitor Log",
  },
  icons: {
    icon: "/icon",
    shortcut: "/icon",
    apple: "/apple-icon",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#1b6b61",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PwaServiceWorker />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
