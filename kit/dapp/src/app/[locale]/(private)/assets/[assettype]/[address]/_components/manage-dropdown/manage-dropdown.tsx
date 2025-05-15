"use client";

import { MatureForm } from "@/components/blocks/bonds/mature-form/form";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "@/i18n/routing";
import { getRoles, ROLES } from "@/lib/config/roles";
import type { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import type { getAssetDetail } from "@/lib/queries/asset-detail";
import type { getAssetUsersDetail } from "@/lib/queries/asset/asset-users-detail";
import type { getBondDetail } from "@/lib/queries/bond/bond-detail";
import type { getDepositDetail } from "@/lib/queries/deposit/deposit-detail";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { isBefore } from "date-fns";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { getAddress, type Address } from "viem";
import { AllowForm } from "../allow-form/form";
import { BlockForm } from "../block-form/form";
import { DisallowForm } from "../disallow-form/form";
import { hasAllowlist, hasBlocklist } from "../features-enabled";
import { MintForm } from "../mint-form/form";
import { UnblockForm } from "../unblock-form/form";
import { GrantRoleForm } from "./grant-role-form/form";
import { PauseForm } from "./pause-form/form";
import { TopUpForm } from "./top-up-form/form";
import { UpdateCollateralForm } from "./update-collateral-form/form";
import { WithdrawForm } from "./withdraw-form/form";
interface ManageDropdownProps {
  address: Address;
  assettype: AssetType;
  assetDetails: Awaited<ReturnType<typeof getAssetDetail>>;
  userBalance: Awaited<ReturnType<typeof getAssetBalanceDetail>>;
  userUnderlyingAssetBalance: Awaited<
    ReturnType<typeof getAssetBalanceDetail>
  > | null;
  assetUsersDetails: Awaited<ReturnType<typeof getAssetUsersDetail>>;
  userAddress: Address;
}

export function ManageDropdown({
  address,
  assettype,
  assetDetails,
  userBalance,
  userUnderlyingAssetBalance,
  assetUsersDetails,
  userAddress,
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
        isBefore(new Date(Number(bond.maturityDate) * 1000), new Date())
    );
  }

  let mintMax: number | undefined = undefined;
  if (assettype === "stablecoin" || assettype === "deposit") {
    const deposit = assetDetails as Awaited<
      ReturnType<typeof getDepositDetail>
    >;
    mintMax = deposit.freeCollateral;
  }
  if (assettype === "bond") {
    const bond = assetDetails as Awaited<ReturnType<typeof getBondDetail>>;
    mintMax =
      bond.totalSupply < bond.cap ? Number(bond.cap) - bond.totalSupply : 0;
  }

  const isBlocked = userBalance?.blocked ?? false;
  const isPaused = "paused" in assetDetails && assetDetails.paused;

  const userRoles =
    assetUsersDetails.roles.find((role) => getAddress(role.id) === userAddress)
      ?.roles ?? [];

  const userIsSupplyManager = userRoles.includes(
    ROLES.SUPPLY_MANAGEMENT_ROLE.contractRole
  );

  const userIsUserManager = userRoles.includes(
    ROLES.USER_MANAGEMENT_ROLE.contractRole
  );
  const userIsAdmin = userRoles.includes(ROLES.DEFAULT_ADMIN_ROLE.contractRole);
  const hasYieldSchedule =
    "yieldSchedule" in assetDetails && assetDetails.yieldSchedule !== null;
  const collateralIsExpired =
    "collateralProofValidity" in assetDetails &&
    assetDetails.collateralProofValidity !== undefined &&
    isBefore(assetDetails.collateralProofValidity, new Date());

  const mintLimitReached = mintMax === 0;

  const contractActions = [
    {
      id: "mint",
      label: t("actions.mint"),
      hidden: false,
      disabled:
        isBlocked ||
        isPaused ||
        !userIsSupplyManager ||
        collateralIsExpired ||
        mintLimitReached,
      form: (
        <MintForm
          key="mint"
          address={address}
          assettype={assettype}
          open={openMenuItem === "mint"}
          onOpenChange={onFormOpenChange}
          max={mintMax}
          decimals={assetDetails.decimals}
          symbol={assetDetails.symbol}
          allowlist={assetUsersDetails.allowlist ?? []}
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
      hidden: !hasUnderlyingAsset || assettype !== "bond",
      disabled: isBlocked || isPaused || !userIsSupplyManager,
      form:
        assettype === "bond" ? (
          <TopUpForm
            key="top-up"
            address={address}
            showTarget={hasYieldSchedule}
            open={openMenuItem === "top-up"}
            onOpenChange={onFormOpenChange}
            bondDetails={
              assetDetails as Awaited<ReturnType<typeof getBondDetail>>
            }
            userUnderlyingAssetBalance={userUnderlyingAssetBalance!}
          />
        ) : null,
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
          showTarget={hasYieldSchedule}
          open={openMenuItem === "withdraw"}
          onOpenChange={onFormOpenChange}
          bondDetails={
            assetDetails as Awaited<ReturnType<typeof getBondDetail>>
          }
        />
      ),
    },

    {
      id: "update-collateral",
      label: t("actions.update-collateral"),
      hidden: !["stablecoin", "deposit"].includes(assettype),
      disabled: isBlocked || isPaused || !userIsSupplyManager,
      form: (
        <UpdateCollateralForm
          key="update-collateral"
          assettype={assettype}
          address={address}
          open={openMenuItem === "update-collateral"}
          onOpenChange={onFormOpenChange}
          decimals={assetDetails.decimals}
          symbol={assetDetails.symbol}
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

  const assetSupportsUserManagement = getRoles(assettype).includes(
    ROLES.USER_MANAGEMENT_ROLE.contractRole
  );

  const canPerformUserActions =
    !isBlocked &&
    !isPaused &&
    (assetSupportsUserManagement ? userIsUserManager : userIsAdmin);

  const userActions = [
    {
      id: "grant-role",
      label: t("actions.grant-role"),
      hidden: !canPerformUserActions,
      disabled: false,
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
      hidden: !hasBlocklist(assettype) || !canPerformUserActions,
      disabled: false,
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
    {
      id: "unblock-user",
      label: t("actions.unblock-user"),
      hidden: !hasBlocklist(assettype) || !canPerformUserActions,
      disabled: (assetUsersDetails.blocklist?.length ?? 0) === 0,
      form: (
        <UnblockForm
          key="unblock-user"
          address={address}
          open={openMenuItem === "unblock-user"}
          onOpenChange={onFormOpenChange}
          assettype={assettype}
        />
      ),
    },
    {
      id: "allow-user",
      label: t("actions.allow-user"),
      hidden: !hasAllowlist(assettype) || !canPerformUserActions,
      disabled: false,
      form: (
        <AllowForm
          key="allow-user"
          address={address}
          open={openMenuItem === "allow-user"}
          onOpenChange={onFormOpenChange}
          assettype={assettype}
        />
      ),
    },
    {
      id: "disallow-user",
      label: t("actions.disallow-user"),
      hidden: !hasAllowlist(assettype) || !canPerformUserActions,
      disabled: (assetUsersDetails.allowlist?.length ?? 0) === 1,
      form: (
        <DisallowForm
          key="disallow-user"
          address={address}
          open={openMenuItem === "disallow-user"}
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
              disabled={item.disabled}
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
