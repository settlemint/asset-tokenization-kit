import { NavMain } from "@/components/layout/nav-main";
import { ActivityIcon } from "@/components/ui/activity";
import { ChartScatterIcon } from "@/components/ui/chart-scatter";
import { HandCoinsIcon } from "@/components/ui/hand-coins";
import { MailCheckIcon } from "@/components/ui/mail-check";
import { PlusIcon } from "@/components/ui/plus";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersIcon } from "@/components/ui/users";
import { getTranslations } from "next-intl/server";
import { ContextualSidebarHeader } from "./contextual-sidebar-header";

export async function ContextualSidebar() {
  const t = await getTranslations("admin.sidebar.portfolio-management");

  return (
    <Sidebar className="group-data-[side=left]:border-0">
      <ContextualSidebarHeader />
      <Tabs defaultValue="issuer" className="mt-4 w-full flex flex-col flex-1">
        <TabsList className="w-full bg-sidebar px-4">
          <TabsTrigger value="investor">Investor</TabsTrigger>
          <TabsTrigger value="issuer">Issuer</TabsTrigger>
        </TabsList>
        <TabsContent value="investor" className="flex flex-col h-full">
          <SidebarContent className="flex flex-col">
            <NavMain
              items={[
                {
                  label: t("dashboard"),
                  icon: (
                    <ChartScatterIcon className="size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
                  ),
                  path: "/portfolio",
                },
                {
                  label: t("my-actions"),
                  icon: (
                    <MailCheckIcon className="size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
                  ),
                  path: "/portfolio/my-actions/pending",
                  badge: "10",
                },
              ]}
            />
            <NavMain
              items={[
                {
                  groupTitle: t("group-title"),
                  items: [
                    {
                      label: t("my-assets"),
                      icon: (
                        <HandCoinsIcon className="size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
                      ),
                      path: "/portfolio/my-assets",
                    },
                  ],
                },
              ]}
            />
            <NavMain
              className="mt-auto"
              size="sm"
              items={[
                {
                  label: t("my-activity"),
                  icon: (
                    <ActivityIcon className="size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
                  ),
                  path: "/portfolio/my-activity",
                },
                {
                  label: t("my-contacts"),
                  icon: (
                    <UsersIcon className="size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
                  ),
                  path: "/portfolio/my-contacts",
                },
              ]}
            />
          </SidebarContent>
        </TabsContent>
        <TabsContent value="issuer" className="flex flex-col h-full">
          <SidebarContent className="flex flex-col">
            <NavMain
              items={[
                {
                  label: t("dashboard"),
                  icon: (
                    <ChartScatterIcon className="size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
                  ),
                  path: "/portfolio",
                },
                {
                  label: t("my-actions"),
                  icon: (
                    <MailCheckIcon className="size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
                  ),
                  path: "/portfolio/my-actions/pending",
                  badge: "10",
                },
              ]}
            />
            <NavMain
              items={[
                {
                  groupTitle: t("group-title"),
                  items: [
                    {
                      label: t("my-assets"),
                      icon: (
                        <HandCoinsIcon className="size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
                      ),
                      path: "/portfolio/my-assets",
                    },
                  ],
                },
              ]}
            />
            <NavMain
              className="mt-auto"
              size="sm"
              items={[
                {
                  label: t("my-activity"),
                  icon: (
                    <ActivityIcon className="size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
                  ),
                  path: "/portfolio/my-activity",
                },
                {
                  label: t("my-contacts"),
                  icon: (
                    <UsersIcon className="size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
                  ),
                  path: "/portfolio/my-contacts",
                },
              ]}
            />
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
        </TabsContent>
        <TabsContent value="platform" className="flex flex-col h-full">
          <SidebarContent className="flex flex-col">
            <NavMain
              items={[
                {
                  label: t("dashboard"),
                  icon: (
                    <ChartScatterIcon className="size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
                  ),
                  path: "/portfolio",
                },
                {
                  label: t("my-actions"),
                  icon: (
                    <MailCheckIcon className="size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
                  ),
                  path: "/portfolio/my-actions/pending",
                },
              ]}
            />
            <NavMain
              items={[
                {
                  groupTitle: t("group-title"),
                  items: [
                    {
                      label: t("my-assets"),
                      icon: (
                        <HandCoinsIcon className="size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
                      ),
                      path: "/portfolio/my-assets",
                    },
                  ],
                },
              ]}
            />
            <NavMain
              className="mt-auto"
              size="sm"
              items={[
                {
                  label: t("my-activity"),
                  icon: (
                    <ActivityIcon className="size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
                  ),
                  path: "/portfolio/my-activity",
                },
                {
                  label: t("my-contacts"),
                  icon: (
                    <UsersIcon className="size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
                  ),
                  path: "/portfolio/my-contacts",
                },
              ]}
            />
          </SidebarContent>
        </TabsContent>
      </Tabs>

      <SidebarRail />
    </Sidebar>
  );
}
