"use client";

import { Logo } from "@/components/blocks/logo/logo";
import { PlusIcon } from "@/components/ui/plus";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

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
      <SidebarContent className="pt-4">
        <Tabs defaultValue="issuer" className="w-full">
          <TabsList className="w-full bg-sidebar">
            <TabsTrigger value="investor">Investor</TabsTrigger>
            <TabsTrigger value="issuer">Issuer</TabsTrigger>
            <TabsTrigger value="platform">Platform</TabsTrigger>
          </TabsList>
          <TabsContent value="investor">
            Make changes to your account here.
          </TabsContent>
          <TabsContent value="issuer">Change your password here.</TabsContent>
          <TabsContent value="admin">Admin</TabsContent>
        </Tabs>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton
          size="lg"
          variant={"outline"}
          className="bg-sidebar-primary data-[state=open]:bg-sidebar-primary data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <PlusIcon />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">Asset Designer</span>
          </div>
        </SidebarMenuButton>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
