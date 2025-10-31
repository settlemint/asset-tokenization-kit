import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
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
  const isMyAssetsActive = useRouterState({
    select: (state) => state.location.pathname.startsWith("/my-assets"),
  });
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
          <SidebarMenuButton
            asChild
            isActive={isMyAssetsActive}
            tooltip={t("myAssets")}
          >
            <Link
              to="/my-assets"
              aria-current={isMyAssetsActive ? "page" : undefined}
              className={isMyAssetsActive ? "font-semibold" : undefined}
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
