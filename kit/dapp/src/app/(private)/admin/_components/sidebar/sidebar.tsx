import { NavFooter } from '@/components/layout/nav-footer';
import { NavHeader } from '@/components/layout/nav-header';
import { NavMain } from '@/components/layout/nav-main';
import { TokenDesignerButton } from '@/components/layout/token-designer-button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { AssetManagement } from './items/asset-management/asset-management';
import { bottomItems } from './items/bottom';
import { topItems } from './items/top';

export function NavSidebar() {
  return (
    <Sidebar collapsible="icon" className="group-data-[side=left]:border-0">
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
    </Sidebar>
  );
}
