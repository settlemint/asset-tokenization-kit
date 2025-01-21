import { UserTable } from './_components/user-table/user-table';

export default function UsersPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">Users</h2>
      </div>
      <UserTable />
    </>
  );
}
