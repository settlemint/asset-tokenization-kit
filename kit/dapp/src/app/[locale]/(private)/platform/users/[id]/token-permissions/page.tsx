import UserPermissionsTable from "@/components/blocks/user-permissions-table/user-permissions-table";
import { getUserDetail } from "@/lib/queries/user/user-detail";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";

interface PageProps {
  params: Promise<{ id: string; locale: Locale }>;
}

export default async function PermissionsPage({ params }: PageProps) {
  const { id, locale } = await params;
  const user = await getUserDetail({ id });
  const t = await getTranslations({
    namespace: "private.users.permissions.table",
    locale,
  });

  return <UserPermissionsTable wallet={user.wallet} title={t("title")} />;
}
