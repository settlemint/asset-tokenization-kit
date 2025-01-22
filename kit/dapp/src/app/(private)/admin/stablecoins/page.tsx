import { AssetTable } from '@/components/blocks/asset-table/asset-table';
import { columns, icons } from './_components/columns';
import { getStableCoins } from './_components/data';

export default function StableCoinsPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">Stable Coins</h2>
      </div>
      <AssetTable type="stablecoins" dataAction={getStableCoins} columns={columns} icons={icons} />
    </>
  );
}
