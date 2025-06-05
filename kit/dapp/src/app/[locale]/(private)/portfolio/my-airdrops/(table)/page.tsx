import MyAirdropsTable from "@/components/blocks/my-airdrops-table/my-airdrops-table";
import { PageHeader } from "@/components/layout/page-header";
import { getUser } from "@/lib/auth/utils";
import { metadata } from "@/lib/config/metadata";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";

interface MyAirdropsPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({
  params,
}: MyAirdropsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "portfolio.my-airdrops",
  });

  return {
    title: {
      ...metadata.title,
      default: t("title"),
    },
    description: t("portfolio-management"),
  };
}

export default async function MyAirdropsPage({ params }: MyAirdropsPageProps) {
  const { locale } = await params;

  const [t, user] = await Promise.all([
    getTranslations({
      locale,
      namespace: "portfolio.my-airdrops",
    }),
    getUser(),
  ]);

  return (
    <>
      <PageHeader title={t("title")} section={t("portfolio-management")} />
      <MyAirdropsTable wallet={user.wallet} title={t("title")} />
    </>
  );
}
