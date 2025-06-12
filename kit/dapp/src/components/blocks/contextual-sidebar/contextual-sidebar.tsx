"use client";

import { Logo } from "@/components/blocks/logo/logo";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { OrganizationSwitcher } from "../organization-switcher/organization-switcher";

export function ContextualSidebar() {
  const t = useTranslations("layout.header");

  return (
    <Sidebar collapsible="icon" className="group-data-[side=left]:border-0">
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
      <SidebarContent className="pt-4"></SidebarContent>
      <SidebarFooter>
        <Separator />
        <OrganizationSwitcher
          organizations={[
            {
              name: "Organization 1",
              logo: Logo,
              plan: "Free",
            },
          ]}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
