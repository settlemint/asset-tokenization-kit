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
import { orpc } from "@/orpc/orpc-client";
import { getAddonCategoryFromFactoryTypeId } from "@atk/zod/addon-types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useMatches, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  Banknote,
  ChevronRight,
  PlusIcon,
  Truck,
  Vault,
} from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

/**
 * Navigation component for addon management in the sidebar.
 * Displays a list of system addons with navigation to addon details.
 * @example
 * // Used within AppSidebar component
 * <NavAddons />
 */
export function NavAddons() {
  const { t } = useTranslation("navigation");
  const navigate = useNavigate();
  const matches = useMatches();
  const { data: system } = useSuspenseQuery(
    orpc.system.read.queryOptions({
      input: { id: "default" },
    })
  );

  // Fetch all addons
  const { data: addons } = useSuspenseQuery(
    orpc.system.addon.list.queryOptions({
      input: {},
    })
  );

  // Group addons by category
  const groupedAddons = useMemo(
    () => ({
      hasAddons: addons.length > 0,
      distribution: addons.filter(
        (addon) =>
          getAddonCategoryFromFactoryTypeId(addon.typeId) === "distribution"
      ),
      exchange: addons.filter(
        (addon) =>
          getAddonCategoryFromFactoryTypeId(addon.typeId) === "exchange"
      ),
      custody: addons.filter(
        (addon) => getAddonCategoryFromFactoryTypeId(addon.typeId) === "custody"
      ),
      income: addons.filter(
        (addon) => getAddonCategoryFromFactoryTypeId(addon.typeId) === "income"
      ),
    }),
    [addons]
  );

  // Check if any addon in a category is active
  const isAnyCategoryAddonActive = (addonIds: string[]) => {
    return matches.some((match) => {
      const params = match.params as { addonAddress?: string };
      return params.addonAddress && addonIds.includes(params.addonAddress);
    });
  };

  // Check if a specific addon is active
  const isAddonActive = (addonId: string) => {
    return matches.some((match) => {
      const params = match.params as { addonAddress?: string };
      return params.addonAddress === addonId;
    });
  };

  const addonCategories = [
    // Distribution and Exchange categories are hidden
    // {
    //   name: t("addonCategories.distribution"),
    //   icon: Truck,
    //   addons: groupedAddons.distribution,
    // },
    // {
    //   name: t("addonCategories.exchange"),
    //   icon: ArrowLeftRight,
    //   addons: groupedAddons.exchange,
    // },
    {
      name: t("addonCategories.custody"),
      icon: Vault,
      addons: groupedAddons.custody,
    },
    {
      name: t("addonCategories.income"),
      icon: Banknote,
      addons: groupedAddons.income,
    },
  ];

  if (!system.userPermissions?.actions.addonCreate) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("addons")}</SidebarGroupLabel>
      <SidebarMenu>
        {/* Addon Designer button is hidden for now */}
        {/* <SidebarMenuButton
          className="bg-accent text-primary-foreground shadow-dropdown shadow-inset hover:bg-accent-hover hover:text-primary-foreground my-2"
          onClick={() => {
            void navigate({
              to: "/addon-designer",
            });
          }}
        >
          <PlusIcon className="mr-1 h-4 w-4" />
          <span>{t("addonDesigner")}</span>
        </SidebarMenuButton> */}
        {addonCategories
          .filter((category) => category.addons.length > 0)
          .map((category) => {
            const hasActiveChild = isAnyCategoryAddonActive(
              category.addons.map((a) => a.id)
            );
            return (
              <Collapsible
                key={category.name}
                asChild
                defaultOpen={true}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={category.name}
                      className={hasActiveChild ? "font-semibold" : ""}
                    >
                      <category.icon />
                      <span>{category.name}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {category.addons.map((addon) => {
                        const isActive = isAddonActive(addon.id);
                        return (
                          <SidebarMenuSubItem key={addon.id}>
                            <SidebarMenuSubButton asChild>
                              <Link
                                to="/addon/$addonAddress"
                                params={{ addonAddress: addon.id }}
                                activeProps={{
                                  "data-active": true,
                                }}
                                className={isActive ? "font-semibold" : ""}
                              >
                                <span>{addon.name}</span>
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
      </SidebarMenu>
    </SidebarGroup>
  );
}
