import { AssetEventsTable } from "@/components/blocks/asset-events-table/asset-events-table";
import { getUser } from "@/lib/auth/utils";
import type { Address } from "viem";

interface EventsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ActivityPage({ params }: EventsPageProps) {
  const { locale } = await params;
  const user = await getUser();

  return <AssetEventsTable sender={user.wallet as Address} />;
}
