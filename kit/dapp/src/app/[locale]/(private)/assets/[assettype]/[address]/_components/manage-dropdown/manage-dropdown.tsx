"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "@/i18n/routing";
import type { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import type { getAssetDetail } from "@/lib/queries/asset-detail";
import type { getBondDetail } from "@/lib/queries/bond/bond-detail";
import type { getTokenizedDepositDetail } from "@/lib/queries/tokenizeddeposit/tokenizeddeposit-detail";
import type { AssetType } from "@/lib/utils/zod";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
import { blockUserEnabled } from "../block-form/enabled";
import { BlockForm } from "../block-form/form";
import { MintForm } from "../mint-form/form";
import { BurnForm } from "./burn-form/form";
import { GrantRoleForm } from "./grant-role-form/form";
import { MatureForm } from "./mature-form/form";
import { PauseForm } from "./pause-form/form";
import { TopUpForm } from "./top-up-form/form";
import { UpdateCollateralForm } from "./update-collateral-form/form";
import { WithdrawForm } from "./withdraw-form/form";

interface ManageDropdownProps {
  address: Address;
  assettype: AssetType;
  assetDetails: Awaited<ReturnType<typeof getAssetDetail>>;
  userBalance: Awaited<ReturnType<typeof getAssetBalanceDetail>>;
}

export function ManageDropdown({
  address,
  assettype,
  assetDetails,
  userBalance,
}: ManageDropdownProps) {
  const router = useRouter();
  const t = useTranslations("private.assets.detail.forms");
  const [openMenuItem, setOpenMenuItem] = useState<
    | (
        | typeof contractActions
        | typeof userActions
        | typeof events
      )[number]["id"]
    | null
  >(null);

  const onFormOpenChange = (open: boolean) => {
    if (!open) {
      setOpenMenuItem(null);
    }
  };

  let canMature = false;
  let hasUnderlyingAsset = false;
  if (assettype === "bond") {
    const bond = assetDetails as Awaited<ReturnType<typeof getBondDetail>>;
    hasUnderlyingAsset = true;
    canMature = Boolean(
      !bond.isMatured &&
        bond.hasSufficientUnderlying &&
        bond.maturityDate &&
        new Date(Number(bond.maturityDate)) > new Date()
    );
  }

  let mintMaxLimit: number | undefined = undefined;
  if (assettype === "stablecoin" || assettype === "tokenizeddeposit") {
    const tokenizedDeposit = assetDetails as Awaited<
      ReturnType<typeof getTokenizedDepositDetail>
    >;
    const freeCollateral = tokenizedDeposit.freeCollateral;
    mintMaxLimit = freeCollateral;
  }

  const isBlocked = userBalance?.blocked ?? false;
  const isPaused = "paused" in assetDetails && assetDetails.paused;

  const userIsSupplyManager = userBalance?.asset.supplyManagers.some(
    (manager) => manager.id === userBalance?.account.id
  );
  const userIsUserManager = userBalance?.asset.userManagers.some(
    (manager) => manager.id === userBalance?.account.id
  );
  const userIsAdmin = userBalance?.asset.admins.some(
    (admin) => admin.id === userBalance?.account.id
  );

  const contractActions = [
    {
      id: "mint",
      label: t("actions.mint"),
      hidden: false,
      disabled: isBlocked || isPaused || !userIsSupplyManager,
      form: (
        <MintForm
          key="mint"
          address={address}
          assettype={assettype}
          open={openMenuItem === "mint"}
          onOpenChange={onFormOpenChange}
          maxLimit={mintMaxLimit}
        />
      ),
    },
    {
      id: "burn",
      label: t("actions.burn"),
      hidden: false,
      disabled: isBlocked || isPaused || !userIsSupplyManager,
      form: (
        <BurnForm
          key="burn"
          address={address}
          assettype={assettype}
          maxLimit={userBalance?.available}
          open={openMenuItem === "burn"}
          onOpenChange={onFormOpenChange}
        />
      ),
    },
    {
      id: "mature",
      label: t("actions.mature"),
      disabled: !canMature || isBlocked || isPaused || !userIsSupplyManager,
      hidden: assettype !== "bond",
      form: (
        <MatureForm
          key="mature"
          address={address}
          open={openMenuItem === "mature"}
          onOpenChange={onFormOpenChange}
        />
      ),
    },
    {
      id: "top-up",
      label: t("actions.top-up"),
      hidden: !hasUnderlyingAsset,
      disabled: isBlocked || isPaused || !userIsSupplyManager,
      form: (
        <TopUpForm
          key="top-up"
          address={address}
          underlyingAssetAddress={
            "underlyingAsset" in assetDetails
              ? assetDetails.underlyingAsset
              : "0x0"
          }
          open={openMenuItem === "top-up"}
          onOpenChange={onFormOpenChange}
        />
      ),
    },
    {
      id: "withdraw",
      label: t("actions.withdraw"),
      hidden: !hasUnderlyingAsset,
      disabled: isBlocked || isPaused || !userIsSupplyManager,
      form: (
        <WithdrawForm
          key="withdraw"
          address={address}
          underlyingAssetAddress={
            "underlyingAsset" in assetDetails
              ? assetDetails.underlyingAsset
              : "0x0"
          }
          open={openMenuItem === "withdraw"}
          onOpenChange={onFormOpenChange}
        />
      ),
    },

    {
      id: "update-collateral",
      label: t("actions.update-collateral"),
      hidden: !["stablecoin", "tokenizeddeposit"].includes(assettype),
      disabled: isBlocked || isPaused || !userIsSupplyManager,
      form: (
        <UpdateCollateralForm
          key="update-collateral"
          assettype={assettype}
          address={address}
          open={openMenuItem === "update-collateral"}
          onOpenChange={onFormOpenChange}
        />
      ),
    },
    {
      id: "pause",
      label:
        "paused" in assetDetails && assetDetails.paused
          ? t("actions.unpause")
          : t("actions.pause"),
      hidden: !("paused" in assetDetails),
      disabled: isBlocked || !userIsAdmin,
      form: (
        <PauseForm
          key="pause"
          address={address}
          assettype={assettype}
          isPaused={"paused" in assetDetails && assetDetails.paused}
          open={openMenuItem === "pause"}
          onOpenChange={onFormOpenChange}
        />
      ),
    },
  ] as const;

  const canPerformUserActions = !isBlocked && !isPaused && userIsUserManager;
  const userActions = [
    {
      id: "grant-role",
      label: t("actions.grant-role"),
      hidden: !canPerformUserActions,
      form: (
        <GrantRoleForm
          key="grant-role"
          address={address}
          open={openMenuItem === "grant-role"}
          onOpenChange={onFormOpenChange}
          assettype={assettype}
        />
      ),
    },
    {
      id: "block-user",
      label: t("actions.block-user"),
      hidden: !blockUserEnabled(assettype) || !canPerformUserActions,
      form: (
        <BlockForm
          key="block-user"
          address={address}
          open={openMenuItem === "block-user"}
          onOpenChange={onFormOpenChange}
          assettype={assettype}
        />
      ),
    },
  ] as const;

  const events = [
    {
      id: "view-events",
      label: t("actions.view-events"),
      onClick: () => {
        router.push(`/assets/${assettype}/${address}/events`);
      },
    },
  ] as const;

  const availableContractActions = contractActions.filter(
    (item) => !item.hidden
  );
  const availableUserActions = userActions.filter((item) => !item.hidden);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            className="bg-accent text-accent-foreground shadow-inset hover:bg-accent-hover"
          >
            {t("manage")}
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="relative right-4 w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded shadow-dropdown">
          {availableContractActions.map((item) => (
            <DropdownMenuItem
              key={item.id}
              onSelect={() => setOpenMenuItem(item.id)}
              disabled={item.disabled}
            >
              {item.label}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator hidden={availableUserActions.length === 0} />
          {availableUserActions.map((item) => (
            <DropdownMenuItem
              key={item.id}
              onSelect={() => setOpenMenuItem(item.id)}
            >
              {item.label}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          {events.map((item) => (
            <DropdownMenuItem key={item.id} onSelect={item.onClick}>
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {[...contractActions, ...userActions]
        .filter((item) => !item.hidden)
        .map((item) => item.form)}
    </>
  );
}
