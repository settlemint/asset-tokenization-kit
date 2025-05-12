"use client";

import { ApproveForm } from "@/components/blocks/xvp/approve-form/form";
import { ExecuteForm } from "@/components/blocks/xvp/claim-form/form";
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

interface ManageDropdownProps {
  xvp: XvPSettlement;
  userAddress: Address;
}

export function ManageDropdown({ xvp }: ManageDropdownProps) {
  const t = useTranslations("trade-management.xvp");

  const menuItems = [
    {
      id: "approve",
      label: t("approve"),
    },
    {
      id: "execute",
      label: t("execute"),
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
        xvp={xvp.id}
        open={openMenuItem === "approve"}
        onOpenChange={onFormOpenChange}
      />

      <ExecuteForm
        xvp={xvp.id}
        open={openMenuItem === "execute"}
        onOpenChange={onFormOpenChange}
      />
    </>
  );
}
