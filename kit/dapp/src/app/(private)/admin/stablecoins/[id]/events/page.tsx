import { AssetEventsTable } from '@/components/blocks/asset-events-table/asset-events-table';
import type { Metadata } from 'next';
import type { Address } from 'viem';

export const metadata: Metadata = {
  title: 'Transactions',
  description: 'Inspect all transactions on the network.',
};

export default async function StablecoinEventsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <AssetEventsTable variables={{ asset: id as Address }} />;
}
