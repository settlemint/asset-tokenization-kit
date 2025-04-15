import MyAssetsTable from "@/components/blocks/my-assets-table/my-assets-table";
import { PageHeader } from "@/components/layout/page-header";
import { getUser } from "@/lib/auth/utils";
import { metadata } from "@/lib/config/metadata";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { TransferForm } from "../../_components/transfer-form/form";

interface MyAssetsPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({
  params,
}: MyAssetsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "portfolio.my-assets",
  });

  return {
    title: {
      ...metadata.title,
      default: t("title"),
    },
    description: t("portfolio-management"),
  };
}

export default async function MyAssetsPage({ params }: MyAssetsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "portfolio.my-assets",
  });
  const user = await getUser();

  return (
    <>
      <PageHeader title={t("title")} section={t("portfolio-management")} />
      <div className="flex items-center justify-end mb-4 -mt-12 z-10">
        <TransferForm userAddress={user.wallet} asButton />
      </div>
      <MyAssetsTable wallet={user.wallet} title={t("title")} />
    </>
  );
}
