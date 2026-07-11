import { Navigation } from "@/components/pages/landing/navigation";
import { HeroSection } from "@/components/pages/landing/hero-section";
import { WhyDurioSection } from "@/components/pages/landing/why-durio-section";
import { ShowcaseSection } from "@/components/pages/landing/showcase-section";
import { MeetDuriaSection } from "@/components/pages/landing/meet-duria-section";
import { AndroidSection } from "@/components/pages/landing/android-section";
import { CtaFooter } from "@/components/pages/landing/cta-footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-foreground selection:bg-[#ff6a00]/30 selection:text-white">
      <Navigation />
      <HeroSection />
      <WhyDurioSection />
      <ShowcaseSection />
      <MeetDuriaSection />
      <AndroidSection />
      <CtaFooter />
    </main>
  );
}
