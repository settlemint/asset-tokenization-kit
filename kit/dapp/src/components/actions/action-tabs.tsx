import { TabNavigation } from "@/components/tab-navigation/tab-navigation";
import { Suspense, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { BadgeLoader, BadgeSpinner } from "./badge-loader";

export type ActionType = "Admin" | "User";

interface ActionTabsProps {
  path: string;
  type: ActionType;
}

export function ActionTabs({ path }: ActionTabsProps) {
  const { t } = useTranslation("actions");

  const tabs = useMemo(
    () => [
      {
        name: (
          <>
            {t("tabs.name.pending")}
            <Suspense fallback={<BadgeSpinner />}>
              <BadgeLoader />
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
              <BadgeLoader />
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
              <BadgeLoader />
            </Suspense>
          </>
        ),
        href: `/${path}/completed`,
      },
    ],
    [path, t]
  );

  return <TabNavigation items={tabs} />;
}
