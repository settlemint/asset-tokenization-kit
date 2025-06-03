import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { TabNavigation } from "../tab-navigation/tab-navigation";

const tabs = async ({ locale, path }: { locale: Locale; path: string }) => {
  const t = await getTranslations({
    locale,
    namespace: "private.airdrops",
  });

  return [
    {
      name: <>{t("tabs.details")}</>,
      href: `/${path}`,
    },
  ];
};

export async function AirdropTabs({
  locale,
  path,
}: {
  locale: Locale;
  path: string;
}) {
  const tabItems = await tabs({ locale, path });

  return <TabNavigation items={tabItems} />;
}
