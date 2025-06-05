"use client";

import { useRef } from "react";

import { ChevronsUpDownIcon } from "@/components/ui/chevrons-up-down";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname, useRouter } from "@/i18n/routing";
import { authClient } from "@/lib/auth/client";
import { useTranslations } from "next-intl";
import { ChartLineIcon, type ChartLineIconHandle } from "../ui/chart-line";
import { HandCoinsIcon, type HandCoinsIconHandle } from "../ui/hand-coins";
import {
  SettingsGearIcon,
  type SettingsGearIconHandle,
} from "../ui/settings-gear";

export function NavMode() {
  const t = useTranslations("layout.modeswitch");
  const router = useRouter();
  const pathname = usePathname();

  const handCoinsRef = useRef<HandCoinsIconHandle>(null);
  const chartLineRef = useRef<ChartLineIconHandle>(null);
  const settingsGearRef = useRef<SettingsGearIconHandle>(null);

  const { data: session } = authClient.useSession();
  const userRole = session?.user?.role;
  const mode =
    pathname.includes("/assets") ||
    pathname.includes("/actions") ||
    pathname.includes("/distribution")
      ? "assets"
      : pathname.includes("/platform")
        ? "platform"
        : "portfolio";

  function handleMouseEnter() {
    if (mode === "assets") {
      handCoinsRef.current?.startAnimation();
    } else if (mode === "portfolio") {
      chartLineRef.current?.startAnimation();
    } else if (mode === "platform") {
      settingsGearRef.current?.startAnimation();
    }
  }

  function handleMouseLeave() {
    if (mode === "assets") {
      handCoinsRef.current?.stopAnimation();
    } else if (mode === "portfolio") {
      chartLineRef.current?.stopAnimation();
    } else if (mode === "platform") {
      settingsGearRef.current?.stopAnimation();
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="default"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {mode === "assets" && (
                <HandCoinsIcon
                  ref={handCoinsRef}
                  className="size-6 p-1 bg-accent text-white cursor-pointer select-none rounded transition-colors duration-200 flex items-center justify-center"
                />
              )}
              {mode === "portfolio" && (
                <ChartLineIcon
                  ref={chartLineRef}
                  className="size-6 p-1 bg-accent text-white cursor-pointer select-none rounded transition-colors duration-200 flex items-center justify-center"
                />
              )}
              {mode === "platform" && (
                <SettingsGearIcon
                  ref={settingsGearRef}
                  className="size-6 p-1 bg-accent text-white cursor-pointer select-none rounded transition-colors duration-200 flex items-center justify-center"
                />
              )}
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {mode === "assets" && t("assets")}
                  {mode === "portfolio" && t("portfolio")}
                  {mode === "platform" && t("platform")}
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side="top"
            align="center"
          >
            <DropdownMenuLabel>{t("label")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={mode}
              onValueChange={(value) => {
                router.push(`/${value}`);
              }}
            >
              <DropdownMenuRadioItem value="portfolio">
                {t("portfolio")}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="assets">
                {t("assets")}
              </DropdownMenuRadioItem>
              {userRole === "admin" && (
                <DropdownMenuRadioItem value="platform">
                  {t("platform")}
                </DropdownMenuRadioItem>
              )}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
