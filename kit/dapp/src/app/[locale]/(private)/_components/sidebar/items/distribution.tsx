"use client";
import { NavMain } from "@/components/layout/nav-main";
import { GiftIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFeatureFlagEnabled } from "posthog-js/react";

export function Distribution() {
  const t = useTranslations("admin.sidebar.distribution");
  const flagEnabled = useFeatureFlagEnabled("airdrop");

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
              label: t("airdrops"),
              icon: (
                <GiftIcon className="size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
              ),
              path: "/distribution/airdrops",
            },
          ],
        },
      ]}
    />
  );
}
