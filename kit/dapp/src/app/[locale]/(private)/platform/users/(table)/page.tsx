import { DataTable } from "@/components/blocks/data-table/data-table";
import { PageHeader } from "@/components/layout/page-header";
import { handleAccessControlError } from "@/lib/auth/next-error-handling";
import { getUserList } from "@/lib/queries/user/user-list";
import { getTranslations } from "next-intl/server";
import { Columns, icons } from "./_components/columns";

export default async function UsersPage() {
  const users = await getUserList({
    onError: handleAccessControlError,
  });
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
