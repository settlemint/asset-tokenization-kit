import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { HeroSection } from "./_components/hero";

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
  return (
    <div className="relative flex min-h-[100dvh] flex-col">
      <HeroSection />
    </div>
  );
}
