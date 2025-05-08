"use client";

import { NavMain } from "@/components/layout/nav-main";
import { RefreshCWIcon } from "@/components/ui/refresh-cw";
import { useTranslations } from "next-intl";
import { useFeatureFlagEnabled } from "posthog-js/react";

export function TradeManagement() {
  const t = useTranslations("admin.sidebar.trade-management");
  const flagEnabled = useFeatureFlagEnabled("trade-management");

  if (process.env.NEXT_PUBLIC_POSTHOG_KEY && !flagEnabled) {
    return null;
  }

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
