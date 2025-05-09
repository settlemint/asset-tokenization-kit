"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { XvPSettlement } from "@/lib/queries/xvp/xvp-schema";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
import { ApproveForm } from "./approve-form/form";

interface ManageDropdownProps {
  xvp: XvPSettlement;
  userAddress: Address;
}

export function ManageDropdown({ xvp, userAddress }: ManageDropdownProps) {
  const t = useTranslations("trade-management.xvp");

  const menuItems = [
    {
      id: "approve",
      label: t("approve"),
    },
  ] as const;

  const [openMenuItem, setOpenMenuItem] = useState<
    (typeof menuItems)[number]["id"] | null
  >(null);

  const onFormOpenChange = (open: boolean) => {
    if (!open) {
      setOpenMenuItem(null);
    }
  };

  const isApproved = xvp.approvals.some(
    (approval) => approval.account.id === userAddress
  );

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

      <ApproveForm
        xvp={xvp}
        userAddress={userAddress}
        open={openMenuItem === "approve"}
        onOpenChange={onFormOpenChange}
      />
    </>
  );
}
