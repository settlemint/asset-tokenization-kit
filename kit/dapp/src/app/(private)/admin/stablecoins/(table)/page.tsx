import { AssetTable } from '@/components/blocks/asset-table/asset-table';
import { PageHeader } from '@/components/layout/page-header';
import { assetConfig } from '@/lib/config/assets';
import type { Metadata } from 'next';
import { columns } from './_components/columns';
import { getStableCoins } from './_components/data';

export const metadata: Metadata = {
  title: 'Stable Coins',
  description: 'View and manage your stable coins.',
};

export default function StableCoinsPage() {
  return (
    <>
      <PageHeader title="Stable Coins" />
      <AssetTable assetConfig={assetConfig.stablecoin} dataAction={getStableCoins} columns={columns} />
    </>
  );
}
