import { TabNavigation } from "@/components/blocks/tab-navigation/tab-navigation";
import { TopInfo } from "@/components/blocks/top-info/top-info";
import { PageHeader } from "@/components/layout/page-header";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";
import { CreateApiKeyButton } from "./_components/create-api-key-button";

export default async function ApiLayout({ children }: PropsWithChildren) {
  const t = await getTranslations("portfolio.settings.api-keys");

  return (
    <>
      <PageHeader
        title={t("title")}
        section={t("portfolio-management")}
        button={<CreateApiKeyButton />}
      />

      <TopInfo title={t("swagger-title")}>
        <div className="flex flex-col gap-4">
          <p>{t("swagger-description")}</p>
        </div>
      </TopInfo>

      <div className="relative mt-4 space-y-2">
        <TabNavigation
          items={[
            {
              name: t("api-keys"),
              href: "/portfolio/settings/api",
            },
            {
              name: t("api-docs"),
              href: "/portfolio/settings/api/docs",
            },
          ]}
        />
      </div>

      {children}
    </>
  );
}
