import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { WalletIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Navigation component for user assets in the sidebar.
 * Provides a direct link to the My Assets page where users can view their token holdings.
 * @example
 * // Used within AppSidebar component
 * <NavMyAssets />
 */
export function NavMyAssets() {
  const { t } = useTranslation("navigation");
  const { data: system } = useSuspenseQuery(
    orpc.system.read.queryOptions({
      input: { id: "default" },
    })
  );

  if (!system.userIdentity?.registered) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("myAssets")}</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link
              to="/my-assets"
              activeProps={{
                "data-active": true,
                className: "font-semibold",
              }}
            >
              <WalletIcon />
              <span>{t("myAssets")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
