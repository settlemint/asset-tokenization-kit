import { DataTable } from '@/components/blocks/data-table/data-table';
import { getMyAssets } from '../data';
import { columns } from './table/columns';

export async function MyAssetsTable() {
  const myAssets = await getMyAssets();

  return <DataTable columns={columns} data={myAssets} name="my-assets" />;
}
