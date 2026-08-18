"use client"

import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "../common/Toggle";
import FullScreenButton from "../common/Fullscreen";

export default function MarketingNavbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 mx-auto w-full bg-transparent transition-all backdrop-blur-sm sm:px-8">
      <nav className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-md bg-brand-gold text-brand-foreground shadow-enterprise-sm">
            <span className="font-bold">DVL</span>
          </div>
          <span className="font-semibold text-foreground">
            Digital Visitors Log
          </span>
        </div>

        <ul className="hidden items-center gap-6 text-lg font-medium text-muted-foreground md:flex">
          <li>
            <Link href="#features" className="hover:text-foreground">
              Features
            </Link>
          </li>
          <li>
            <Link href="#how-it-works" className="hover:text-foreground">
              How It Works
            </Link>
          </li>
          <li>
            <Link href="#security" className="hover:text-foreground">
              Security
            </Link>
          </li>
          <li>
            <Link href="#pricing" className="hover:text-foreground">
              Pricing
            </Link>
          </li>
          <li>
            <Link href="#resources" className="hover:text-foreground">
              Resources
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Login
          </Link>
          <Link href="/register/organization">
            <Button variant="default" size="sm">
              Get Started
            </Button>
          </Link>
        </div>
        <div className=" items-center gap-3 md:flex">
          <ModeToggle />
          {/* <FullScreenButton /> */}
        </div>
      </nav>
    </header>
  );
}
