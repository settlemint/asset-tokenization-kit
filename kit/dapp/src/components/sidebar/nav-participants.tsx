import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { Layers3, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Sidebar navigation for participant management.
 * Shows for admins or users with identity manager or claim issuer role.
 * For admins without permission, items are disabled with tooltips explaining missing permissions.
 */
export function NavParticipants() {
  const { t } = useTranslation("navigation");
  const isUsersActive = useRouterState({
    select: (state) =>
      state.location.pathname.startsWith("/participants/users"),
  });
  const isEntitiesActive = useRouterState({
    select: (state) =>
      state.location.pathname.startsWith("/participants/entities"),
  });
  const { data: system } = useSuspenseQuery(
    orpc.system.read.queryOptions({
      input: { id: "default" },
    })
  );

  const roles = system.userPermissions?.roles;
  const isAdmin = roles?.admin === true;
  const canManageParticipants = Boolean(
    roles?.identityManager || roles?.claimIssuer
  );

  // Show for admins or users with permission
  if (!isAdmin && !canManageParticipants) {
    return null;
  }

  const isDisabled = isAdmin && !canManageParticipants;

  const participantItems: {
    name: string;
    icon: React.ElementType;
    path: string;
    isActive: boolean;
  }[] = [
    {
      name: t("participantsUsers"),
      icon: Users,
      path: "/participants/users",
      isActive: isUsersActive,
    },
    {
      name: t("participantsEntities"),
      icon: Layers3,
      path: "/participants/entities",
      isActive: isEntitiesActive,
    },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("participants")}</SidebarGroupLabel>
      <SidebarMenu>
        {participantItems.map((item) => {
          const Icon = item.icon;

          const button = (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                asChild={!isDisabled}
                isActive={item.isActive}
                disabled={isDisabled}
                tooltip={isDisabled ? undefined : item.name}
              >
                {isDisabled ? (
                  <div className="flex items-center gap-2">
                    <Icon />
                    <span>{item.name}</span>
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    aria-current={item.isActive ? "page" : undefined}
                    className={item.isActive ? "font-semibold" : undefined}
                  >
                    <Icon />
                    <span>{item.name}</span>
                  </Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          );

          if (isDisabled) {
            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent className="whitespace-pre-wrap">
                  {t("participantsNotAuthorized")}
                </TooltipContent>
              </Tooltip>
            );
          }

          return button;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
