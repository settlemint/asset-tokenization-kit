"use client";

import { NavMain } from "@/components/layout/nav-main";
import { ArrowRightLeft } from "lucide-react";
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
              label: t("dvp-swap"),
              icon: <ArrowRightLeft className="size-4" />,
              path: "/trades/dvp",
            },
          ],
        },
      ]}
    />
  );
}
