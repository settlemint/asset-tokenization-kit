import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { getFundDetail } from "@/lib/queries/fund/fund-detail";
import { ChevronDown } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { BurnForm } from "./burn-form/form";
import { GrantRoleForm } from "./grant-role-form/form";
import { MintForm } from "./mint-form/form";
import { PauseForm } from "./pause-form/form";

interface ManageDropdownProps {
  address: Address;
}

export async function ManageDropdown({ address }: ManageDropdownProps) {
  const t = await getTranslations("admin.funds.manage");
  const fund = await getFundDetail({ address });

  return (
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
        <DropdownMenuItem>
          <MintForm address={address} />
        </DropdownMenuItem>
        <DropdownMenuItem>
          <BurnForm address={address} balance={Number(fund.totalSupply)} />
        </DropdownMenuItem>
        <DropdownMenuItem>
          <PauseForm address={address} isPaused={fund.paused} />
        </DropdownMenuItem>
        <Separator />
        <DropdownMenuItem>
          <GrantRoleForm address={address} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
