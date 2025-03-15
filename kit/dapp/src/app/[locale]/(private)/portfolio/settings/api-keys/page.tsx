import { PageHeader } from "@/components/layout/page-header";
import { getTranslations } from "next-intl/server";

export default async function ApiKeysPage() {
  const t = await getTranslations("portfolio.settings.api-keys");

  return (
    <>
      <PageHeader title={t("title")} section={t("portfolio-management")} />
    </>
  );
}
