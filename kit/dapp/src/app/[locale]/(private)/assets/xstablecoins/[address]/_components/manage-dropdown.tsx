"use client";

import { GrantRoleForm } from "@/components/blocks/asset-grant-role/form";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { stablecoinGrantRoleAction } from "@/lib/mutations/asset/access-control/grant-role/grant-role-action";
import type { getStableCoinDetail } from "@/lib/queries/stablecoin/stablecoin-detail";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import type { Address } from "viem";
import { BurnForm } from "./burn-form/form";
import { MintForm } from "./mint-form/form";
import { PauseForm } from "./pause-form/form";
import { UpdateCollateralForm } from "./update-collateral-form/form";

interface ManageDropdownProps {
  address: Address;
  stableCoin: Awaited<ReturnType<typeof getStableCoinDetail>>;
}

export function ManageDropdown({ address, stableCoin }: ManageDropdownProps) {
  const t = useTranslations("admin.stablecoins.manage");

  const menuItems = useMemo(
    () =>
      [
        {
          id: "mint",
          label: t("actions.mint"),
        },
        {
          id: "burn",
          label: t("actions.burn"),
        },
        {
          id: "pause",
          label: stableCoin.paused ? t("actions.unpause") : t("actions.pause"),
        },
        {
          id: "update-collateral",
          label: t("actions.update-collateral"),
        },
        {
          id: "grant-role",
          label: t("actions.grant-role"),
        },
      ] as const,
    [t, stableCoin.paused]
  );
  const [openMenuItem, setOpenMenuItem] = useState<
    (typeof menuItems)[number]["id"] | null
  >(null);

  const onFormOpenChange = (open: boolean) => {
    if (!open) {
      setOpenMenuItem(null);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            className="bg-accent text-accent-foreground hover:bg-accent-hover shadow-inset"
          >
            {t("manage")}
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="relative right-4 w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-md p-1 shadow-dropdown">
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
      <MintForm
        address={address}
        freeCollateral={stableCoin.freeCollateral}
        symbol={stableCoin.symbol}
        open={openMenuItem === "mint"}
        onOpenChange={onFormOpenChange}
      />
      <BurnForm
        address={address}
        balance={Number(stableCoin.totalSupply)}
        open={openMenuItem === "burn"}
        onOpenChange={onFormOpenChange}
      />
      <PauseForm
        address={address}
        isPaused={stableCoin.paused}
        open={openMenuItem === "pause"}
        onOpenChange={onFormOpenChange}
      />
      <UpdateCollateralForm
        address={address}
        open={openMenuItem === "update-collateral"}
        onOpenChange={onFormOpenChange}
      />
      <GrantRoleForm
        address={address}
        open={openMenuItem === "grant-role"}
        onOpenChange={onFormOpenChange}
        grantRoleAction={stablecoinGrantRoleAction}
      />
    </>
  );
}
