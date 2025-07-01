"use client";

import { ChartLine, ChevronRight, Coins } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { orpc } from "@/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

/**
 * Navigation component for asset management in the sidebar.
 * Displays a collapsible list of asset factories with tokens and a link to statistics.
 * Only renders when there are factories with tokens available.
 * @example
 * // Used within AppSidebar component
 * <NavAsset />
 */
export function NavAsset() {
  const { t } = useTranslation("general");
  const { data: factories } = useSuspenseQuery(
    orpc.token.factoryList.queryOptions({ input: { hasTokens: true } })
  );

  if (factories.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("navigation.assetManagement")}</SidebarGroupLabel>
      <SidebarMenu>
        <Collapsible asChild defaultOpen={true} className="group/collapsible">
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip={t("navigation.asset")}>
                <Coins />
                <span>{t("navigation.assetClasses")}</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {factories.map((factory) => (
                  <SidebarMenuSubItem key={factory.id}>
                    <SidebarMenuSubButton asChild>
                      <Link
                        to="/token/$factoryAddress"
                        params={{ factoryAddress: factory.id }}
                      >
                        <span>{factory.name}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link to="/token/stats">
              <ChartLine />
              <span>{t("navigation.statistics")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
