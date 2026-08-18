"use client"

import React from "react";
import MarketingNavbar from "@/components/marketing/MarketingNavbar";
import HeroSection from "@/components/marketing/HeroSection";
import TrustSection from "@/components/marketing/TrustSection";
import FeaturesSection from "@/components/marketing/FeaturesSection";
import ProductShowcase from "@/components/marketing/ProductShowcase";
import HowItWorks from "@/components/marketing/HowItWorks";
// import MultiTenantSection from "@/components/marketing/MultiTenantSection";
import SecuritySection from "@/components/marketing/SecuritySection";
import AnalyticsSection from "@/components/marketing/AnalyticsSection";
import UseCasesSection from "@/components/marketing/UseCasesSection";
import PricingSection from "@/components/marketing/PricingSection";
import FinalCTA from "@/components/marketing/FinalCTA";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import RevealWrapper from "@/components/marketing/RevealWrapper";

export default function MarketingPage() {
  return (
    <div className="bg-background text-foreground">
      <MarketingNavbar />
      <main className="pt-20">
        <RevealWrapper className=""> <HeroSection /> </RevealWrapper>
        <RevealWrapper> <TrustSection /> </RevealWrapper>
        <RevealWrapper> <FeaturesSection /> </RevealWrapper>
        <RevealWrapper> <ProductShowcase /> </RevealWrapper>
        <RevealWrapper> <HowItWorks /> </RevealWrapper>
        {/* <RevealWrapper> <MultiTenantSection /> </RevealWrapper> */}
        <RevealWrapper> <SecuritySection /> </RevealWrapper>
        <RevealWrapper> <AnalyticsSection /> </RevealWrapper>
        <RevealWrapper> <UseCasesSection /> </RevealWrapper>
        <RevealWrapper> <PricingSection /> </RevealWrapper>
        <RevealWrapper> <FinalCTA /> </RevealWrapper>
      </main>
      <MarketingFooter />
    </div>
  )
}
