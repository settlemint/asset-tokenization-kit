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
import type { TokenBalance } from "@/orpc/routes/user/routes/user.assets.schema";
import { AssetExtensionEnum } from "@atk/zod/asset-extensions";
import { useQuery } from "@tanstack/react-query";
import { isAfter } from "date-fns";
import { greaterThan } from "dnum";
import {
  CheckCircle,
  ChevronDown,
  Lock,
  Minus,
  Pause,
  Play,
  Plus,
  Send,
  Shield,
  TrendingUp,
  Unlock,
} from "lucide-react";
import { useMemo, useState, type ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { CollateralSheet } from "./sheets/collateral-sheet";
import { FreezePartialSheet } from "./sheets/freeze-partial-sheet";
import { MatureConfirmationSheet } from "./sheets/mature-confirmation-sheet";
import { MintSheet } from "./sheets/mint-sheet";
import { PauseUnpauseConfirmationSheet } from "./sheets/pause-unpause-confirmation-sheet";
import { SetYieldScheduleSheet } from "./sheets/set-yield-schedule-sheet";
import { TopUpDenominationAssetSheet } from "./sheets/top-up-denomination-asset-sheet";
import { TransferAssetSheet } from "./sheets/transfer-asset-sheet";
import { UnfreezePartialSheet } from "./sheets/unfreeze-partial-sheet";
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
  | "mature"
  | "freezePartial"
  | "unfreezePartial"
  | "withdrawDenominationAsset"
  | "transfer";

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
  const { data: yieldSchedule } = useQuery(
    orpc.fixedYieldSchedule.read.queryOptions({
      input: { id: yieldScheduleId ?? "" },
      enabled: !!yieldScheduleId,
    })
  );

  // Fetch denomination asset details
  const denominationAssetId = yieldSchedule?.denominationAsset?.id;
  const { data: denominationAsset } = useQuery(
    orpc.token.read.queryOptions({
      input: { tokenAddress: denominationAssetId ?? "" },
      enabled: !!denominationAssetId,
    })
  );

  // Fetch yield schedule's denomination asset balance to check if withdrawal is possible
  const { data: yieldScheduleBalance } = useQuery(
    orpc.token.holder.queryOptions({
      input: {
        tokenAddress: denominationAsset?.id ?? "",
        holderAddress: yieldSchedule?.id ?? "",
      },
      enabled: !!denominationAsset && !!yieldSchedule,
    })
  );

  // Fetch user's balance of the denomination asset
  const { data: userDenominationAssetBalance } = useQuery(
    orpc.token.holder.queryOptions({
      input: {
        tokenAddress: denominationAsset?.id ?? "",
        holderAddress: userWallet ?? "",
      },
      enabled: !!userWallet && !!denominationAsset,
    })
  );

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

  const { data: userAssetBalanceResult } = useQuery(
    orpc.token.holder.queryOptions({
      input: {
        tokenAddress: asset.id,
        holderAddress: userWallet ?? "",
      },
      enabled: Boolean(userWallet),
    })
  );

  const userHolderBalance = userAssetBalanceResult?.holder ?? null;

  const transferSheetAsset = useMemo<TokenBalance | null>(() => {
    if (!userHolderBalance) {
      return null;
    }

    return {
      id: asset.id,
      value: userHolderBalance.value,
      frozen: userHolderBalance.frozen,
      available: userHolderBalance.available,
      token: {
        id: asset.id,
        name: asset.name,
        symbol: asset.symbol,
        decimals: asset.decimals,
        totalSupply: asset.totalSupply,
      },
    } satisfies TokenBalance;
  }, [
    asset.decimals,
    asset.id,
    asset.name,
    asset.symbol,
    asset.totalSupply,
    userHolderBalance,
  ]);

  const canTransfer =
    Boolean(asset.userPermissions?.actions?.transfer) &&
    Boolean(userWallet) &&
    !isPaused;
  const hasTransferableAmount = (transferSheetAsset?.available?.[0] ?? 0n) > 0n;

  const actions = useMemo(() => {
    // Check if asset has pausable capability (handles both null and undefined)
    const hasPausableCapability = asset.pausable != null;
    const arr: Array<{
      id: string;
      label: string;
      icon: ComponentType<{ className?: string }>;
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

    // Freeze Tokens - only visible for tokens with custodian extension and permissions
    const hasCustodianCapability = asset.extensions.includes(
      AssetExtensionEnum.CUSTODIAN
    );
    const canFreezePartial =
      asset.userPermissions?.actions?.freezePartial && !isPaused;
    if (hasCustodianCapability && canFreezePartial) {
      arr.push({
        id: "freezePartial",
        label: t("tokens:actions.freezePartial.label"),
        icon: Lock,
        openAction: "freezePartial",
        disabled: false,
      });
    }

    // Unfreeze Tokens - only visible for tokens with custodian extension and permissions
    const canUnfreezePartial =
      asset.userPermissions?.actions?.unfreezePartial && !isPaused;
    if (hasCustodianCapability && canUnfreezePartial) {
      arr.push({
        id: "unfreezePartial",
        label: t("tokens:actions.unfreezePartial.label"),
        icon: Unlock,
        openAction: "unfreezePartial",
        disabled: false,
      });
    }

    if (canTransfer) {
      arr.push({
        id: "transfer",
        label: t("tokens:actions.transfer.label"),
        icon: Send,
        openAction: "transfer",
        disabled: !hasTransferableAmount,
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

    // Mature bond only visible for bond tokens that can be matured
    const canMatureBond =
      asset.extensions.includes(AssetExtensionEnum.BOND) &&
      asset.bond &&
      !asset.bond.isMatured &&
      asset.bond.maturityDate &&
      isAfter(new Date(), asset.bond.maturityDate) &&
      asset.userPermissions?.actions?.mature &&
      !isPaused;
    if (canMatureBond) {
      arr.push({
        id: "mature",
        label: t("tokens:actions.mature.label"),
        icon: CheckCircle,
        openAction: "mature",
        disabled: false,
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
    asset.bond,
    isPaused,
    hasWithdrawableAmount,
    hasTopUpableAmount,
    canTransfer,
    hasTransferableAmount,
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

      <MatureConfirmationSheet
        open={isCurrentAction({ target: "mature", current: openAction })}
        onOpenChange={onActionOpenChange}
        asset={asset}
      />

      <FreezePartialSheet
        open={isCurrentAction({ target: "freezePartial", current: openAction })}
        onOpenChange={onActionOpenChange}
        asset={asset}
      />

      <UnfreezePartialSheet
        open={isCurrentAction({
          target: "unfreezePartial",
          current: openAction,
        })}
        onOpenChange={onActionOpenChange}
        asset={asset}
      />

      {transferSheetAsset && (
        <TransferAssetSheet
          open={isCurrentAction({ target: "transfer", current: openAction })}
          onClose={onActionOpenChange}
          assetBalance={transferSheetAsset}
        />
      )}

      {/* Change roles is available from the token tab permissions UI */}
    </>
  );
}
