import { PageHeader } from "@/components/layout/page-header";
import { metadata } from "@/lib/config/metadata";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { CreateVaultForm } from "./_components/create-form/form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "custody.vaults.page",
  });

  return {
    title: {
      ...metadata.title,
      default: t("vaults"),
    },
    description: t("vaults-description"),
  };
}

export default async function XvpPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "custody.vaults.page",
  });
  // const xvpSettlements = await getXvPSettlementList();

  return (
    <>
      <PageHeader title={t("vaults")} button={<CreateVaultForm asButton />} />
      {/* <DataTable columns={columns} data={xvpSettlements} name={t("xvp")} /> */}
    </>
  );
}
