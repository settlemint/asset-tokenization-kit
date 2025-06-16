import type { TabItemProps } from "@/components/blocks/tab-navigation/tab-item";
import { TabNavigation } from "@/components/blocks/tab-navigation/tab-navigation";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { BadgeSpinner, UserBadgeLoader } from "./user-badge-loader"; // Assuming badge-loader.tsx is in the same directory or adjust path

interface UserTabsProps {
  locale: Locale;
  userId: string;
}

const tabs = async ({
  locale,
  userId,
}: UserTabsProps): Promise<TabItemProps[]> => {
  const t = await getTranslations({
    locale,
    namespace: "private.users.detail.tabs",
  });

  return [
    {
      name: t("details"),
      href: `/platform/users/${userId}`,
    },
    {
      name: (
        <>
          {t("holdings")}
          <Suspense fallback={<BadgeSpinner />}>
            <UserBadgeLoader userId={userId} badgeType="holdings" />
          </Suspense>
        </>
      ),
      href: `/platform/users/${userId}/holdings`,
    },
    {
      name: t("latest-events"),
      href: `/platform/users/${userId}/latest-events`,
    },
    {
      name: t("permissions"),
      href: `/platform/users/${userId}/token-permissions`,
    },
  ];
};

export async function UserTabs(params: UserTabsProps) {
  const tabItems = await tabs(params);

  return <TabNavigation items={tabItems} />;
}
