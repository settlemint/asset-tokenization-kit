"use client";

import {
  BanknoteArrowUpIcon,
  ChartLine,
  ChevronRight,
  CreditCardIcon,
  PiggyBankIcon,
} from "lucide-react";

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
import { getAssetClassFromFactoryTypeId } from "@/lib/zod/validators/asset-types";
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

  const assetClasses = [
    {
      name: t("navigation.fixedIncome"),
      icon: PiggyBankIcon,
      factories: factories.filter(
        (factory) =>
          getAssetClassFromFactoryTypeId(factory.typeId) === "fixed-income"
      ),
    },
    {
      name: t("navigation.flexibleIncome"),
      icon: BanknoteArrowUpIcon,
      factories: factories.filter(
        (factory) =>
          getAssetClassFromFactoryTypeId(factory.typeId) === "flexible-income"
      ),
    },
    {
      name: t("navigation.cashEquivalent"),
      icon: CreditCardIcon,
      factories: factories.filter(
        (factory) =>
          getAssetClassFromFactoryTypeId(factory.typeId) === "cash-equivalent"
      ),
    },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("navigation.assetManagement")}</SidebarGroupLabel>
      <SidebarMenu>
        {assetClasses
          .filter((assetClass) => assetClass.factories.length > 0)
          .map((assetClass) => (
            <Collapsible
              key={assetClass.name}
              asChild
              defaultOpen={true}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={t("navigation.asset")}>
                    <assetClass.icon />
                    <span>{assetClass.name}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {assetClass.factories.map((factory) => (
                      <SidebarMenuSubItem key={factory.id}>
                        <SidebarMenuSubButton asChild>
                          <Link
                            to="/token/$factoryAddress"
                            params={{ factoryAddress: factory.id }}
                            activeProps={{
                              "data-active": true,
                            }}
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
          ))}

        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link
              to="/token/stats"
              activeProps={{
                "data-active": true,
              }}
            >
              <ChartLine />
              <span>{t("navigation.statistics")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
