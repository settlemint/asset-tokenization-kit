"use client";

import {
  FrameIcon,
  type FrameIconHandle,
} from "@/components/ui/animated-icons/frame";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { User } from "@/lib/queries/user/user-schema";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { CreateBondForm } from "./bond/form";
import { CreateCryptoCurrencyForm } from "./cryptocurrency/form";
import { CreateDepositForm } from "./deposit/form";
import { CreateEquityForm } from "./equity/form";
import { CreateFundForm } from "./fund/form";
import { CreateStablecoinForm } from "./stablecoin/form";

export function DesignerButton({ userDetails }: { userDetails: User }) {
  const t = useTranslations("admin.sidebar");
  const { isMobile } = useSidebar();
  const [tokenType, setTokenType] = useState<
    | "bond"
    | "cryptocurrency"
    | "equity"
    | "fund"
    | "stablecoin"
    | "tokenized-deposit"
    | null
  >(null);
  const frameIconRef = useRef<FrameIconHandle>(null);
  const onFormOpenChange = (open: boolean) => {
    if (!open) {
      setTokenType(null);
    }
  };
  return (
    <SidebarGroup className="mt-2">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                onMouseEnter={() => frameIconRef.current?.startAnimation()}
                onMouseLeave={() => frameIconRef.current?.stopAnimation()}
                className="bg-accent text-primary-foreground shadow-dropdown shadow-inset hover:bg-accent-hover hover:text-primary-foreground"
              >
                <FrameIcon ref={frameIconRef} className="size-4" />
                <span>{t("asset-designer")}</span>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="-translate-y-2 w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-md shadow-dropdown"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={16}
            >
              <DropdownMenuItem onSelect={() => setTokenType("bond")}>
                {t("asset-types.bond")}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTokenType("cryptocurrency")}>
                {t("asset-types.cryptocurrency")}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTokenType("equity")}>
                {t("asset-types.equity")}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTokenType("fund")}>
                {t("asset-types.fund")}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTokenType("stablecoin")}>
                {t("asset-types.stablecoin")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setTokenType("tokenized-deposit")}
              >
                {t("asset-types.tokenized-deposit")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <CreateBondForm
        open={tokenType === "bond"}
        onOpenChange={onFormOpenChange}
        userDetails={userDetails}
      />
      <CreateCryptoCurrencyForm
        open={tokenType === "cryptocurrency"}
        onOpenChange={onFormOpenChange}
        userDetails={userDetails}
      />
      <CreateEquityForm
        open={tokenType === "equity"}
        onOpenChange={onFormOpenChange}
        userDetails={userDetails}
      />
      <CreateFundForm
        open={tokenType === "fund"}
        onOpenChange={onFormOpenChange}
        userDetails={userDetails}
      />
      <CreateStablecoinForm
        open={tokenType === "stablecoin"}
        onOpenChange={onFormOpenChange}
        userDetails={userDetails}
      />
      <CreateDepositForm
        open={tokenType === "tokenized-deposit"}
        onOpenChange={onFormOpenChange}
        userDetails={userDetails}
      />
    </SidebarGroup>
  );
}
