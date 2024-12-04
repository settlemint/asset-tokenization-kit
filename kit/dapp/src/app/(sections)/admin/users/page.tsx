import { UsersTable } from './_components/user-table';

export default function IssuerTokens() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">Users</h2>
      </div>
      <UsersTable />
    </>
  );
}
