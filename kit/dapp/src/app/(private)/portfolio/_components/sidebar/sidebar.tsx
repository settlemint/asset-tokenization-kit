import { NavFooter } from '@/components/layout/nav-footer';
import { NavHeader } from '@/components/layout/nav-header';
import { type NavElement, NavMain } from '@/components/layout/nav-main';
import NavSidebar from '@/components/layout/nav-sidebar';
import { ActivityIcon } from '@/components/ui/animated-icons/activity';
import { ChartScatterIcon } from '@/components/ui/animated-icons/chart-scatter';
import { UsersIcon } from '@/components/ui/animated-icons/users';
import { WalletIcon } from '@/components/ui/animated-icons/wallet';
import { SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarSeparator } from '@/components/ui/sidebar';

export function PortfolioSidebar() {
  const sidebarData: NavElement[] = [
    {
      label: 'Dashboard',
      icon: <ChartScatterIcon className="h-4 w-4" />,
      path: '/portfolio',
    },
    {
      label: 'My Assets',
      icon: <WalletIcon className="h-4 w-4" />,
      path: '/portfolio/my-assets',
    },
    {
      label: 'Activity',
      icon: <ActivityIcon className="h-4 w-4" />,
      path: '/portfolio/activity',
    },
    {
      label: 'My Contacts',
      icon: <UsersIcon className="h-4 w-4" />,
      path: '/portfolio/contacts',
    },
  ];
  return (
    <NavSidebar>
      <SidebarHeader>
        <NavHeader />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData} />
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <NavFooter />
      </SidebarFooter>
      <SidebarRail />
    </NavSidebar>
  );
}
