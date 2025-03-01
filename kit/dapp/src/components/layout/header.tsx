'use client';
import { UserDropdown } from '@/components/layout/user-dropdown';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Search } from '../blocks/search/search';

export default function Header() {
  return (
    <header className="h-[90px]! flex shrink-0 items-center gap-2 bg-sidebar transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Search />
      </div>
      <div className="ml-auto flex items-center gap-2 px-4">
        <UserDropdown />
      </div>
    </header>
  );
}
