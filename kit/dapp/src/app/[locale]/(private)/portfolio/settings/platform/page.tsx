import { SettingsForm } from "@/app/[locale]/(private)/platform/settings/(home)/_components/settings-form";
import { PageHeader } from "@/components/layout/page-header";
import { getSetting } from "@/lib/config/settings";
import { SETTING_KEYS } from "@/lib/db/schema-settings";
import { getTranslations } from "next-intl/server";

export default async function PlatformSettingsPage() {
  const t = await getTranslations("admin.sidebar.portfolio-management");
  const baseCurrency = await getSetting(SETTING_KEYS.BASE_CURRENCY);

  return (
    <>
      <PageHeader title={t("platform")} section={t("settings")} />
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <SettingsForm defaultBaseCurrency={baseCurrency} />
      </div>
    </>
  );
}
