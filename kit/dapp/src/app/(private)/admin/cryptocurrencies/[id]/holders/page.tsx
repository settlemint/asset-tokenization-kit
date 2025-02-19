import { AssetHoldersTable } from '@/components/blocks/asset-holders-table/asset-holders-table';
import { assetConfig } from '@/lib/config/assets';
import type { Metadata } from 'next';
import type { Address } from 'viem';
import { getCryptocurrency } from '../(details)/_components/data';

export const metadata: Metadata = {
  title: 'Holders',
  description: 'Inspect all holders of the cryptocurrency.',
};

export default async function CryptocurrencyHoldersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { decimals } = await getCryptocurrency(id);

  return <AssetHoldersTable assetConfig={assetConfig.cryptocurrency} asset={id as Address} decimals={decimals} />;
}
