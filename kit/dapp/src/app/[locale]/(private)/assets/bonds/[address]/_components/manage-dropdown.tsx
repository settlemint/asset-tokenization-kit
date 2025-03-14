"use client";

import { GrantRoleForm } from "@/components/blocks/asset-grant-role/form";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { bondGrantRoleAction } from "@/lib/mutations/asset/access-control/grant-role/grant-role-action";
import type { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import type { Address } from "viem";
import { BurnForm } from "./burn-form/form";
import { MatureForm } from "./mature-form/form";
import { MintForm } from "./mint-form/form";
import { PauseForm } from "./pause-form/form";
import { TopUpForm } from "./top-up-form/form";
import { WithdrawForm } from "./withdraw-form/form";

interface ManageDropdownProps {
  address: Address;
  bond: Awaited<ReturnType<typeof getBondDetail>>;
}

export function ManageDropdown({ address, bond }: ManageDropdownProps) {
  const t = useTranslations("admin.bonds.manage");

  const cannotMature: boolean =
    bond.isMatured ||
    !bond.hasSufficientUnderlying ||
    (bond.maturityDate
      ? new Date(Number(bond.maturityDate) * 1000) < new Date()
      : false);

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
          label: bond.paused ? t("actions.unpause") : t("actions.pause"),
        },
        {
          id: "grant-role",
          label: t("actions.grant-role"),
        },
        {
          id: "top-up",
          label: t("actions.top-up"),
        },
        {
          id: "withdraw",
          label: t("actions.withdraw"),
        },
        {
          id: "mature",
          label: t("actions.mature"),
          disabled: cannotMature,
        },
      ] as const,
    [t, bond.paused, cannotMature]
  ) as { id: string; label: string; disabled?: boolean }[];

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
        <DropdownMenuContent className="relative right-4 w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded p-0 shadow-dropdown">
          {menuItems.map((item) => (
            <DropdownMenuItem
              key={item.id}
              onSelect={() => setOpenMenuItem(item.id)}
              disabled={item.disabled}
            >
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <MintForm
        address={address}
        open={openMenuItem === "mint"}
        onOpenChange={onFormOpenChange}
      />
      <BurnForm
        address={address}
        balance={Number(bond.totalSupply)}
        open={openMenuItem === "burn"}
        onOpenChange={onFormOpenChange}
      />
      <PauseForm
        address={address}
        isPaused={bond.paused}
        open={openMenuItem === "pause"}
        onOpenChange={onFormOpenChange}
      />
      <GrantRoleForm
        address={address}
        open={openMenuItem === "grant-role"}
        onOpenChange={onFormOpenChange}
        grantRoleAction={bondGrantRoleAction}
      />
      <TopUpForm
        address={address}
        underlyingAssetAddress={bond.underlyingAsset}
        open={openMenuItem === "top-up"}
        onOpenChange={onFormOpenChange}
      />
      <WithdrawForm
        address={address}
        underlyingAssetAddress={bond.underlyingAsset}
        open={openMenuItem === "withdraw"}
        onOpenChange={onFormOpenChange}
      />
      <MatureForm
        address={address}
        open={openMenuItem === "mature"}
        onOpenChange={onFormOpenChange}
      />
    </>
  );
}
