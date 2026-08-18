import Link from "next/link";
import React from "react";

export default function MarketingFooter() {
  return (
    <footer className="bg-surface py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-6 sm:grid-cols-4">
          <div>
            <div className="font-bold">Digital Visitors Log</div>
            <div className="mt-2 text-sm text-muted-foreground">Secure visitor management for modern organizations.</div>
          </div>
          <div>
            <div className="font-semibold">Product</div>
            <ul className="mt-2 text-sm text-muted-foreground">
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#pricing">Pricing</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">Company</div>
            <ul className="mt-2 text-sm text-muted-foreground">
              <li><Link href="#">About</Link></li>
              <li><Link href="#">Contact</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">Legal</div>
            <ul className="mt-2 text-sm text-muted-foreground">
              <li><Link href="#">Privacy Policy</Link></li>
              <li><Link href="#">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">© 2026 Digital Visitors Log. All rights reserved.</div>
      </div>
    </footer>
  )
}
