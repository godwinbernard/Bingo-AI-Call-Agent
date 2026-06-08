import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { LogosSection } from "@/components/sections/LogosSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { DashboardFeature } from "@/components/sections/DashboardFeature";
import { ScriptBuilderFeature } from "@/components/sections/ScriptBuilderFeature";
import { ComplianceSection } from "@/components/sections/ComplianceSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { HelpBot } from "@/components/HelpBot";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <LogosSection />
        <FeaturesSection />
        <HowItWorksSection />
        <DashboardFeature />
        <ScriptBuilderFeature />
        <ComplianceSection />
        <PricingSection />
        <TestimonialsSection />
        <FaqSection />
        <ContactSection />
        <CtaSection />
      </main>
      <Footer />
      <HelpBot />
    </>
  );
}
