import { icons } from '@/app/(private)/admin/equities/_components/table/columns';
import { AssetTable } from '@/components/blocks/asset-table/asset-table';
import { assetConfig } from '@/lib/config/assets';
import { columns } from './_components/table/columns';
import { getFunds } from './_components/table/data';

export default function FundsPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">Funds</h2>
      </div>
      <AssetTable
        assetConfig={assetConfig.fund}
        dataAction={getFunds}
        columns={columns}
        icons={icons}
        refetchInterval={5000}
      />
    </>
  );
}
