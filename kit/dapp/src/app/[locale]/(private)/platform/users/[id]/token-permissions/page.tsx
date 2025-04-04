import UserPermissionsTable from "@/components/blocks/user-permissions-table/user-permissions-table";
import { getUserDetail } from "@/lib/queries/user/user-detail";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";

interface PageProps {
  params: Promise<{ id: string; locale: Locale }>;
}

export default async function PermissionsPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getUserDetail({ id });
  const t = await getTranslations("private.users.permissions.table");

  return <UserPermissionsTable wallet={user.wallet} title={t("title")} />;
}
