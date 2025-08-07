import { GrantRoleSheet } from "@/components/manage-dropdown/grant-role-sheet";
import { PauseUnpauseConfirmationSheet } from "@/components/manage-dropdown/pause-unpause-confirmation-sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { ChevronDown, Pause, Play, Shield } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface ManageAssetDropdownProps {
  asset: Token; // Keep Token type to maintain API compatibility
}

type Action = "pause" | "unpause" | "grantRole" | "viewEvents";

function isCurrentAction({
  target,
  current,
}: {
  target: Action;
  current: Action | null;
}) {
  return target === current;
}

export function ManageAssetDropdown({ asset }: ManageAssetDropdownProps) {
  const { t } = useTranslation(["tokens", "common"]);
  const [openAction, setOpenAction] = useState<Action | null>(null);

  const isPaused = asset.pausable.paused;

  const actions = useMemo(
    () =>
      [
        {
          id: isPaused ? "unpause" : "pause",
          label: isPaused
            ? t("tokens:actions.unpause.label")
            : t("tokens:actions.pause.label"),
          icon: isPaused ? Play : Pause,
          openAction: isPaused ? "unpause" : "pause",
          disabled: false,
        },
        {
          id: "grant-role",
          label: "Grant role",
          icon: Shield,
          openAction: "grantRole",
          disabled: false,
        },
      ] as const,
    [isPaused, t]
  );

  const onActionOpenChange = (open: boolean) => {
    setOpenAction(open ? openAction : null);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm" className="gap-2 press-effect">
            {t("tokens:manage")}
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
                setOpenAction(action.openAction);
              }}
              disabled={action.disabled}
              className="cursor-pointer"
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            {t("tokens:actions.viewEvents")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PauseUnpauseConfirmationSheet
        open={isCurrentAction({
          target: isPaused ? "unpause" : "pause",
          current: openAction,
        })}
        onOpenChange={onActionOpenChange}
        asset={asset}
      />

      <GrantRoleSheet
        open={isCurrentAction({ target: "grantRole", current: openAction })}
        onOpenChange={onActionOpenChange}
        asset={asset}
      />
    </>
  );
}
