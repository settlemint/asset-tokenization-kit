import { DataTable } from "@/components/blocks/data-table/data-table";
import { PageHeader } from "@/components/layout/page-header";
import { getUser } from "@/lib/auth/utils";
import { metadata } from "@/lib/config/metadata";
import { getXvPSettlementList } from "@/lib/queries/xvp/xvp-list";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { columns } from "./(table)/columns";
import { CreateXvPForm } from "./_components/create-xvp/form";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "trade-management.page",
  });

  return {
    title: {
      ...metadata.title,
      default: t("xvp"),
    },
    description: t("xvp"),
  };
}

export default async function XvpPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const [t, user] = await Promise.all([
    getTranslations({
      locale,
      namespace: "trade-management.page",
    }),
    getUser(),
  ]);
  const xvpSettlements = await getXvPSettlementList(user.currency, user.wallet);

  return (
    <>
      <PageHeader title={t("xvp")} button={<CreateXvPForm asButton />} />
      <DataTable columns={columns} data={xvpSettlements} name={t("xvp")} />
    </>
  );
}
