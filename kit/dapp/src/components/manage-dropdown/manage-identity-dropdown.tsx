import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { orpc } from "@/orpc/orpc-client";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import type { AccessControlRoles } from "@atk/zod/access-control-roles";
import { satisfiesRoleRequirement } from "@atk/zod/role-requirement";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import { ChevronDown, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { RegisterIdentitySheet } from "./sheets/register-identity-sheet";

type Action = "registerIdentity";

interface ManagedIdentityAccount {
  id: string;
  contractName?: string | null;
}

export interface ManagedIdentity {
  identity: string;
  account: ManagedIdentityAccount;
  isRegistered: boolean;
}

interface DropdownAction {
  id: string;
  label: string;
  icon: LucideIcon;
  openAction: Action;
  disabled: boolean;
}

function isCurrentAction({
  target,
  current,
}: {
  target: Action;
  current: Action | null;
}) {
  return target === current;
}

export interface ManageIdentityDropdownProps {
  identity: ManagedIdentity;
}

export function ManageIdentityDropdown({
  identity,
}: ManageIdentityDropdownProps) {
  const { t } = useTranslation("identities");
  const [openAction, setOpenAction] = useState<Action | null>(null);
  const logger = useMemo(() => createLogger(), []);

  const { data: system } = useQuery(
    orpc.system.read.queryOptions({
      input: { id: "default" },
    })
  );

  const userRoles = useMemo(() => {
    if (!system?.userPermissions?.roles) {
      return [] as AccessControlRoles[];
    }

    return Object.entries(system.userPermissions.roles)
      .filter(([, hasRole]) => hasRole)
      .map(([role]) => role as AccessControlRoles);
  }, [system?.userPermissions?.roles]);

  const canExecuteRegister = Boolean(
    system?.userPermissions?.actions.identityRegister
  );

  const canViewRegister = useMemo(
    () =>
      satisfiesRoleRequirement(userRoles, SYSTEM_PERMISSIONS.identityRegister),
    [userRoles]
  );

  useEffect(() => {
    if (!system) return;

    logger.debug("ManageIdentityDropdown permissions", {
      identityRegistered: identity.isRegistered,
      userRoles,
      canViewRegister,
      actionFlag: system.userPermissions?.actions.identityRegister,
    });

    if (canViewRegister && !canExecuteRegister) {
      logger.warn(
        "identityRegister action flag disabled despite sufficient roles",
        {
          identityRegistered: identity.isRegistered,
          systemActions: system.userPermissions?.actions,
        }
      );
    }
  }, [
    logger,
    system,
    userRoles,
    canViewRegister,
    canExecuteRegister,
    identity.isRegistered,
  ]);

  const actions = useMemo<DropdownAction[]>(() => {
    if (!canViewRegister) {
      return [];
    }

    return [
      {
        id: "register-identity",
        label: t("actions.registerIdentity.label"),
        icon: UserPlus,
        openAction: "registerIdentity",
        disabled: identity.isRegistered || !canExecuteRegister,
      },
    ];
  }, [canViewRegister, t, identity.isRegistered, canExecuteRegister]);

  const onActionOpenChange = (open: boolean) => {
    setOpenAction(open ? openAction : null);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm" className="gap-2 press-effect">
            {t("manage")}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 rounded-lg"
          align="end"
          sideOffset={4}
        >
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.id}
              onSelect={() => {
                if (!action.disabled) {
                  setOpenAction(action.openAction);
                }
              }}
              disabled={action.disabled}
              className="cursor-pointer"
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </DropdownMenuItem>
          ))}
          {actions.length > 0 && <DropdownMenuSeparator />}
          <DropdownMenuItem disabled>
            {t("actions.viewEvents")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RegisterIdentitySheet
        open={isCurrentAction({
          target: "registerIdentity",
          current: openAction,
        })}
        onOpenChange={onActionOpenChange}
        identity={identity}
      />
    </>
  );
}
