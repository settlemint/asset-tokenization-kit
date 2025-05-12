"use client";

import { ApproveForm } from "@/components/blocks/xvp/approve-form/form";
import { ExecuteForm } from "@/components/blocks/xvp/execute-form/form";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth/client";
import type { XvPSettlement } from "@/lib/queries/xvp/xvp-schema";
import { isBefore } from "date-fns";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { getAddress, type Address } from "viem";

interface ManageDropdownProps {
  xvp: XvPSettlement;
  userAddress: Address;
}

export function ManageDropdown({ xvp }: ManageDropdownProps) {
  const t = useTranslations("trade-management.xvp");
  const user = authClient.useSession();
  const userHasApproved = xvp.approvals.some(
    (approval) =>
      getAddress(approval.account.id) === user.data?.user.wallet &&
      approval.approved
  );
  const isApproved = xvp.approvals.every((approval) => approval.approved);
  const isExpired = isBefore(Number(xvp.cutoffDate) * 1000, new Date());
  const isCancelled = xvp.cancelled;
  const isExecuted = xvp.executed;
  const actionsDisabled = isCancelled || isExpired || isExecuted;

  const menuItems = [
    {
      id: "approve",
      label: t("approve"),
      disabled: userHasApproved || actionsDisabled,
    },
    {
      id: "execute",
      label: t("execute"),
      disabled: !isApproved || actionsDisabled,
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
              disabled={item.disabled}
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
