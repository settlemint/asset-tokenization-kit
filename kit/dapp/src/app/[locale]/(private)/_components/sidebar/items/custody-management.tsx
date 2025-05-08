"use client";
import { NavMain } from "@/components/layout/nav-main";
import { KeySquareIcon } from "@/components/ui/key-square";
import { useTranslations } from "next-intl";
import { useFeatureFlagEnabled } from "posthog-js/react";

export function CustodyManagement() {
  const t = useTranslations("admin.sidebar.custody-management");
  const flagEnabled = useFeatureFlagEnabled("custody-management");

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
              label: t("multisig-vaults"),
              icon: (
                <KeySquareIcon className="size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
              ),
              path: "/vaults",
            },
          ],
        },
      ]}
    />
  );
}
