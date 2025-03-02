import {
  icons,
  useUserColumns,
} from "@/app/[locale]/(private)/admin/users/(table)/_components/columns";
import { DataTable } from "@/components/blocks/data-table/data-table";
import { PageHeader } from "@/components/layout/page-header";
import { getUserList } from "@/lib/queries/user/user-list";

export default async function UsersPage() {
  const users = await getUserList();

  return (
    <>
      <PageHeader title="Users" />
      <DataTable
        columnHook={useUserColumns}
        data={users}
        icons={icons}
        name="user"
        initialSorting={[{ id: "name", desc: false }]}
      />
    </>
  );
}
