'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { authClient } from '@/lib/auth/client';
import { Building2, ChevronsUpDown, Plus, Wallet2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

export function NavFooter() {
  const { isMobile } = useSidebar();
  const { data: organizations } = authClient.useListOrganizations();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  useEffect(() => {
    if (!activeOrganization) {
      authClient.organization.setActive({
        organizationId: organizations?.[0]?.id,
      });
    }
  }, [activeOrganization, organizations]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {activeOrganization?.logo && (
                  <Image
                    src={activeOrganization.logo}
                    alt={activeOrganization.name}
                    width={24}
                    height={24}
                    className="size-4 shrink-0"
                  />
                )}
                {!activeOrganization?.logo && <Building2 className="size-4 shrink-0" />}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{activeOrganization?.name}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">Organizations</DropdownMenuLabel>
            {(organizations ?? []).map((team) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() =>
                  authClient.organization.setActive({
                    organizationId: team.id,
                  })
                }
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  {team.logo && (
                    <Image src={team.logo} alt={team.name} width={24} height={24} className="size-4 shrink-0" />
                  )}
                  {!team.logo && <Building2 className="size-4 shrink-0" />}
                </div>
                {team.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground hover:text-foreground">Add organization</div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border-primary bg-primary">
                <Wallet2 className="size-4" />
              </div>
              <Link href="/portfolio">My portfolio</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
