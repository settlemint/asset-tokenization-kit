import { IssueClaimSheet } from "@/components/manage-dropdown/sheets/issue-claim-sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { orpc } from "@/orpc/orpc-client";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import { ChevronDown, FilePlus, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Address } from "viem";
import { RegisterIdentitySheet } from "./sheets/register-identity-sheet";

type Action = "registerIdentity" | "issueClaim";

interface ManagedIdentityAccount {
  id: string;
  contractName?: string | null;
}

export interface ManagedIdentity {
  identity: Address;
  account: ManagedIdentityAccount;
  isRegistered: boolean;
}

interface DropdownAction {
  id: string;
  label: string;
  icon: LucideIcon;
  openAction: Action;
  disabled: boolean;
  disabledMessage: string;
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

  const { data: system } = useQuery(
    orpc.system.read.queryOptions({
      input: { id: "default" },
    })
  );

  const canExecuteRegister = Boolean(
    system?.userPermissions?.actions.identityRegister
  );

  const canExecuteIssueClaim = Boolean(
    system?.userPermissions?.actions.claimCreate
  );

  const actions = useMemo<DropdownAction[]>(() => {
    return [
      {
        id: "register-identity",
        label: t("actions.registerIdentity.label"),
        icon: UserPlus,
        openAction: "registerIdentity",
        disabled: identity.isRegistered || !canExecuteRegister,
        disabledMessage: identity.isRegistered
          ? t("actions.registerIdentity.alreadyRegistered")
          : t("actions.registerIdentity.notAuthorized"),
      },
      {
        id: "issue-claim",
        label: t("actions.issueClaim.title"),
        icon: FilePlus,
        openAction: "issueClaim",
        disabled: !canExecuteIssueClaim,
        disabledMessage: t("actions.issueClaim.notAuthorized"),
      },
    ];
  }, [t, identity.isRegistered, canExecuteRegister, canExecuteIssueClaim]);

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
              {action.disabled ? (
                <Tooltip>
                  <TooltipTrigger className="pointer-events-auto">
                    <span className="flex items-center gap-2">
                      <action.icon className="h-4 w-4" />
                      {action.label}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    {action.disabledMessage}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <>
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </>
              )}
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

      <IssueClaimSheet
        open={isCurrentAction({
          target: "issueClaim",
          current: openAction,
        })}
        onOpenChange={onActionOpenChange}
        identity={identity}
      />
    </>
  );
}
