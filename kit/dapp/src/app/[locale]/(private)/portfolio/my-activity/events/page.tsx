import { AssetEventsTable } from '@/components/blocks/asset-events-table/asset-events-table';
import { getUser } from '@/lib/auth/utils';
import type { Address } from 'viem';

export default async function ActivityPage() {
  const user = await getUser();

  return <AssetEventsTable sender={user.wallet as Address} />;
}
