import { DataTable } from '@/components/blocks/data-table/data-table';
import { getUsers } from './data';
import { columns, icons } from './user-table-columns';

export async function UserTable() {
  const users = await getUsers();

  return (
    <DataTable
      columns={columns}
      data={users}
      icons={icons}
      name="users"
      initialSorting={[{ id: 'name', desc: false }]}
    />
  );
}
