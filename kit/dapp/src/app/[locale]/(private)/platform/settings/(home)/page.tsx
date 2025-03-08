import { PageHeader } from "@/components/layout/page-header";
import { getTranslations } from "next-intl/server";

export default async function SettingsPage() {
  const t = await getTranslations("admin.platform.settings");

  return (
    <>
      <PageHeader title="Settings" section={t("platform-management")} />
    </>
  );
}
