import { NavMain } from "@/components/layout/nav-main";
import { UsersIcon } from "@/components/ui/animated-icons/users";
import { getTranslations } from "next-intl/server";

export async function PlatformManagement() {
  const t = await getTranslations("admin.sidebar.platform-management");

  return (
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
  );
}
