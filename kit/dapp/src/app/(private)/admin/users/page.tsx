import { UserTable } from './_components/user-table';

export default function UsersPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <UserTable />
    </div>
  );
}
