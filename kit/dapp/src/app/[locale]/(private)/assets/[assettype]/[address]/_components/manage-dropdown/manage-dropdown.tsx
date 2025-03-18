"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/routing";
import type { getAssetDetail } from "@/lib/queries/asset-detail";
import type { getBondDetail } from "@/lib/queries/bond/bond-detail";
import type { AssetType } from "@/lib/utils/zod";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
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
  detail: Awaited<ReturnType<typeof getAssetDetail>>;
}

export function ManageDropdown({
  address,
  detail,
  assettype,
}: ManageDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isInPortfolio = pathname.includes("portfolio");

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
    const bond = detail as Awaited<ReturnType<typeof getBondDetail>>;
    hasUnderlyingAsset = true;
    canMature = Boolean(
      !bond.isMatured &&
        bond.hasSufficientUnderlying &&
        bond.maturityDate &&
        new Date(Number(bond.maturityDate)) > new Date()
    );
  }

  const contractActions = [
    {
      id: "mint",
      label: t("actions.mint"),
      hidden: false,
      disabled: false,
      form: (
        <MintForm
          key="mint"
          address={address}
          assettype={assettype}
          open={openMenuItem === "mint"}
          onOpenChange={onFormOpenChange}
        />
      ),
    },
    {
      id: "burn",
      label: t("actions.burn"),
      hidden: false,
      disabled: false,
      form: (
        <BurnForm
          key="burn"
          address={address}
          assettype={assettype}
          balance={Number(detail.totalSupply)}
          open={openMenuItem === "burn"}
          onOpenChange={onFormOpenChange}
        />
      ),
    },
    {
      id: "mature",
      label: t("actions.mature"),
      disabled: !canMature,
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
      disabled: false,
      form: (
        <TopUpForm
          key="top-up"
          address={address}
          underlyingAssetAddress={
            "underlyingAsset" in detail ? detail.underlyingAsset : "0x0"
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
      disabled: false,
      form: (
        <WithdrawForm
          key="withdraw"
          address={address}
          underlyingAssetAddress={
            "underlyingAsset" in detail ? detail.underlyingAsset : "0x0"
          }
          open={openMenuItem === "withdraw"}
          onOpenChange={onFormOpenChange}
        />
      ),
    },

    {
      id: "update-collateral",
      label: t("actions.update-collateral"),
      hidden: assettype !== "stablecoin",
      disabled: false,
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
        "paused" in detail && detail.paused
          ? t("actions.unpause")
          : t("actions.pause"),
      hidden: !("paused" in detail),
      disabled: false,
      form: (
        <PauseForm
          key="pause"
          address={address}
          assettype={assettype}
          isPaused={"paused" in detail && detail.paused}
          open={openMenuItem === "pause"}
          onOpenChange={onFormOpenChange}
        />
      ),
    },
  ] as const;

  const userActions = [
    {
      id: "grant-role",
      label: t("actions.grant-role"),
      hidden: false,
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
      hidden: assettype !== "bond",
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
          {contractActions
            .filter((item) => !item.hidden)
            .map((item) => (
              <DropdownMenuItem
                key={item.id}
                onSelect={() => setOpenMenuItem(item.id)}
                disabled={item.disabled}
              >
                {item.label}
              </DropdownMenuItem>
            ))}

          <DropdownMenuSeparator />
          {userActions
            .filter((item) => !item.hidden)
            .map((item) => (
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
