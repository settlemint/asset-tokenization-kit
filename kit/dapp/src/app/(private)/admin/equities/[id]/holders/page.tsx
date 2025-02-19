import { AssetHoldersTable } from '@/components/blocks/asset-holders-table/asset-holders-table';
import { assetConfig } from '@/lib/config/assets';
import type { Metadata } from 'next';
import type { Address } from 'viem';
import { getEquity } from '../(details)/_components/data';

export const metadata: Metadata = {
  title: 'Holders',
  description: 'Inspect all holders of the equity.',
};

export default async function EquityHoldersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { decimals } = await getEquity(id);

  return <AssetHoldersTable assetConfig={assetConfig.equity} asset={id as Address} decimals={decimals} />;
}
