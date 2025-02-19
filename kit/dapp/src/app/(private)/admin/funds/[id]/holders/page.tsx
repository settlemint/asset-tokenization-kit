import { AssetHoldersTable } from '@/components/blocks/asset-holders-table/asset-holders-table';
import { assetConfig } from '@/lib/config/assets';
import type { Metadata } from 'next';
import type { Address } from 'viem';
import { getFund } from '../(details)/_components/data';

export const metadata: Metadata = {
  title: 'Holders',
  description: 'Inspect all holders of the fund.',
};

export default async function FundHoldersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { decimals } = await getFund(id);

  return <AssetHoldersTable assetConfig={assetConfig.fund} asset={id as Address} decimals={decimals} />;
}
