import { BentoFeatureSection } from "@/app/[locale]/(home)/_components/features";
import { Footer } from "@/app/[locale]/(home)/_components/footer";
import type { Metadata } from "next";
import { type Locale, useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { HeroSection } from "./_components/hero";
import { ThemeImage } from "./_components/theme-image";
import HeroDark from "./assets/hero-dark.webp";
import HeroLight from "./assets/hero-light.webp";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "layout",
  });

  return {
    title: t("header.app-name"),
    description: t("header.app-description"),
  };
}

export default function Home() {
  const t = useTranslations("homepage");

  return (
    <div className="relative flex min-h-[100dvh] flex-col">
      <HeroSection
        subtitle={t("hero-subtitle-regular")}
        description={t("hero-description")}
        ctaText={"bunx @settlemint/sdk-cli@latest create"}
        ctaHref={"https://github.com/settlemint/asset-tokenization-kit"}
        buttons={{
          main: {
            text: t("portfolio"),
            href: "/portfolio",
          },
          secondary: {
            text: t("issuer-portal"),
            href: "/assets",
          },
          tertiary: {
            text: t("documentation"),
            href: "https://console.settlemint.com/documentation/",
          },
        }}
      />

      <div className="relative z-10 mx-auto mt-8 max-w-[1050px] px-4 md:px-10">
        <ThemeImage light={HeroLight} dark={HeroDark} />
      </div>

      <BentoFeatureSection />

      <Footer />
    </div>
  );
}
