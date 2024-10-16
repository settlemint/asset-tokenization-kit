"use client";

import type { NavItemType } from "@/components/global/navigation/navigation-item";
import { MobileNavigation } from "@/components/global/navigation/navigation-mobile";
import type { BreadcrumbItemType } from "@/components/ui/collapsed-breadcrumb/collapsed-breadcrumb";
import CollapsedBreadcrumb from "@/components/ui/collapsed-breadcrumb/collapsed-breadcrumb";
import { Profile } from "../identity/profile";

interface SecureHeaderProps {
  breadcrumbItems: BreadcrumbItemType[];
  navItems?: Record<string, NavItemType[]>;
}

export function SecureHeader({ breadcrumbItems, navItems = { main: [], footer: [] } }: SecureHeaderProps) {
  return (
    <header className="SecureHeader relative flex h-14 items-center justify-between gap-4 px-4 lg:h-[60px] lg:px-6">
      <div className="flex items-center gap-4 flex-grow">
        <MobileNavigation navItems={navItems} />
        <CollapsedBreadcrumb maxVisibleItems={2} items={breadcrumbItems} />
      </div>
      <div className="flex items-center gap-4">
        <Profile />
      </div>
    </header>
  );
}
