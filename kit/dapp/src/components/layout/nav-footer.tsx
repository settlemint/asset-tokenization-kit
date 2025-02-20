'use client';
import { BriefcaseIcon } from '@/components/ui/animated-icons/briefcase';
import { SettingsGearIcon } from '@/components/ui/animated-icons/settings-gear';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { authClient } from '@/lib/auth/client';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItemStyles =
  'flex items-center gap-2 px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground';

export function NavFooter() {
  const { data } = authClient.useSession();
  const pathname = usePathname();
  const { state } = useSidebar();

  if (!['admin', 'issuer'].includes(data?.user.role ?? 'user')) {
    return null;
  }

  const isAdmin = pathname.startsWith('/admin');
  const currentSection = isAdmin ? 'Admin' : 'Portfolio';
  const currentIcon = isAdmin ? <SettingsGearIcon className="h-4 w-4" /> : <BriefcaseIcon className="h-4 w-4" />;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton>
              <div className="flex w-full items-center justify-between">
                <span className="flex items-center gap-2">
                  {currentIcon}
                  {state === 'expanded' && <span>{currentSection}</span>}
                </span>
                {state === 'expanded' && <ChevronsUpDown />}
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[--radix-dropdown-menu-trigger-width] rounded-xl p-0 shadow-dropdown"
          >
            <DropdownMenuItem asChild>
              <Link href="/admin" className={cn(menuItemStyles, isAdmin && 'bg-sidebar-accent font-medium')}>
                <SettingsGearIcon className="h-4 w-4" />
                Admin
                {isAdmin && <Check />}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/portfolio" className={cn(menuItemStyles, !isAdmin && 'bg-sidebar-accent font-medium')}>
                <BriefcaseIcon className="h-4 w-4" />
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
