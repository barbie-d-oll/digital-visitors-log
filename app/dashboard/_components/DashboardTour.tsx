"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { driver, Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { Compass, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TOUR_EVENT_NAME = "start-dashboard-tour";

export function triggerDashboardTour() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(TOUR_EVENT_NAME));
  }
}

export default function DashboardTour() {
  const { user, markTourCompleted } = useAuth();
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const driverRef = useRef<Driver | null>(null);

  const startTour = useCallback(() => {
    setWelcomeOpen(false);

    // Initialize driver.js
    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayOpacity: 0.65,
      nextBtnText: "Next →",
      prevBtnText: "← Back",
      doneBtnText: "Finish 🎉",
      steps: [
        {
          element: "#tour-overview",
          popover: {
            title: "Welcome to Your Workspace 👋",
            description:
              "This is your central command center. Track live visitor traffic, monitor premises activity, and generate exportable reports.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#tour-stats",
          popover: {
            title: "Real-Time Front Desk Stats 📊",
            description:
              "See live numbers for currently checked-in guests, departures, and total visitor volume at a glance.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#tour-nav-kiosk",
          popover: {
            title: "Self-Service Kiosk & QR Code 📱",
            description:
              "Set up reception tablets or download your check-in QR code for touchless, fast guest sign-ins.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#tour-nav-staff",
          popover: {
            title: "Staff & Hosts Directory 👥",
            description:
              "Add employee hosts so guests can select who they are visiting, triggering instant email or SMS arrival alerts.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#tour-nav-departments",
          popover: {
            title: "Departments & Department Heads 🏢",
            description:
              "Organize your organization into departments and assign Department Heads who oversee departmental visitor queues, approvals, and host assignments.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#tour-nav-appointments",
          popover: {
            title: "Pre-Registrations & Appointments 📅",
            description:
              "Schedule anticipated visitor arrivals in advance to provide a VIP, fast-track check-in experience.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#tour-nav-settings",
          popover: {
            title: "Branding & Preferences ⚙️",
            description:
              "Upload your company logo, set your primary brand colors, and configure visitor badge printing.",
            side: "right",
            align: "start",
          },
        },
      ],
      onDestroyStarted: () => {
        void markTourCompleted();
        driverObj.destroy();
        toast.success("Tour completed! Welcome aboard.", {
          description: "You can restart this tour anytime from the Help icon in the top bar.",
        });
      },
    });

    driverRef.current = driverObj;
    driverObj.drive();
  }, [markTourCompleted]);

  const handleSkipTour = useCallback(() => {
    setWelcomeOpen(false);
    void markTourCompleted();
    toast.info("Tour skipped", {
      description: "You can always replay the tour from the top bar Help button.",
    });
  }, [markTourCompleted]);

  // Check if first-time tour prompt should display
  useEffect(() => {
    if (!user) return;

    const hasSeenSessionPrompt = sessionStorage.getItem("hasSeenTourPrompt");

    if (user.hasCompletedTour === false && !hasSeenSessionPrompt) {
      sessionStorage.setItem("hasSeenTourPrompt", "true");
      // Small timeout to allow page layout to settle
      const timer = setTimeout(() => {
        setWelcomeOpen(true);
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [user]);

  // Listen for manual tour replay events
  useEffect(() => {
    const handleReplay = () => {
      startTour();
    };

    window.addEventListener(TOUR_EVENT_NAME, handleReplay);
    return () => {
      window.removeEventListener(TOUR_EVENT_NAME, handleReplay);
    };
  }, [startTour]);

  return (
    <Dialog open={welcomeOpen} onOpenChange={setWelcomeOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-2">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="size-6" />
          </div>
          <DialogTitle className="text-xl font-bold">
            Welcome to {user?.organizationName || "Digital Visitor Log"}! 👋
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            Would you like a quick 60-second interactive tour of your front desk
            workspace? We&apos;ll show you how to launch your check-in kiosk, add staff,
            and monitor visitors in real time.
          </DialogDescription>
        </DialogHeader>

        <div className="my-2 space-y-2 rounded-xl border border-border/60 bg-muted/30 p-3.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-primary" />
            <span>Launch self-service kiosk &amp; printable QR code</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-primary" />
            <span>Set up employee hosts and arrival notifications</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-primary" />
            <span>Organize departments and assign department heads</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-primary" />
            <span>Customize company logo, branding &amp; visitor badges</span>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={handleSkipTour}
            className="w-full sm:w-auto"
          >
            Explore on my own
          </Button>
          <Button
            type="button"
            onClick={startTour}
            className="w-full gap-2 sm:w-auto"
          >
            <Compass className="size-4" />
            Start Quick Tour
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
