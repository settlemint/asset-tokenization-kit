import { UsersTable } from "./_components/user-table";

export default function IssuerTokens() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
      </div>
      <UsersTable />
    </>
  );
}
