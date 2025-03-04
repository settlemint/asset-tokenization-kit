import TransactionsTable from "@/components/blocks/transactions-table/transactions-table";
import { Link } from "@/i18n/routing";
import { getBlockExplorerAllTxUrl } from "@/lib/block-explorer";

export default function TransactionsPage() {
  const explorerUrl = getBlockExplorerAllTxUrl();
  return (
    <>
      <TransactionsTable />
      {explorerUrl && (
        <div className="mt-2 flex flex-col gap-4 text-right text-muted-foreground text-sm">
          <Link href={explorerUrl}>View all transactions in the explorer</Link>
        </div>
      )}
    </>
  );
}
