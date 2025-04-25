import { AssetEventsSkeleton } from "@/components/blocks/asset-events-table/asset-events-skeleton";
import { AssetEventsTable } from "@/components/blocks/asset-events-table/asset-events-table";
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
    <Suspense fallback={<AssetEventsSkeleton />}>
      <AssetEventsTable sender={user.wallet} />
    </Suspense>
  );
}
