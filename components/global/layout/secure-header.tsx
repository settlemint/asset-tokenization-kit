import Breadcrumbs from "@/components/global/breadcrumb/breadcrumbs";
import type { BreadcrumbItemType } from "@/components/global/breadcrumb/ellipsis-dropdown";
import type { NavItemType } from "@/components/global/navigation/navigation-item";
import { MobileNavigation } from "@/components/global/navigation/navigation-mobile";

interface SecureHeaderProps {
  breadcrumbItems: BreadcrumbItemType[];
  navItems?: Record<string, NavItemType[]>;
}

export function SecureHeader({ breadcrumbItems, navItems = { main: [], footer: [] } }: SecureHeaderProps) {
  return (
    <header className="SecureHeader flex h-14 items-center gap-4 px-4 lg:h-[60px] lg:px-6">
      <MobileNavigation navItems={navItems} />
      <Breadcrumbs items={breadcrumbItems} />
    </header>
  );
}
