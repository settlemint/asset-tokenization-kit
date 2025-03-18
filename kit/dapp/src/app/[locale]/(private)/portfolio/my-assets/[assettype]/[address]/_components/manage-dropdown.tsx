"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import type { getAssetDetail } from "@/lib/queries/asset-detail";
import type { AssetType } from "@/lib/utils/zod";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
import { RedeemForm } from "./redeem-form/form";
import { TransferForm } from "./transfer-form/form";

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
  const t = useTranslations("portfolio.my-assets.detail");

  const menuItems = [
    {
      id: "transfer",
      label: t("forms.actions.transfer"),
    },
    ...(assettype === "bond"
      ? [
          {
            id: "redeem",
            label: t("forms.actions.redeem"),
          },
        ]
      : []),
  ] as const;

  const [openMenuItem, setOpenMenuItem] = useState<
    (typeof menuItems)[number]["id"] | null
  >(null);

  const onFormOpenChange = (open: boolean) => {
    if (!open) {
      setOpenMenuItem(null);
    }
  };

  const isBlocked = userBalance?.blocked ?? false;
  const isPaused = "paused" in assetDetails && assetDetails.paused;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            className="bg-accent text-accent-foreground shadow-inset hover:bg-accent-hover"
          >
            {t("manage")}
            <ChevronDown className="ml-2 size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="relative right-4 w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded shadow-dropdown">
          {menuItems.map((item) => (
            <DropdownMenuItem
              key={item.id}
              onSelect={() => setOpenMenuItem(item.id)}
            >
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <TransferForm
        address={address}
        assettype={assettype}
        balance={Number(userBalance?.available ?? 0)}
        open={openMenuItem === "transfer"}
        onOpenChange={onFormOpenChange}
        disabled={isBlocked || isPaused || (userBalance?.available ?? 0) === 0}
      />
      {assettype === "bond" && (
        <RedeemForm
          address={address}
          balance={Number(userBalance?.available ?? 0)}
          open={openMenuItem === "redeem"}
          onOpenChange={onFormOpenChange}
          disabled={isBlocked || isPaused}
        />
      )}
    </>
  );
}
