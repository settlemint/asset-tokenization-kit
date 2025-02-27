import { NavFooter } from '@/components/layout/nav-footer';
import { NavHeader } from '@/components/layout/nav-header';
import { NavMain } from '@/components/layout/nav-main';
import NavSidebar from '@/components/layout/nav-sidebar';
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { topItems } from './items/top';

export function PortfolioSidebar() {
  return (
    <NavSidebar>
      <SidebarHeader>
        <NavHeader />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={topItems} />
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <NavFooter />
      </SidebarFooter>
      <SidebarRail />
    </NavSidebar>
  );
}
