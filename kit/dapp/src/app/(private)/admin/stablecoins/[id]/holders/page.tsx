import { AssetHoldersTable } from '@/components/blocks/asset-holders-table/asset-holders-table';
import { assetConfig } from '@/lib/config/assets';
import type { Metadata } from 'next';
import type { Address } from 'viem';
import { getStableCoin } from '../(details)/_components/data';

export const metadata: Metadata = {
  title: 'Holders',
  description: 'Inspect all holders of the stablecoin.',
};

export default async function StablecoinHoldersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { decimals } = await getStableCoin(id);

  return <AssetHoldersTable assetConfig={assetConfig.stablecoin} asset={id as Address} decimals={decimals} />;
}
