import TransactionsTable from "@/components/blocks/transactions-table/transactions-table";
import { Link } from "@/i18n/routing";
import { getBlockExplorerAllTxUrl } from "@/lib/block-explorer";
import { metadata } from "@/lib/config/metadata";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "admin.activity",
  });

  return {
    title: {
      ...metadata.title,
      default: t("tabs.recent-transactions"),
    },
    description: t("page-description"),
  };
}

export default async function TransactionsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const explorerUrl = getBlockExplorerAllTxUrl();
  const t = await getTranslations({
    locale,
    namespace: "admin.activity",
  });
  return (
    <>
      <TransactionsTable />
      {explorerUrl && (
        <div className="mt-2 flex flex-col gap-4 text-right text-muted-foreground text-sm">
          <Link href={explorerUrl}>{t("view-all")}</Link>
        </div>
      )}
    </>
  );
}
