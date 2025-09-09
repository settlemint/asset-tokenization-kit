import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/hooks/use-auth";
import { orpc } from "@/orpc/orpc-client";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { AssetExtensionEnum } from "@atk/zod/asset-extensions";
import { useQuery } from "@tanstack/react-query";
import { greaterThan } from "dnum";
import {
  ChevronDown,
  Minus,
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
import { WithdrawDenominationAssetSheet } from "./sheets/withdraw-denomination-asset-sheet";

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
  | "topUpDenominationAsset"
  | "withdrawDenominationAsset";

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

  const { data: session } = useSession();
  const userWallet = session?.user?.wallet;

  const isPaused = asset.pausable?.paused ?? false;
  const yieldScheduleId = asset.yield?.schedule?.id;

  // Fetch yield schedule details when available
  const { data: yieldSchedule } = useQuery({
    ...orpc.fixedYieldSchedule.read.queryOptions({
      input: { id: yieldScheduleId ?? "" },
    }),
    enabled: !!yieldScheduleId,
  });

  // Fetch denomination asset details
  const denominationAssetId = yieldSchedule?.denominationAsset?.id;
  const { data: denominationAsset } = useQuery({
    ...orpc.token.read.queryOptions({
      input: { tokenAddress: denominationAssetId ?? "" },
    }),
    enabled: !!denominationAssetId,
  });

  // Fetch yield schedule's denomination asset balance to check if withdrawal is possible
  const { data: yieldScheduleBalance } = useQuery({
    ...orpc.token.holder.queryOptions({
      input: {
        tokenAddress: denominationAsset?.id ?? "",
        holderAddress: yieldSchedule?.id ?? "",
      },
    }),
    enabled: !!denominationAsset && !!yieldSchedule,
  });

  // Fetch user's balance of the denomination asset
  const { data: userDenominationAssetBalance } = useQuery({
    ...orpc.token.holder.queryOptions({
      input: {
        tokenAddress: denominationAsset?.id ?? "",
        holderAddress: userWallet ?? "",
      },
    }),
    enabled: !!userWallet && !!denominationAsset,
  });

  // Check if yield schedule has denomination assets to withdraw
  const denominationAssetAvailable =
    yieldScheduleBalance?.holder?.available?.[0] ?? 0n;
  const hasWithdrawableAmount = greaterThan(denominationAssetAvailable, 0n);

  // Check if user has denomination assets to top up
  const userDenominationAssetBalanceAvailable =
    userDenominationAssetBalance?.holder?.available ?? 0n;
  const hasTopUpableAmount = greaterThan(
    userDenominationAssetBalanceAvailable,
    0n
  );

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

    // Top up denomination asset option
    if (hasTopUpableAmount) {
      arr.push({
        id: "topUpDenominationAsset",
        label: t("tokens:actions.topUpDenominationAsset.label"),
        icon: TrendingUp,
        openAction: "topUpDenominationAsset",
        disabled: false,
      });
    }

    // Withdraw denomination asset option
    const canWithdrawDenominationAsset =
      asset.userPermissions?.actions?.withdrawDenominationAsset &&
      hasWithdrawableAmount;
    if (canWithdrawDenominationAsset) {
      arr.push({
        id: "withdrawDenominationAsset",
        label: t("tokens:actions.withdrawDenominationAsset.label"),
        icon: Minus,
        openAction: "withdrawDenominationAsset",
        disabled: !hasWithdrawableAmount,
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
    hasWithdrawableAmount,
    hasTopUpableAmount,
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

      <WithdrawDenominationAssetSheet
        open={isCurrentAction({
          target: "withdrawDenominationAsset",
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
