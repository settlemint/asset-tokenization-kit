"use client";

import { NavMain } from "@/components/layout/nav-main";
import { UsersIcon } from "@/components/ui/animated-icons/users";
import { useTranslations } from "next-intl";
import { Suspense } from "react";

export function PlatformManagement() {
  const t = useTranslations("admin.sidebar.platform-management");

  return (
    <Suspense>
      <NavMain
        items={[
          {
            groupTitle: t("group-title"),
            items: [
              {
                label: t("user-management"),
                icon: <UsersIcon className="size-4" />,
                path: "/platform/users",
              },
            ],
          },
        ]}
      />
    </Suspense>
  );
}
