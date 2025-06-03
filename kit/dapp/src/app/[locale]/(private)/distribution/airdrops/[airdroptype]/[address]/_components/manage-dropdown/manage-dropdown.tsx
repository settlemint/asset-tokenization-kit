"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Address } from "viem";

interface AirdropManageDropdownProps {
  address: Address;
}

export function AirdropManageDropdown({ address }: AirdropManageDropdownProps) {
  const t = useTranslations("private.airdrops.detail.forms");

  return (
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
        {/* Empty for now - will be populated with airdrop-specific actions */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
