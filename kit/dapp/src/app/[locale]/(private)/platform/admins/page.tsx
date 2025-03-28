import { DataTable } from "@/components/blocks/data-table/data-table";
import { PageHeader } from "@/components/layout/page-header";
import { getAdminUserList } from "@/lib/queries/user/user-list";
import { getTranslations } from "next-intl/server";
import { Columns, icons } from "../users/(table)/_components/columns";

export default async function AdminsPage() {
  const admins = await getAdminUserList();
  const t = await getTranslations("admin.platform.settings");

  return (
    <>
      <PageHeader
        title={t("permissions-title")}
        section={t("platform-management")}
      />
      <DataTable
        columns={Columns}
        data={admins}
        icons={icons}
        name="admin"
        initialSorting={[{ id: "name", desc: false }]}
      />
    </>
  );
}
