import { DataTable } from "@/components/blocks/data-table/data-table";
import { PageHeader } from "@/components/layout/page-header";
import { getUserList } from "@/lib/queries/user/user-list";
import { getTranslations } from "next-intl/server";
import { columns, icons } from "./_components/columns";

export default async function UsersPage() {
  const users = await getUserList();
  const t = await getTranslations("admin.users");

  return (
    <>
      <PageHeader title={t("title")} section={t("platform-management")} />
      <DataTable
        columns={columns}
        data={users}
        icons={icons}
        name="user"
        initialSorting={[{ id: "name", desc: false }]}
      />
    </>
  );
}
