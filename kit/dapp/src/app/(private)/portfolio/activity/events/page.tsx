import { AssetEventsTable } from '@/components/blocks/asset-events-table/asset-events-table';
import { getAuthenticatedUser } from '@/lib/auth/auth';
import type { Metadata } from 'next';
import type { Address } from 'viem';

export const metadata: Metadata = {
  title: 'Events',
  description: 'Inspect all your events on the network.',
};

export default async function EventsPage() {
  const user = await getAuthenticatedUser();
  return <AssetEventsTable variables={{ sender: user.wallet as Address }} />;
}
