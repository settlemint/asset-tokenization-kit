import { PageHeader } from "@/components/layout/page-header";
import { getSetting } from "@/lib/config/settings";
import { SETTING_KEYS } from "@/lib/db/schema-settings";
import { getUserCount } from "@/lib/queries/user/user-count";
import { getTranslations } from "next-intl/server";
import { PermissionsCard } from "./_components/permissions-card";
import { SettingsForm } from "./_components/settings-form";

export default async function SettingsPage() {
  const t = await getTranslations("admin.platform.settings");
  const baseCurrency = await getSetting(SETTING_KEYS.BASE_CURRENCY);
  const { adminUsersCount } = await getUserCount();

  return (
    <>
      <PageHeader
        title={t("platform-management")}
        section={t("platform-management")}
      />
      <div className="mb-4 grid grid-cols-2 gap-4">
        <SettingsForm defaultBaseCurrency={baseCurrency} />
        <PermissionsCard adminCount={adminUsersCount} />
      </div>
    </>
  );
}
