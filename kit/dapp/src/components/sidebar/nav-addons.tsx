import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { orpc } from "@/orpc/orpc-client";
import { getAddonCategoryFromFactoryTypeId } from "@atk/zod/addon-types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useMatches } from "@tanstack/react-router";
import { Banknote, ChevronRight, Vault } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

/**
 * Navigation component for addon management in the sidebar.
 * Uses hybrid navigation: DropdownMenu in collapsed mode, Collapsible in expanded mode.
 * Displays addon categories (custody, income) with their addon instances.
 * Shows for admins or users with addonCreate permission. For admins without permission,
 * items are disabled with tooltips explaining missing permissions.
 * @example
 * // Used within AppSidebar component
 * <NavAddons />
 */
export function NavAddons() {
  const { t } = useTranslation("navigation");
  const matches = useMatches();
  const { state } = useSidebar();
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

  const isAdmin = system.userPermissions?.roles?.admin === true;
  const canCreateAddon = Boolean(system.userPermissions?.actions.addonCreate);

  // Show for admins or users with permission
  if (!isAdmin && !canCreateAddon) {
    return null;
  }

  const isDisabled = isAdmin && !canCreateAddon;

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

            // Collapsed state: Use DropdownMenu
            if (state === "collapsed") {
              return (
                <SidebarMenuItem key={category.name}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton
                        className={hasActiveChild ? "font-semibold" : ""}
                        tooltip={category.name}
                      >
                        <category.icon />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="right"
                      align="start"
                      className="w-48"
                    >
                      {category.addons.map((addon) => {
                        const isActive = isAddonActive(addon.id);
                        const addonLink = (
                          <Link
                            to="/addon/$addonAddress"
                            params={{ addonAddress: addon.id }}
                            className={
                              isDisabled
                                ? "pointer-events-none opacity-50"
                                : isActive
                                  ? "font-semibold"
                                  : ""
                            }
                            onClick={(e) => {
                              if (isDisabled) {
                                e.preventDefault();
                              }
                            }}
                          >
                            {addon.name}
                          </Link>
                        );

                        if (isDisabled) {
                          return (
                            <Tooltip key={addon.id}>
                              <TooltipTrigger asChild>
                                <DropdownMenuItem disabled>
                                  {addonLink}
                                </DropdownMenuItem>
                              </TooltipTrigger>
                              <TooltipContent className="whitespace-pre-wrap">
                                {t("settings.addons.notAuthorized")}
                              </TooltipContent>
                            </Tooltip>
                          );
                        }

                        return (
                          <DropdownMenuItem key={addon.id} asChild>
                            {addonLink}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              );
            }

            // Expanded state: Use Collapsible
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
                      className={hasActiveChild ? "font-semibold" : ""}
                      tooltip={category.name}
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
                        const addonSubLink = (
                          <SidebarMenuSubButton
                            asChild={!isDisabled}
                            disabled={isDisabled}
                          >
                            {isDisabled ? (
                              <div className="flex items-center">
                                <span>{addon.name}</span>
                              </div>
                            ) : (
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
                            )}
                          </SidebarMenuSubButton>
                        );

                        if (isDisabled) {
                          return (
                            <Tooltip key={addon.id}>
                              <TooltipTrigger asChild>
                                <SidebarMenuSubItem>{addonSubLink}</SidebarMenuSubItem>
                              </TooltipTrigger>
                              <TooltipContent className="whitespace-pre-wrap">
                                {t("settings.addons.notAuthorized")}
                              </TooltipContent>
                            </Tooltip>
                          );
                        }

                        return (
                          <SidebarMenuSubItem key={addon.id}>
                            {addonSubLink}
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
