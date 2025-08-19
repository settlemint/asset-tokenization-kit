import { PauseUnpauseConfirmationSheet } from "./sheets/pause-unpause-confirmation-sheet";
import { MintSheet } from "./sheets/mint-sheet";
import { BurnSheet } from "./sheets/burn-sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { ChevronDown, Flame, Pause, Play, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface ManageAssetDropdownProps {
  asset: Token; // Keep Token type to maintain API compatibility
}

type Action = "pause" | "unpause" | "mint" | "burn" | "viewEvents";

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

  const isPaused = asset.pausable?.paused ?? false;
  // Check if asset has pausable capability (handles both null and undefined)
  const hasPausableCapability = asset.pausable != null;

  const actions = useMemo(() => {
    const arr: Array<{
      id: string;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      openAction: Action;
      disabled: boolean;
    }> = [];

    if (hasPausableCapability) {
      arr.push({
        id: isPaused ? "unpause" : "pause",
        label: isPaused
          ? t("tokens:actions.unpause.label")
          : t("tokens:actions.pause.label"),
        icon: isPaused ? Play : Pause,
        openAction: isPaused ? "unpause" : "pause",
        disabled: false,
      });
    }

    // Mint only visible if user can mint and token is not paused
    const canMint =
      (asset.userPermissions?.actions?.mint ?? false) && !isPaused;
    if (canMint) {
      arr.push({
        id: "mint",
        label: t("tokens:actions.mint.label"),
        icon: Plus,
        openAction: "mint",
        disabled: false,
      });
    }

    // Burn only visible if user can burn and token is not paused
    const canBurn =
      (asset.userPermissions?.actions?.burn ?? false) && !isPaused;
    if (canBurn) {
      arr.push({
        id: "burn",
        label: t("tokens:actions.burn.label"),
        icon: Flame,
        openAction: "burn",
        disabled: false,
      });
    }

    return arr;
  }, [
    isPaused,
    t,
    hasPausableCapability,
    asset.userPermissions?.actions?.mint,
    asset.userPermissions?.actions?.burn,
  ]);

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

      {hasPausableCapability && (
        <PauseUnpauseConfirmationSheet
          open={isCurrentAction({
            target: isPaused ? "unpause" : "pause",
            current: openAction,
          })}
          onOpenChange={onActionOpenChange}
          asset={asset}
        />
      )}

      {/* Mint */}
      {(asset.userPermissions?.actions?.mint ?? false) && !isPaused && (
        <MintSheet
          open={isCurrentAction({ target: "mint", current: openAction })}
          onOpenChange={onActionOpenChange}
          asset={asset}
        />
      )}

      {/* Burn */}
      {(asset.userPermissions?.actions?.burn ?? false) && !isPaused && (
        <BurnSheet
          open={isCurrentAction({ target: "burn", current: openAction })}
          onOpenChange={onActionOpenChange}
          asset={asset}
        />
      )}

      {/* Change roles is available from the token tab permissions UI */}
    </>
  );
}
