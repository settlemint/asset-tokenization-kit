import { SidebarNavigation } from "@/components/global/navigation/navigation-sidebar";
import { Logo } from "@/components/public/logo";
import { Toaster } from "@/components/ui/sonner";
import { Link } from "@/lib/i18n";
import type { PropsWithChildren } from "react";
import type { BreadcrumbItemType } from "../breadcrumb/ellipsis-dropdown";
import type { NavItemType } from "../navigation/navigation-item";
import { SecureHeader } from "./secure-header";

interface SecureMainLayoutProps extends PropsWithChildren {
  breadcrumbItems?: BreadcrumbItemType[];
  navItems?: Record<string, NavItemType[]>;
}

export function SecureMainLayout({
  children,
  breadcrumbItems,
  navItems = { main: [], footer: [] },
}: SecureMainLayoutProps) {
  return (
    <div className="SecureMainLayout grid min-h-screen w-full md:grid-cols-[165px_1fr] lg:grid-cols-[210px_1fr] bg-background">
      <div className="SecureMainLayout__sidebar hidden md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center justify-left px-3 py-2 lg:h-[64px] lg:px-4">
            <Link href="/wallet" className="flex items-center gap-2 font-semibold">
              <Logo />
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <SidebarNavigation navItems={navItems} />
          </div>
        </div>
      </div>
      <div className="SecureMainLayout__content flex flex-col">
        <SecureHeader breadcrumbItems={breadcrumbItems ?? []} navItems={navItems} />
        <main className="SecureMainLayout__main flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-accent rounded-tl-[14px]">
          {children}
        </main>
      </div>
      <Toaster richColors />
    </div>
  );
}
