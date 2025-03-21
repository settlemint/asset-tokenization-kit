import TransactionsTable from "@/components/blocks/transactions-table/transactions-table";
import { Link } from "@/i18n/routing";
import { getUser } from "@/lib/auth/utils";
import { getBlockExplorerAllTxUrl } from "@/lib/block-explorer";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface TransactionsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function TransactionsPage({
  params,
}: TransactionsPageProps) {
  const { locale } = await params;
  const explorerUrl = getBlockExplorerAllTxUrl();
  const t = await getTranslations({
    locale,
    namespace: "admin.activity",
  });
  const user = await getUser();

  return (
    <>
      <TransactionsTable from={user.wallet as Address} />
      {explorerUrl && (
        <div className="mt-2 flex flex-col gap-4 text-right text-muted-foreground text-sm">
          <Link href={explorerUrl}>{t("view-all")}</Link>
        </div>
      )}
    </>
  );
}
