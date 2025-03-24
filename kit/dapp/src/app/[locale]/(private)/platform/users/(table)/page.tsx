import { DataTable } from "@/components/blocks/data-table/data-table";
import { PageHeader } from "@/components/layout/page-header";
import { getUser } from "@/lib/auth/utils";
import { getUserList } from "@/lib/queries/user/user-list";
import { getTranslations } from "next-intl/server";
import { Columns, icons } from "./_components/columns";

export default async function UsersPage() {
  const currentUser = await getUser();
  const users = await getUserList({ currentUser });
  const t = await getTranslations("private.users");

  return (
    <>
      <PageHeader title={t("title")} section={t("platform-management")} />
      <DataTable
        columns={Columns}
        data={users}
        icons={icons}
        name="user"
        initialSorting={[{ id: "name", desc: false }]}
      />
    </>
  );
}
