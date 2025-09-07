import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { AssetExtensionEnum } from "@atk/zod/asset-extensions";
import {
  ChevronDown,
  Pause,
  Play,
  Plus,
  Shield,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CollateralSheet } from "./sheets/collateral-sheet";
import { MintSheet } from "./sheets/mint-sheet";
import { PauseUnpauseConfirmationSheet } from "./sheets/pause-unpause-confirmation-sheet";
import { SetYieldScheduleSheet } from "./sheets/set-yield-schedule-sheet";
import { TopUpDenominationAssetSheet } from "./sheets/top-up-denomination-asset-sheet";

interface ManageAssetDropdownProps {
  asset: Token; // Keep Token type to maintain API compatibility
}

type Action =
  | "pause"
  | "unpause"
  | "mint"
  | "setYieldSchedule"
  | "collateral"
  | "viewEvents"
  | "topUpDenominationAsset";

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

  const actions = useMemo(() => {
    // Check if asset has pausable capability (handles both null and undefined)
    const hasPausableCapability = asset.pausable != null;
    const arr: Array<{
      id: string;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      openAction: Action;
      disabled: boolean;
    }> = [];

    if (hasPausableCapability) {
      const canUnpause = asset.userPermissions?.actions?.unpause ?? false;
      const canPause = asset.userPermissions?.actions?.pause ?? false;
      arr.push({
        id: isPaused ? "unpause" : "pause",
        label: isPaused
          ? t("tokens:actions.unpause.label")
          : t("tokens:actions.pause.label"),
        icon: isPaused ? Play : Pause,
        openAction: isPaused ? "unpause" : "pause",
        disabled: isPaused ? !canUnpause : !canPause,
      });
    }

    // Mint only visible if user can mint and token is not paused
    const canMint = asset.userPermissions?.actions?.mint && !isPaused;
    if (canMint) {
      arr.push({
        id: "mint",
        label: t("tokens:actions.mint.label"),
        icon: Plus,
        openAction: "mint",
        disabled: false,
      });
    }

    // Set yield schedule only visible for bond tokens without existing schedule
    const canSetYieldSchedule =
      asset.extensions.includes(AssetExtensionEnum.YIELD) &&
      !asset.yield?.schedule &&
      asset.userPermissions?.actions?.setYieldSchedule &&
      !isPaused;
    if (canSetYieldSchedule) {
      arr.push({
        id: "setYieldSchedule",
        label: t("tokens:actions.setYieldSchedule.label"),
        icon: TrendingUp,
        openAction: "setYieldSchedule",
        disabled: false,
      });
    }

    const hasYieldSchedule = asset.yield?.schedule;
    if (hasYieldSchedule) {
      arr.push({
        id: "topUpDenominationAsset",
        label: t("tokens:actions.topUpDenominationAsset.label"),
        icon: TrendingUp,
        openAction: "topUpDenominationAsset",
        disabled: false,
      });
    }

    // Collateral management
    const hasCollateralCapability = asset.collateral != null;
    const hasCollateralPermission =
      asset.userPermissions?.actions?.updateCollateral === true;
    if (hasCollateralCapability) {
      arr.push({
        id: "collateral",
        label: t("tokens:actions.collateral.label"),
        icon: Shield,
        openAction: "collateral",
        disabled: !hasCollateralPermission,
      });
    }

    return arr;
  }, [
    t,
    asset.pausable,
    asset.extensions,
    asset.yield?.schedule,
    asset.userPermissions?.actions,
    asset.collateral,
    isPaused,
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

      <PauseUnpauseConfirmationSheet
        open={isCurrentAction({
          target: isPaused ? "unpause" : "pause",
          current: openAction,
        })}
        onOpenChange={onActionOpenChange}
        asset={asset}
      />

      <MintSheet
        open={isCurrentAction({ target: "mint", current: openAction })}
        onOpenChange={onActionOpenChange}
        asset={asset}
      />

      <SetYieldScheduleSheet
        open={isCurrentAction({
          target: "setYieldSchedule",
          current: openAction,
        })}
        onOpenChange={onActionOpenChange}
        asset={asset}
      />

      <TopUpDenominationAssetSheet
        open={isCurrentAction({
          target: "topUpDenominationAsset",
          current: openAction,
        })}
        onOpenChange={onActionOpenChange}
        asset={asset}
      />

      <CollateralSheet
        open={isCurrentAction({ target: "collateral", current: openAction })}
        onOpenChange={onActionOpenChange}
        asset={asset}
      />

      {/* Change roles is available from the token tab permissions UI */}
    </>
  );
}
