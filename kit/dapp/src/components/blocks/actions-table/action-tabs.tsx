import { getUser } from "@/lib/auth/get-user";
import type { ActionType } from "@/lib/queries/actions/actions-schema";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { TabNavigation } from "../tab-navigation/tab-navigation";
import { BadgeLoader, BadgeSpinner } from "./badge-loader";

const tabs = async ({
  locale,
  path,
  type,
}: {
  locale: Locale;
  path: string;
  type: ActionType;
}) => {
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
              status="PENDING"
              type={type}
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
              status="UPCOMING"
              type={type}
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
              status="COMPLETED"
              type={type}
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
  type,
}: {
  locale: Locale;
  path: string;
  type: ActionType;
}) {
  const tabItems = await tabs({ locale, path, type });

  return <TabNavigation items={tabItems} />;
}
