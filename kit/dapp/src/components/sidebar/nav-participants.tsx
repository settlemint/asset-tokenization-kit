import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  CLAIM_ISSUER_ROLE,
  IDENTITY_MANAGER_ROLE,
} from "@/lib/constants/roles";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { Layers3, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Sidebar navigation for participant management.
 * Only renders when the user holds the identity manager or claim issuer role.
 */
export function NavParticipants() {
  const { t } = useTranslation("navigation");
  const isUsersActive = useRouterState({
    select: (state) =>
      state.location.pathname.startsWith("/admin/user-management"),
  });
  const isEntitiesActive = useRouterState({
    select: (state) =>
      state.location.pathname.startsWith("/admin/identity-management"),
  });
  const { data: system } = useSuspenseQuery(
    orpc.system.read.queryOptions({
      input: { id: "default" },
    })
  );

  const roles = system.userPermissions?.roles;
  const canManageParticipants = Boolean(
    roles?.[IDENTITY_MANAGER_ROLE.fieldName] ||
      roles?.[CLAIM_ISSUER_ROLE.fieldName]
  );

  if (!canManageParticipants) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("participants")}</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={isUsersActive}>
            <Link
              to="/admin/user-management"
              aria-current={isUsersActive ? "page" : undefined}
              className={isUsersActive ? "font-semibold" : undefined}
            >
              <Users />
              <span>{t("participantsUsers")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={isEntitiesActive}>
            <Link
              to="/admin/identity-management"
              aria-current={isEntitiesActive ? "page" : undefined}
              className={isEntitiesActive ? "font-semibold" : undefined}
            >
              <Layers3 />
              <span>{t("participantsEntities")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
