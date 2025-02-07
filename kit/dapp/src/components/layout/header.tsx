'use client';
import { UserDropdown } from '@/components/layout/user-dropdown';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import CollapsedBreadcrumbs from '../blocks/collapsed-breadcrumb/collapsed-breadcrumb';

export default function Header() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <header className="flex h-[90px] shrink-0 items-center gap-2 bg-sidebar transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <CollapsedBreadcrumbs routeSegments={segments} />
      </div>
      <div className="ml-auto flex items-center gap-2 px-4">
        <UserDropdown />
      </div>
    </header>
  );
}
