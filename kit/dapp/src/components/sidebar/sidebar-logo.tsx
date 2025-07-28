import { Logo } from "@/components/logo/logo";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

/**
 * Sidebar logo component that displays the SettleMint logo and app name.
 */
export function SidebarLogo() {
  const { t } = useTranslation(["general"]);
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          asChild
        >
          <Link to="/" className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center">
              <Logo variant="icon" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="font-bold text-sm text-foreground">
                {t("general:appName")}
              </span>
              <span className="-mt-1 overflow-hidden truncate text-ellipsis text-md text-xs leading-snug text-foreground">
                {t("general:appDescription")}
              </span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
