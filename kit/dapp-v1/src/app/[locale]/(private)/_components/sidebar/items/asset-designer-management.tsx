import { NavMain } from "@/components/layout/nav-main";
import { LucideCoins } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function AssetDesignerManagement() {
  const t = await getTranslations("admin.sidebar.asset-management");

  return (
    <NavMain
      items={[
        {
          groupTitle: t("group-title"),
          items: [
            {
              label: "Asset Designer",
              icon: <LucideCoins className="size-4" />,
              path: "/asset-designer",
            },
          ],
        },
      ]}
    />
  );
}
