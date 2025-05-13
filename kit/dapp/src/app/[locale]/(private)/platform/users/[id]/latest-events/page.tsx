import { AssetEventsTable } from "@/components/blocks/asset-events-table/asset-events-table";
import { DataTableSkeleton } from "@/components/blocks/data-table/data-table-skeleton";
import { getUserDetail } from "@/lib/queries/user/user-detail";
import { Suspense } from "react";

interface LatestTransactionsPageProps {
  params: Promise<{ id: string }>;
}

export default async function LatestEventsPage({
  params,
}: LatestTransactionsPageProps) {
  const { id } = await params;
  const user = await getUserDetail({ id });

  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <AssetEventsTable sender={user.wallet} />
    </Suspense>
  );
}
