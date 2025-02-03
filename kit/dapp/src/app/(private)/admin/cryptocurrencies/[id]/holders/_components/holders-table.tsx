import { DataTable } from '@/components/blocks/data-table/data-table';
import { getCryptocurrencyBalances } from './data';
import { columns } from './holders-columns';

type HoldersTableProps = {
  id: string;
};

export async function HoldersTable({ id }: HoldersTableProps) {
  const balances = await getCryptocurrencyBalances(id);

  return <DataTable columns={columns} data={balances} name="Holders" />;
}
