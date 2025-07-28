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
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useMatches, useNavigate } from "@tanstack/react-router";
import {
  BanknoteArrowUpIcon,
  ChartLine,
  ChevronRight,
  CreditCardIcon,
  PiggyBankIcon,
  PlusIcon,
} from "lucide-react";
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
  const navigate = useNavigate();

  // Pre-group factories by asset class using select function
  // This reduces re-renders when factory data changes in ways that don't affect grouping
  const { data: groupedFactories } = useSuspenseQuery(
    orpc.token.factoryList.queryOptions({
      input: {},
      select: (factories) => ({
        hasFactories: factories.length > 0,
        fixedIncome: factories.filter(
          (factory) =>
            getAssetClassFromFactoryTypeId(factory.typeId) === "fixedIncome"
        ),
        flexibleIncome: factories.filter(
          (factory) =>
            getAssetClassFromFactoryTypeId(factory.typeId) === "flexibleIncome"
        ),
        cashEquivalent: factories.filter(
          (factory) =>
            getAssetClassFromFactoryTypeId(factory.typeId) === "cashEquivalent"
        ),
      }),
    })
  );

  // if (!groupedFactories.hasFactories) {
  //   return null;
  // }

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
      factories: groupedFactories.fixedIncome,
    },
    {
      name: t("flexibleIncome"),
      icon: BanknoteArrowUpIcon,
      factories: groupedFactories.flexibleIncome,
    },
    {
      name: t("cashEquivalent"),
      icon: CreditCardIcon,
      factories: groupedFactories.cashEquivalent,
    },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("assetManagement")}</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuSubButton
          className="bg-accent text-primary-foreground shadow-dropdown shadow-inset hover:bg-accent-hover hover:text-primary-foreground"
          onClick={() => {
            void navigate({
              to: "/asset-designer",
            });
          }}
        >
          <PlusIcon className="mr-1 h-4 w-4" />
          <span>{t("assetDesigner")}</span>
        </SidebarMenuSubButton>
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
