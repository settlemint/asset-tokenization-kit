"use client";

// import { CreateBondForm } from "@/app/(private)/admin/bonds/_components/create-form/form";
// import { CreateCryptocurrencyForm } from "@/app/(private)/admin/cryptocurrencies/_components/create-form/form";
// import { CreateEquityForm } from "@/app/(private)/admin/equities/_components/create-form/form";
// import { CreateFundForm } from "@/app/(private)/admin/funds/_components/create-form/form";

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
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { CreateBondForm } from "../../bonds/_components/create-form/form";
import { CreateCryptoCurrencyForm } from "../../cryptocurrencies/_components/create-form/form";
import { CreateEquityForm } from "../../equities/_components/create-form/form";
import { CreateFundForm } from "../../funds/_components/create-form/form";
import { CreateStablecoinForm } from "../../stablecoins/_components/create-form/form";

export function DesignerButton() {
  const t = useTranslations("admin.sidebar");
  const { state, isMobile } = useSidebar();
  const [tokenType, setTokenType] = useState<
    "bond" | "cryptocurrency" | "equity" | "fund" | "stablecoin" | null
  >(null);
  const frameIconRef = useRef<FrameIconHandle>(null);

  return (
    <SidebarGroup className="mt-2">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                onMouseEnter={() => frameIconRef.current?.startAnimation()}
                onMouseLeave={() => frameIconRef.current?.stopAnimation()}
                className="bg-primary text-primary-foreground"
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
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <CreateBondForm
        open={tokenType === "bond"}
        onCloseAction={() => setTokenType(null)}
      />
      <CreateCryptoCurrencyForm
        open={tokenType === "cryptocurrency"}
        onCloseAction={() => setTokenType(null)}
      />
      <CreateEquityForm
        open={tokenType === "equity"}
        onCloseAction={() => setTokenType(null)}
      />
      <CreateFundForm
        open={tokenType === "fund"}
        onCloseAction={() => setTokenType(null)}
      />
      <CreateStablecoinForm
        open={tokenType === "stablecoin"}
        onCloseAction={() => setTokenType(null)}
      />
    </SidebarGroup>
  );
}
