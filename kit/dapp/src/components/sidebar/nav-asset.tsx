import { AssetDesignerDialog } from "@/components/asset-designer/asset-designer-wizard/asset-designer-dialog";
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
import { useAssetClass } from "@/hooks/use-asset-class";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useMatches } from "@tanstack/react-router";
import { ChartLine, ChevronRight, PlusIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Navigation component for asset management in the sidebar.
 * Uses hybrid navigation: DropdownMenu in collapsed mode, Collapsible in expanded mode.
 * Displays asset classes with their token factories and a link to statistics.
 * Shows for admins or users with tokenCreate permission. For admins without permission,
 * items are disabled with tooltips explaining missing permissions.
 * @example
 * // Used within AppSidebar component
 * <NavAsset />
 */
export function NavAsset() {
  const { t } = useTranslation("navigation");
  const matches = useMatches();
  const [modalOpen, setModalOpen] = useState(false);
  const { state } = useSidebar();
  const { data: system } = useSuspenseQuery(
    orpc.system.read.queryOptions({
      input: { id: "default" },
    })
  );
  const { assetClasses } = useAssetClass();

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

  const isAdmin = system.userPermissions?.roles?.admin === true;
  const canCreateToken = Boolean(system.userPermissions?.actions.tokenCreate);

  // Show for admins or users with permission
  if (!isAdmin && !canCreateToken) {
    return null;
  }

  const isDisabled = isAdmin && !canCreateToken;

  return (
    <>
      <AssetDesignerDialog open={modalOpen} onOpenChange={setModalOpen} />

      <SidebarGroup>
        <SidebarGroupLabel>{t("assetManagement")}</SidebarGroupLabel>
        <SidebarMenu>
          {(() => {
            const assetDesignerButton = (
              <SidebarMenuButton
                className="bg-accent text-primary-foreground shadow-dropdown shadow-inset hover:bg-accent-hover hover:text-primary-foreground my-2"
                onClick={() => {
                  if (!isDisabled) {
                    setModalOpen(true);
                  }
                }}
                disabled={isDisabled}
                tooltip={
                  isDisabled
                    ? undefined
                    : t("assetDesigner")
                }
              >
                <PlusIcon className="mr-1 h-4 w-4" />
                <span>{t("assetDesigner")}</span>
              </SidebarMenuButton>
            );

            if (isDisabled) {
              return (
                <Tooltip>
                  <TooltipTrigger asChild>{assetDesignerButton}</TooltipTrigger>
                  <TooltipContent className="whitespace-pre-wrap">
                    {t("assetManagementNotAuthorized")}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return assetDesignerButton;
          })()}
          {assetClasses
            .filter((assetClass) => assetClass.factories.length > 0)
            .map((assetClass) => {
              const hasActiveChild = isAnyFactoryActive(
                assetClass.factories.map((f) => f.id)
              );

              // Collapsed state: Use DropdownMenu
              if (state === "collapsed") {
                return (
                  <SidebarMenuItem key={assetClass.name}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                          className={hasActiveChild ? "font-semibold" : ""}
                          tooltip={assetClass.name}
                        >
                          <assetClass.icon />
                        </SidebarMenuButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        side="right"
                        align="start"
                        className="w-48"
                      >
                        {assetClass.factories.map((factory) => {
                          const isActive = isFactoryActive(factory.id);
                          const factoryLink = (
                            <Link
                              to="/token/$factoryAddress"
                              params={{ factoryAddress: factory.id }}
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
                              {factory.name}
                            </Link>
                          );

                          if (isDisabled) {
                            return (
                              <Tooltip key={factory.id}>
                                <TooltipTrigger asChild>
                                  <DropdownMenuItem disabled>
                                    {factoryLink}
                                  </DropdownMenuItem>
                                </TooltipTrigger>
                                <TooltipContent className="whitespace-pre-wrap">
                                  {t("assetManagementNotAuthorized")}
                                </TooltipContent>
                              </Tooltip>
                            );
                          }

                          return (
                            <DropdownMenuItem key={factory.id} asChild>
                              {factoryLink}
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
                  key={assetClass.name}
                  asChild
                  defaultOpen={true}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        className={hasActiveChild ? "font-semibold" : ""}
                        tooltip={assetClass.name}
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
                          const factorySubLink = (
                            <SidebarMenuSubButton
                              asChild={!isDisabled}
                              disabled={isDisabled}
                            >
                              {isDisabled ? (
                                <div className="flex items-center">
                                  <span>{factory.name}</span>
                                </div>
                              ) : (
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
                              )}
                            </SidebarMenuSubButton>
                          );

                          if (isDisabled) {
                            return (
                              <Tooltip key={factory.id}>
                                <TooltipTrigger asChild>
                                  <SidebarMenuSubItem>{factorySubLink}</SidebarMenuSubItem>
                                </TooltipTrigger>
                                <TooltipContent className="whitespace-pre-wrap">
                                  {t("assetManagementNotAuthorized")}
                                </TooltipContent>
                              </Tooltip>
                            );
                          }

                          return (
                            <SidebarMenuSubItem key={factory.id}>
                              {factorySubLink}
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}

          {(() => {
            const statisticsButton = (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild={!isDisabled}
                  disabled={isDisabled}
                  tooltip={isDisabled ? undefined : t("statistics")}
                >
                  {isDisabled ? (
                    <div className="flex items-center gap-2">
                      <ChartLine />
                      <span>{t("statistics")}</span>
                    </div>
                  ) : (
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
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );

            if (isDisabled) {
              return (
                <Tooltip>
                  <TooltipTrigger asChild>{statisticsButton}</TooltipTrigger>
                  <TooltipContent className="whitespace-pre-wrap">
                    {t("assetManagementNotAuthorized")}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return statisticsButton;
          })()}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
