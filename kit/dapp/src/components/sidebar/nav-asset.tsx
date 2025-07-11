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
import { Link, useMatches } from "@tanstack/react-router";
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
  const { t } = useTranslation("navigation");
  const matches = useMatches();
  const { data: factories } = useSuspenseQuery(
    orpc.token.factoryList.queryOptions({ input: { hasTokens: true } })
  );

  if (factories.length === 0) {
    return null;
  }

  // Check if any factory route is active
  const isAnyFactoryActive = (factoryIds: string[]) => {
    return matches.some((match) => {
      const params = match.params as { factoryAddress?: string };
      return (
        params.factoryAddress && factoryIds.includes(params.factoryAddress)
      );
    });
  };

  // Check if a specific factory is active (including child token routes)
  const isFactoryActive = (factoryId: string) => {
    return matches.some((match) => {
      const params = match.params as { factoryAddress?: string };
      return params.factoryAddress === factoryId;
    });
  };

  const assetClasses = [
    {
      name: t("fixedIncome"),
      icon: PiggyBankIcon,
      factories: factories.filter(
        (factory) =>
          getAssetClassFromFactoryTypeId(factory.typeId) === "fixedIncome"
      ),
    },
    {
      name: t("flexibleIncome"),
      icon: BanknoteArrowUpIcon,
      factories: factories.filter(
        (factory) =>
          getAssetClassFromFactoryTypeId(factory.typeId) === "flexibleIncome"
      ),
    },
    {
      name: t("cashEquivalent"),
      icon: CreditCardIcon,
      factories: factories.filter(
        (factory) =>
          getAssetClassFromFactoryTypeId(factory.typeId) === "cashEquivalent"
      ),
    },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("assetManagement")}</SidebarGroupLabel>
      <SidebarMenu>
        {assetClasses
          .filter((assetClass) => assetClass.factories.length > 0)
          .map((assetClass) => {
            const hasActiveChild = isAnyFactoryActive(
              assetClass.factories.map((f) => f.id)
            );
            return (
              <Collapsible
                key={assetClass.name}
                asChild
                defaultOpen={true}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={t("asset")}
                      className={hasActiveChild ? "font-semibold" : ""}
                    >
                      <assetClass.icon />
                      <span>{assetClass.name}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {assetClass.factories.map((factory) => {
                        const isActive = isFactoryActive(factory.id);
                        return (
                          <SidebarMenuSubItem key={factory.id}>
                            <SidebarMenuSubButton asChild>
                              <Link
                                to="/token/$factoryAddress"
                                params={{ factoryAddress: factory.id }}
                                activeProps={{
                                  "data-active": true,
                                }}
                                className={isActive ? "font-semibold" : ""}
                              >
                                <span>{factory.name}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })}

        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link
              to="/token/stats"
              activeProps={{
                "data-active": true,
                className: "font-semibold",
              }}
            >
              <ChartLine />
              <span>{t("statistics")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
