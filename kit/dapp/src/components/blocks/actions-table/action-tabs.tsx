import { getUser } from "@/lib/auth/utils";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { TabNavigation } from "../tab-navigation/tab-navigation";
import { BadgeLoader, BadgeSpinner } from "./badge-loader";

const tabs = async ({ locale, path }: { locale: Locale; path: string }) => {
  const t = await getTranslations({
    locale,
    namespace: "actions",
  });
  const user = await getUser();

  return [
    {
      name: (
        <>
          {t("tabs.name.pending")}
          <Suspense fallback={<BadgeSpinner />}>
            <BadgeLoader
              state="PENDING"
              type="Admin"
              userAddress={user.wallet}
            />
          </Suspense>
        </>
      ),
      href: `/${path}/pending`,
    },
    {
      name: (
        <>
          {t("tabs.name.upcoming")}
          <Suspense fallback={<BadgeSpinner />}>
            <BadgeLoader
              state="UPCOMING"
              type="Admin"
              userAddress={user.wallet}
            />
          </Suspense>
        </>
      ),
      href: `/${path}/upcoming`,
    },
    {
      name: (
        <>
          {t("tabs.name.completed")}
          <Suspense fallback={<BadgeSpinner />}>
            <BadgeLoader
              state="COMPLETED"
              type="Admin"
              userAddress={user.wallet}
            />
          </Suspense>
        </>
      ),
      href: `/${path}/completed`,
    },
  ];
};

export async function ActionTabs({
  locale,
  path,
}: {
  locale: Locale;
  path: string;
}) {
  const tabItems = await tabs({ locale, path });

  return <TabNavigation items={tabItems} />;
}
