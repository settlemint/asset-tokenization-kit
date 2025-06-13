"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserAirdropDetail } from "@/lib/queries/airdrop/user-airdrop-schema";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";

interface MyAirdropManageDropdownProps {
  address: Address;
  airdropDetails: UserAirdropDetail;
}

export function MyAirdropManageDropdown({
  address,
  airdropDetails,
}: MyAirdropManageDropdownProps) {
  const t = useTranslations("portfolio.my-airdrops.details.forms");
  const [openMenuItem, setOpenMenuItem] = useState<"claim" | null>(null);

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
            className="bg-accent text-accent-foreground shadow-inset hover:bg-accent-hover"
          >
            {t("manage")}
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="relative right-4 w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded shadow-dropdown">
          {/* TODO: add actions */}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
