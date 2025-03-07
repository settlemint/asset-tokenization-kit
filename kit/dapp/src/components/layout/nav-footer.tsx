"use client";
import {
  BriefcaseIcon,
  type BriefcaseIconHandle,
} from "@/components/ui/animated-icons/briefcase";
import {
  HomeIcon,
  type HomeIconHandle,
} from "@/components/ui/animated-icons/home";
import {
  SettingsGearIcon,
  type SettingsGearIconHandle,
} from "@/components/ui/animated-icons/settings-gear";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, usePathname } from "@/i18n/routing";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

const menuItemStyles =
  "flex items-center gap-2 px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

export function NavFooter() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const t = useTranslations("layout.navigation");
  const { data: session } = authClient.useSession();
  const userRole = session?.user?.role;
  const hasAdminAccess = userRole === "admin" || userRole === "issuer";

  // Create refs for each icon
  const homeIconRef = useRef<HomeIconHandle>(null);
  const adminIconRef = useRef<SettingsGearIconHandle>(null);
  const portfolioIconRef = useRef<BriefcaseIconHandle>(null);

  const isAdmin = pathname.startsWith("/admin");
  const currentSection = isAdmin ? t("admin") : t("portfolio");
  const currentIcon = isAdmin ? (
    <SettingsGearIcon className="size-4" />
  ) : (
    <BriefcaseIcon className="size-4" />
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton>
              <div className="flex w-full items-center justify-between">
                <span className="flex items-center gap-2">
                  {currentIcon}
                  {state === "expanded" && <span>{currentSection}</span>}
                </span>
                {state === "expanded" && <ChevronsUpDown />}
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-(--radix-dropdown-menu-trigger-width) rounded shadow-dropdown"
          >
            <DropdownMenuItem asChild>
              <Link
                href="/"
                className={cn(
                  menuItemStyles,
                  pathname === "/" && "bg-sidebar-accent font-medium"
                )}
                onMouseEnter={() => homeIconRef.current?.startAnimation()}
                onMouseLeave={() => homeIconRef.current?.stopAnimation()}
              >
                <HomeIcon ref={homeIconRef} className="size-4" />
                {t("home")}
                {pathname === "/" && <Check />}
              </Link>
            </DropdownMenuItem>
            {hasAdminAccess && (
              <DropdownMenuItem asChild>
                <Link
                  href="/admin"
                  className={cn(
                    menuItemStyles,
                    isAdmin && "bg-sidebar-accent font-medium"
                  )}
                  onMouseEnter={() => adminIconRef.current?.startAnimation()}
                  onMouseLeave={() => adminIconRef.current?.stopAnimation()}
                >
                  <SettingsGearIcon ref={adminIconRef} className="size-4" />
                  {t("admin")}
                  {isAdmin && <Check />}
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link
                href="/portfolio"
                className={cn(
                  menuItemStyles,
                  !isAdmin && "bg-sidebar-accent font-medium"
                )}
                onMouseEnter={() => portfolioIconRef.current?.startAnimation()}
                onMouseLeave={() => portfolioIconRef.current?.stopAnimation()}
              >
                <BriefcaseIcon ref={portfolioIconRef} className="size-4" />
                {t("portfolio")}
                {!isAdmin && <Check />}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
