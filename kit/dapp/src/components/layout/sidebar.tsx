'use client';
import { CreateTokenForm } from '@/app/(private)/admin/tokens/_components/create-token-form/create-token-form';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {} from '@/components/ui/sheet';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import type { User } from '@/lib/auth/types';
import { Pencil } from 'lucide-react';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { NavFooter } from './nav-footer';
import { NavHeader } from './nav-header';
import { NavMain, type SidebarSection } from './nav-main';
import { NavSecondary, type SidebarSecondarySection } from './nav-secondary';

export type SidebarData = {
  main: SidebarSection[];
  secondary: SidebarSecondarySection[];
  users: User[];
};

export function PrivateSidebar({
  ...props
}: ComponentProps<typeof Sidebar> & {
  role?: 'admin' | 'issuer' | 'user';
  mode?: 'admin' | 'portfolio';
  data: SidebarData;
}) {
  const { state } = useSidebar();
  const role = props.role ?? 'user';
  const mode = props.mode ?? 'portfolio';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavHeader />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {mode === 'admin' && (
              <SidebarMenuItem className="SidebarMenuItem w-full">
                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button className="flex w-full items-center gap-2">
                      <Pencil className="size-4" />
                      {state === 'expanded' && <span>Design</span>}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="flex w-[15rem] flex-col gap-2">
                    <DropdownMenuItem
                      onSelect={(e) => {
                        setOpen(true);
                      }}
                    >
                      Stable coin
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        setOpen(true);
                      }}
                    >
                      Equity
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        setOpen(true);
                      }}
                    >
                      Bond
                    </DropdownMenuItem>
                    <hr />
                    <DropdownMenuItem
                      onSelect={(e) => {
                        setOpen(true);
                      }}
                    >
                      New user
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetContent className="w-[33%] lg:max-w-[33%]">
                    <SheetHeader>
                      <SheetTitle>Design a new stable coin</SheetTitle>
                      <SheetDescription>Digital assets pegged to a stable asset like USD</SheetDescription>
                    </SheetHeader>
                    <div className="p-8">
                      <CreateTokenForm formId="create-token-form" users={props.data.users} />
                    </div>
                  </SheetContent>
                </Sheet>
              </SidebarMenuItem>
            )}
            {props.data.main.map((main) => (
              <NavMain key={main.title} title={main.title} items={main.items} />
            ))}
            {props.data.secondary.map((secondary) => (
              <NavSecondary key={secondary.title} title={secondary.title} items={secondary.items} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      {['admin', 'issuer'].includes(role) && (
        <SidebarFooter>
          <NavFooter mode={mode} />
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  );
}
