import { PageHeader } from "@/components/layout/page-header";
import { getSetting } from "@/lib/config/settings";
import { SETTING_KEYS } from "@/lib/db/schema-settings";
import { getTranslations } from "next-intl/server";
import { SettingsForm } from "./_components/settings-form";

export default async function SettingsPage() {
  const t = await getTranslations("admin.platform.settings");
  const baseCurrency = await getSetting(SETTING_KEYS.BASE_CURRENCY);

  return (
    <>
      <PageHeader
        title={t("platform-management")}
        section={t("platform-management")}
      />
      <div className="mb-4 grid grid-cols-1 gap-4 max-w-2xl">
        <SettingsForm defaultBaseCurrency={baseCurrency} />
      </div>
    </>
  );
}
