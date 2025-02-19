'use client';

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '../blocks/logo/logo';

export function NavHeader() {
  const pathname = usePathname();
  const content = (
    <div className={cn('flex w-full items-center gap-3')}>
      <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
        <Logo variant="icon" />
      </div>
      <div className="mb-2 flex flex-col gap-0.5 leading-none">
        <span className="font-bold text-lg">SettleMint</span>
        <span className="-mt-1 text-md">Asset Tokenization</span>
      </div>
    </div>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          {pathname.includes('/admin') ? (
            <Link href="/admin">{content}</Link>
          ) : pathname.includes('/portfolio') ? (
            <Link href="/portfolio">{content}</Link>
          ) : (
            content
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
