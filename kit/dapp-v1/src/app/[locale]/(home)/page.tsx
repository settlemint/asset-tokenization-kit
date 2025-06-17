import { BackgroundDecoration } from "./_components/background-decoration";
import { Features } from "./_components/features";
import { FooterSection } from "./_components/footer";
import { HeroHeader } from "./_components/header";
import { HeroVisualSection } from "./_components/hero-visual-section";
import { Pricing } from "./_components/pricing";

export default function HeroSection() {
  return (
    <>
      <HeroHeader />
      <main className="overflow-hidden">
        <BackgroundDecoration />
        <HeroVisualSection />
        <Features />
        <Pricing />
      </main>
      <FooterSection />
    </>
  );
}
