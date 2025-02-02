import { AssetTable } from '@/components/blocks/asset-table/asset-table';
import { TokenType } from '@/types/token-types';
import { columns, icons } from './_components/table/columns';
import { getBonds } from './_components/table/data';

export default function BondsPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">Bonds</h2>
      </div>
      <AssetTable type={TokenType.Bond} dataAction={getBonds} columns={columns} icons={icons} refetchInterval={5000} />
    </>
  );
}
