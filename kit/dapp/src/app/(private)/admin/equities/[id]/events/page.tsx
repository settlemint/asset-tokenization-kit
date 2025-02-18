import { AssetsEventsTable } from '@/components/blocks/assets-events-table/assets-events-table';
import { assetConfig } from '@/lib/config/assets';
import type { Metadata } from 'next';
import type { Address } from 'viem';

export const metadata: Metadata = {
  title: 'Transactions',
  description: 'Inspect all transactions on the network.',
};

export default async function EquitiesEventsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <AssetsEventsTable asset={id as Address} assetConfig={assetConfig.equity} />;
}
