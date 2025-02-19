import { getMyAssets } from '@/app/(private)/portfolio/_components/my-assets/data';
import { DataTable } from '@/components/blocks/data-table/data-table';
import { columns } from './table/columns';

export async function MyAssetsTable() {
  const myAssets = await getMyAssets();

  return <DataTable columns={columns} data={myAssets.balances} name="my-assets" />;
}
