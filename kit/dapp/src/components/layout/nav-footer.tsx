'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { authClient } from '@/lib/auth/client';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItemStyles =
  'flex items-center justify-between px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground';

export function NavFooter() {
  const { data } = authClient.useSession();
  const pathname = usePathname();

  if (!['admin', 'issuer'].includes(data?.user.role ?? 'user')) {
    return null;
  }

  const isAdmin = pathname.startsWith('/admin');
  const currentSection = isAdmin ? 'Admin' : 'Portfolio';

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton>
              <span className="flex-1">{currentSection}</span>
              <ChevronsUpDown />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[--radix-dropdown-menu-trigger-width] rounded-xl p-0 shadow-dropdown"
          >
            <DropdownMenuItem asChild>
              <Link href="/admin" className={cn(menuItemStyles, isAdmin && 'bg-sidebar-accent font-medium')}>
                Admin
                {isAdmin && <Check />}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/portfolio" className={cn(menuItemStyles, !isAdmin && 'bg-sidebar-accent font-medium')}>
                Portfolio
                {!isAdmin && <Check />}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
