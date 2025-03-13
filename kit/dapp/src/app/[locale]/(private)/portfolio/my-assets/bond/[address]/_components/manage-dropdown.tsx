"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import type { Address } from "viem";
import { TransferForm } from "./transfer-form/form";
import type { getBondDetail } from "@/lib/queries/bond/bond-detail";

interface ManageDropdownProps {
  address: Address;
  bond: Awaited<ReturnType<typeof getBondDetail>>;
}

export function ManageDropdown({ address, bond }: ManageDropdownProps) {
  const t = useTranslations("portfolio.my-assets.bond");

  const menuItems = useMemo(
    () => [
      {
        id: "transfer",
        label: t("transfer-form.trigger-label"),
      },
    ],
    [t]
  );

  const [openMenuItem, setOpenMenuItem] = useState<(typeof menuItems)[number]["id"] | null>(null);

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
            {t("transfer-form.trigger-label")}
            <ChevronDown className="size-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="relative right-4 w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded p-0 shadow-dropdown">
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
        balance={Number(bond.totalSupply)}
        decimals={bond.decimals}
        open={openMenuItem === "transfer"}
        onOpenChange={onFormOpenChange}
      />
    </>
  );
}