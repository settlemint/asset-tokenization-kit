import { DataTable } from '@/components/blocks/data-table/data-table';
import { getStablecoinBalances } from './data';
import { columns } from './holders-columns';
import { HoldersTableActions } from './holders-table-actions';

type HoldersTableProps = {
  id: string;
};

export async function HoldersTable({ id }: HoldersTableProps) {
  const balances = await getStablecoinBalances(id);

  return <DataTable columns={columns} data={balances} name="Holders" rowActions={HoldersTableActions} />;
}
