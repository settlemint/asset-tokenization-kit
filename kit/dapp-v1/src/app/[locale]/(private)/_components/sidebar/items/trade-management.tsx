"use client";

import { NavMain } from "@/components/layout/nav-main";
import { RefreshCWIcon } from "@/components/ui/refresh-cw";
import { useTranslations } from "next-intl";

export function TradeManagement() {
  const t = useTranslations("admin.sidebar.trade-management");

  return (
    <NavMain
      items={[
        {
          groupTitle: t("group-title"),
          items: [
            {
              label: t("xvp-settlement"),
              icon: (
                <RefreshCWIcon className="size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
              ),
              path: "/trades/xvp",
            },
          ],
        },
      ]}
    />
  );
}
