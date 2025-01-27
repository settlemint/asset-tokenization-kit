import { icons } from '@/app/(private)/admin/equities/_components/columns';
import { AssetTable } from '@/components/blocks/asset-table/asset-table';
import { columns } from './_components/columns';
import { getEquities } from './_components/data';

export default function EquitiesPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">Equities</h2>
      </div>
      <AssetTable type="equities" dataAction={getEquities} columns={columns} icons={icons} refetchInterval={5000} />
    </>
  );
}
