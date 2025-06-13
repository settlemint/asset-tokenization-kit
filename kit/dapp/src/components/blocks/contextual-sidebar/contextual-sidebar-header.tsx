"use client";

import { Logo } from "@/components/blocks/logo/logo";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function ContextualSidebarHeader() {
  const t = useTranslations("layout.header");

  return (
    <SidebarHeader className="h-16">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
            <Link prefetch href="/">
              <div className={cn("flex w-full items-center gap-3")}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                  <Logo variant="icon" />
                </div>
                <div className="flex max-w-[180px] flex-col leading-none">
                  <span className="font-bold text-lg">{t("app-name")}</span>
                  <span className="-mt-1 overflow-hidden truncate text-ellipsis text-md leading-snug">
                    {t("app-description")}
                  </span>
                </div>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}
