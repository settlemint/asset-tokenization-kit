import { NavFooter } from '@/components/layout/nav-footer';
import { NavHeader } from '@/components/layout/nav-header';
import { NavMain } from '@/components/layout/nav-main';
import NavSidebar from '@/components/layout/nav-sidebar';
import { TokenDesignerButton } from '@/components/layout/token-designer-button';
import { SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarSeparator } from '@/components/ui/sidebar';
import { AssetManagement } from './items/asset-management/asset-management';
import { bottomItems } from './items/bottom';
import { topItems } from './items/top';

export function AdminSidebar() {
  return (
    <NavSidebar>
      <SidebarHeader>
        <NavHeader />
      </SidebarHeader>
      <SidebarContent>
        <TokenDesignerButton />
        <NavMain items={topItems} />
        <AssetManagement />
        <NavMain items={bottomItems} />
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <NavFooter />
      </SidebarFooter>
      <SidebarRail />
    </NavSidebar>
  );
}
