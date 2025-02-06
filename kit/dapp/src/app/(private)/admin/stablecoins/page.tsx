import { AssetTable } from '@/components/blocks/asset-table/asset-table';
import { assetConfig } from '@/lib/config/assets';
import type { Metadata } from 'next';
import { columns, icons } from './_components/table/columns';
import { getStableCoins } from './_components/table/data';

export const metadata: Metadata = {
  title: 'Stable Coins',
  description: 'View and manage your stable coins.',
};

export default function StableCoinsPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">Stable Coins</h2>
      </div>
      <AssetTable
        assetConfig={assetConfig.stablecoin}
        dataAction={getStableCoins}
        columns={columns}
        icons={icons}
        refetchInterval={5000}
      />
    </>
  );
}
