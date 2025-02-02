import { DataTable } from '@/components/blocks/data-table/data-table';
import { getFundBalances } from './data';
import { columns } from './holders-columns';

type HoldersTableProps = {
  id: string;
};

export async function HoldersTable({ id }: HoldersTableProps) {
  const balances = await getFundBalances(id);

  return <DataTable columns={columns} data={balances} name="Holders" />;
}
