import { NavFooter } from '@/components/layout/nav-footer';
import { NavHeader } from '@/components/layout/nav-header';
import { NavMain } from '@/components/layout/nav-main';
import { TokenDesignerButton } from '@/components/layout/token-designer-button';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';
import { bottomItems } from './items/bottom';
import { TokenManagement } from './items/token-management/token-management';
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
        <TokenManagement />
        <NavMain items={bottomItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavFooter />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
