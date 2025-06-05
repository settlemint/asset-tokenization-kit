"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PushAirdrop } from "@/lib/queries/push-airdrop/push-airdrop-schema";
import type { StandardAirdrop } from "@/lib/queries/standard-airdrop/standard-airdrop-schema";
import type { VestingAirdrop } from "@/lib/queries/vesting-airdrop/vesting-airdrop-schema";
import { AirdropTypeEnum } from "@/lib/utils/typebox/airdrop-types";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { PushTokensForm } from "../push-tokens-form/form";

interface AirdropManageDropdownProps {
  airdrop: PushAirdrop | StandardAirdrop | VestingAirdrop;
}

export function AirdropManageDropdown({ airdrop }: AirdropManageDropdownProps) {
  const t = useTranslations("private.airdrops.detail.forms");

  const menuItems = [
    ...(airdrop.type === AirdropTypeEnum.push
      ? [
          {
            id: "push",
            label: "Push tokens to all recipients",
          },
        ]
      : []),
  ];

  const [openMenuItem, setOpenMenuItem] = useState<
    (typeof menuItems)[number]["id"] | null
  >(null);

  const onFormOpenChange = (open: boolean) => {
    if (!open) {
      setOpenMenuItem(null);
    }
  };

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
        {menuItems.map((item) => (
          <DropdownMenuItem
            key={item.id}
            onSelect={() => setOpenMenuItem(item.id)}
          >
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>

      <PushTokensForm
        airdrop={airdrop as PushAirdrop}
        open={openMenuItem === "push"}
        onOpenChange={onFormOpenChange}
        disabled={airdrop.type !== AirdropTypeEnum.push}
      />
    </DropdownMenu>
  );
}
