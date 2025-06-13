import UserAssetsTable from "@/components/blocks/user-assets-table/user-assets-table";
import { getUserDetail } from "@/lib/queries/user/user-detail";
import type { Locale } from "@/i18n/locales";
import { getTranslations } from "@/i18n/translation";

interface UserHoldingsPageProps {
  params: Promise<{ locale: Locale; id: string }>;
}

export default async function UserHoldingsPage({
  params,
}: UserHoldingsPageProps) {
  const { id, locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "private.users.holdings",
  });
  const user = await getUserDetail({ id });

  return <UserAssetsTable wallet={user.wallet} title={t("title")} />;
}
