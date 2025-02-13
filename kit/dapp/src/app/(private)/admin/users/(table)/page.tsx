import { PageHeader } from '@/components/layout/page-header';
import { UserTable } from './_components/user-table';

export default function UsersPage() {
  return (
    <>
      <PageHeader title="Users" />
      <UserTable />
    </>
  );
}
