'use client';

import { HeaderSearch } from '@/components/layout/header-search';
import { UserDropdown } from '@/components/layout/user-dropdown';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <HeaderSearch />
      </div>
      <div className="ml-auto flex items-center gap-2 px-4">
        <UserDropdown />
      </div>
    </header>
  );
}
