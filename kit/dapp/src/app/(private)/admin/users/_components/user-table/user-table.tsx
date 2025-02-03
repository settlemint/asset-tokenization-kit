import { getUsers } from '@/app/(private)/admin/users/_components/data';
import { DataTable } from '@/components/blocks/data-table/data-table';
import { getActiveOrganizationId } from '@/lib/auth/auth';
import { columns } from './user-table-columns';
import { icons } from './user-table-icons';

export async function UserTable() {
  const organizationId = await getActiveOrganizationId();
  const users = await getUsers(organizationId);

  return <DataTable columns={columns} data={users} icons={icons} name="users" />;
}
