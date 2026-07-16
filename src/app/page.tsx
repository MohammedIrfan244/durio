import { Navigation } from "@/components/pages/landing/navigation";
import Image from "next/image";
import images from "@/assets/images.json";
import { HeroSection } from "@/components/pages/landing/hero-section";
import { WhyDurioSection } from "@/components/pages/landing/why-durio-section";
import { ShowcaseSection } from "@/components/pages/landing/showcase-section";
import { MeetDuriaSection } from "@/components/pages/landing/meet-duria-section";
import { AndroidSection } from "@/components/pages/landing/android-section";
import { CtaFooter } from "@/components/pages/landing/cta-footer";
import MobileEntryWrapper from "@/components/layout/mobile-entry-wrapper";
import { StorySection } from "@/components/pages/landing/story-section";

export default function LandingPage() {
  return (
    <MobileEntryWrapper>
      <div className="show-on-web">
        <main className="min-h-screen bg-[#0A0A0A] text-foreground selection:bg-[#ff6a00]/30 selection:text-white">
          <Navigation />
          <HeroSection />
          <WhyDurioSection />
          <ShowcaseSection />
          <MeetDuriaSection />
          <AndroidSection />
          <StorySection />
          <CtaFooter />
        </main>
      </div>
      <div className="show-on-capacitor relative min-h-[100dvh] w-full overflow-hidden bg-black text-white">
        <div className="dvd-bounce">
          <Image
            src={images.duria}
            alt="Duria Loading"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </MobileEntryWrapper>
  );
}
