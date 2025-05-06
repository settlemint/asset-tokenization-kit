"use client";

import { NavMain } from "@/components/layout/nav-main";
import { ArrowRightLeft } from "lucide-react";
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
              icon: <ArrowRightLeft className="size-4" />,
              path: "/trades/xvp",
            },
          ],
        },
      ]}
    />
  );
}
