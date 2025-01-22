import { AssetTable } from '@/components/blocks/asset-table/asset-table';
import { columns, icons } from './_components/columns';
import { getBonds } from './_components/data';

export default function BondsPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">Bonds</h2>
      </div>
      <AssetTable type="bonds" dataAction={getBonds} columns={columns} icons={icons} />
    </>
  );
}
