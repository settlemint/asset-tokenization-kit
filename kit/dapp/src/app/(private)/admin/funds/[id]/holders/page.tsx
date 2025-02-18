import { AssetHoldersTable } from '@/components/blocks/asset-holders-table/asset-holders-table';
import { assetConfig } from '@/lib/config/assets';
import type { Metadata } from 'next';
import type { Address } from 'viem';

export const metadata: Metadata = {
  title: 'Holders',
  description: 'Inspect all holders of the fund.',
};

export default async function FundHoldersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <AssetHoldersTable assetConfig={assetConfig.fund} asset={id as Address} />;
}
