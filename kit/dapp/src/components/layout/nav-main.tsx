'use client';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

export type NavItem = {
  label: string;
  path: string;
  icon?: ReactNode;
  badge?: string;
  subItems?: { label: string; path: string }[];
};

export type NavGroup = {
  groupTitle: string;
  items: NavItem[];
};

const isGroup = (item: NavElement): item is NavGroup => {
  return 'groupTitle' in item;
};

export type NavElement = NavItem | NavGroup;

function NavItemComponent({ item }: { item: NavItem }) {
  const Icon = item.icon ?? undefined;

  // Regular menu item without subitems
  if (!item.subItems?.length) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href={item.path}>
            {Icon ?? null}
            <span>{item.label}</span>
            {item.badge && <span className="ml-auto text-muted-foreground text-xs">{item.badge}</span>}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  // Collapsible menu item with subitems
  return (
    <Collapsible asChild className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <div>{Icon ?? null}</div>
            <div className="flex w-full items-center justify-between">
              <div>{item.label}</div>
              <div className="flex items-center gap-2">
                {item.badge && <span className="text-muted-foreground text-xs">{item.badge}</span>}
                <ChevronRight className="size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </div>
            </div>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.subItems.map((subItem) => (
              <SidebarMenuSubItem key={subItem.label}>
                <SidebarMenuSubButton asChild>
                  <Link href={subItem.path}>{subItem.label}</Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function NavGroupComponent({ group }: { group: NavGroup }) {
  return (
    <div className="my-2">
      <SidebarGroupLabel>{group.groupTitle}</SidebarGroupLabel>
      {group.items.map((item) => (
        <NavItemComponent key={item.label} item={item} />
      ))}
    </div>
  );
}

export function NavMain({ items }: { items: NavElement[] }) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          if (isGroup(item)) {
            return <NavGroupComponent key={item.groupTitle} group={item} />;
          }
          return <NavItemComponent key={item.label} item={item} />;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
