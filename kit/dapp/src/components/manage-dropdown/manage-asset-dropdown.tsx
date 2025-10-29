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

  const hasTokenPermissions = Object.values(
    asset.userPermissions?.roles ?? {}
  ).some(Boolean);

  const isPaused = asset.pausable?.paused ?? false;
  const yieldScheduleId = asset.yield?.schedule?.id;

  // Fetch yield schedule details when available
  const { data: yieldSchedule } = useQuery(
    orpc.fixedYieldSchedule.read.queryOptions({
      input: { contract: yieldScheduleId ?? "" },
      enabled: !!yieldScheduleId,
    })
  );

  // Fetch denomination asset details
  const denominationAssetId = yieldSchedule?.denominationAsset?.id;

  // Fetch yield schedule's denomination asset balance to check if withdrawal is possible
  const { data: yieldScheduleBalance } = useQuery(
    orpc.token.holder.queryOptions({
      input: {
        tokenAddress: denominationAssetId ?? "",
        holderAddress: yieldSchedule?.id ?? "",
      },
      enabled: !!denominationAssetId && !!yieldSchedule,
    })
  );

  // Fetch user's balance of the denomination asset
  const { data: userDenominationAssetBalance } = useQuery(
    orpc.token.holder.queryOptions({
      input: {
        tokenAddress: denominationAssetId ?? "",
        holderAddress: userWallet ?? "",
      },
      enabled: !!userWallet && !!denominationAssetId,
    })
  );

  // Check if yield schedule has denomination assets to withdraw
  const denominationAssetAvailable =
    yieldScheduleBalance?.holder?.available?.[0] ?? 0n;
  const hasWithdrawableAmount = greaterThan(denominationAssetAvailable, 0n);

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
        yield: null,
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

  const actions = useMemo(() => {
    const arr: Array<{
      id: string;
      label: string;
      icon: ComponentType<{ className?: string }>;
      openAction: Action;
      disabled: boolean;
      disabledMessage: string;
    }> = [];

    if (hasTokenPermissions) {
      // Check if asset has pausable capability (handles both null and undefined)
      const hasPausableCapability = asset.pausable != null;
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
          disabledMessage: isPaused
            ? t("tokens:actions.unpause.notAuthorized")
            : t("tokens:actions.pause.notAuthorized"),
        });
      }

      // Mint only visible if user can mint and token is not paused
      const canMint = asset.userPermissions?.actions?.mint;
      arr.push({
        id: "mint",
        label: t("tokens:actions.mint.label"),
        icon: Plus,
        openAction: "mint",
        disabled: isPaused || !canMint,
        disabledMessage: canMint
          ? t("tokens:actions.tokenPaused")
          : t("tokens:actions.mint.notAuthorized"),
      });

      // Freeze Tokens - only visible for tokens with custodian extension and permissions
      const hasCustodianCapability = asset.extensions.includes(
        AssetExtensionEnum.CUSTODIAN
      );
      const canFreezePartial = asset.userPermissions?.actions?.freezePartial;
      if (hasCustodianCapability) {
        arr.push({
          id: "freezePartial",
          label: t("tokens:actions.freezePartial.label"),
          icon: Lock,
          openAction: "freezePartial",
          disabled: isPaused || !canFreezePartial,
          disabledMessage: canFreezePartial
            ? t("tokens:actions.tokenPaused")
            : t("tokens:actions.freezePartial.notAuthorized"),
        });
      }

      // Unfreeze Tokens - only visible for tokens with custodian extension and permissions
      const canUnfreezePartial =
        asset.userPermissions?.actions?.unfreezePartial;
      if (hasCustodianCapability) {
        arr.push({
          id: "unfreezePartial",
          label: t("tokens:actions.unfreezePartial.label"),
          icon: Unlock,
          openAction: "unfreezePartial",
          disabled: isPaused || !canUnfreezePartial,
          disabledMessage: canUnfreezePartial
            ? t("tokens:actions.tokenPaused")
            : t("tokens:actions.unfreezePartial.notAuthorized"),
        });
      }
    }

    const canTransfer =
      Boolean(asset.userPermissions?.actions?.transfer) && Boolean(userWallet);
    const hasTransferableAmount =
      (transferSheetAsset?.available?.[0] ?? 0n) > 0n;
    if (canTransfer) {
      arr.push({
        id: "transfer",
        label: t("tokens:actions.transfer.label"),
        icon: Send,
        openAction: "transfer",
        disabled: !hasTransferableAmount,
        disabledMessage: t("tokens:actions.transfer.noBalance", {
          symbol: asset.symbol,
        }),
      });
    }

    if (hasTokenPermissions) {
      // Set yield schedule only visible for bond tokens without existing schedule
      const hasYieldScheduleCapability = asset.extensions.includes(
        AssetExtensionEnum.YIELD
      );
      const canSetYieldSchedule =
        asset.userPermissions?.actions?.setYieldSchedule;
      if (hasYieldScheduleCapability && !asset.yield?.schedule) {
        arr.push({
          id: "setYieldSchedule",
          label: t("tokens:actions.setYieldSchedule.label"),
          icon: TrendingUp,
          openAction: "setYieldSchedule",
          disabled: isPaused || !canSetYieldSchedule,
          disabledMessage: canSetYieldSchedule
            ? t("tokens:actions.tokenPaused")
            : t("tokens:actions.setYieldSchedule.notAuthorized"),
        });
      }

      // Top up denomination asset option
      // Check if user has denomination assets to top up
      const userDenominationAssetBalanceAvailable =
        userDenominationAssetBalance?.holder?.available ?? 0n;
      const hasTopUpableAmount = greaterThan(
        userDenominationAssetBalanceAvailable,
        0n
      );
      if (hasYieldScheduleCapability) {
        arr.push({
          id: "topUpDenominationAsset",
          label: t("tokens:actions.topUpDenominationAsset.label"),
          icon: TrendingUp,
          openAction: "topUpDenominationAsset",
          disabled: !hasTopUpableAmount,
          disabledMessage: t(
            "tokens:actions.topUpDenominationAsset.noBalance",
            {
              symbol: asset.yield?.schedule?.denominationAsset?.symbol ?? "",
            }
          ),
        });
      }

      // Withdraw denomination asset option
      const canWithdrawDenominationAsset =
        asset.userPermissions?.actions?.withdrawDenominationAsset;
      if (hasYieldScheduleCapability) {
        arr.push({
          id: "withdrawDenominationAsset",
          label: t("tokens:actions.withdrawDenominationAsset.label"),
          icon: Minus,
          openAction: "withdrawDenominationAsset",
          disabled: !hasWithdrawableAmount || !canWithdrawDenominationAsset,
          disabledMessage: canWithdrawDenominationAsset
            ? t("tokens:actions.withdrawDenominationAsset.noBalance", {
                symbol: yieldSchedule?.denominationAsset?.symbol ?? "",
              })
            : t("tokens:actions.withdrawDenominationAsset.notAuthorized"),
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
          disabledMessage: t("tokens:actions.collateral.notAuthorized"),
        });
      }

      // Mature bond only visible for bond tokens that can be matured
      const hasBondCapability =
        asset.extensions.includes(AssetExtensionEnum.BOND) && asset.bond;
      const isReadyToMature =
        !asset.bond?.isMatured &&
        asset.bond?.maturityDate &&
        isAfter(new Date(), asset.bond.maturityDate);
      const canMatureBond = asset.userPermissions?.actions?.mature;
      if (hasBondCapability && isReadyToMature) {
        arr.push({
          id: "mature",
          label: t("tokens:actions.mature.label"),
          icon: CheckCircle,
          openAction: "mature",
          disabled: !canMatureBond || isPaused,
          disabledMessage: canMatureBond
            ? t("tokens:actions.tokenPaused")
            : t("tokens:actions.mature.notAuthorized"),
        });
      }
    }

    return arr;
  }, [
    t,
    hasTokenPermissions,
    asset.pausable,
    asset.extensions,
    asset.yield?.schedule,
    asset.userPermissions?.actions,
    asset.collateral,
    asset.bond,
    isPaused,
    hasWithdrawableAmount,
    yieldSchedule,
    userDenominationAssetBalance,
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
              className="cursor-pointer"
              disabled={action.disabled}
            >
              {action.disabled ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 pointer-events-auto">
                      <action.icon className="h-4 w-4" />
                      {action.label}
                    </div>
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
          onClose={() => {
            onActionOpenChange(false);
          }}
          assetBalance={transferSheetAsset}
        />
      )}

      {/* Change roles is available from the token tab permissions UI */}
    </>
  );
}
