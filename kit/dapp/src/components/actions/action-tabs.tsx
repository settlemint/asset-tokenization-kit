import { TabNavigation } from "@/components/tab-navigation/tab-navigation";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface ActionTabsProps {
  path: string;
}

export function ActionTabs({ path }: ActionTabsProps) {
  const { t } = useTranslation("actions");

  const tabs = useMemo(
    () => [
      {
        name: t("tabs.name.pending"),
        href: `/${path}/pending`,
      },
      {
        name: t("tabs.name.upcoming"),
        href: `/${path}/upcoming`,
      },
      {
        name: t("tabs.name.completed"),
        href: `/${path}/completed`,
      },
    ],
    [path, t]
  );

  return <TabNavigation items={tabs} />;
}
