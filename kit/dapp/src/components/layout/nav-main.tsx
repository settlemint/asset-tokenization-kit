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
import { ChevronRight, type LucideIcon } from 'lucide-react';
import Link from 'next/link';

type NavItem = {
  type: 'Item';
  label: string;
  path: string;
  icon?: LucideIcon;
  badge?: number;
  subItems?: { label: string; path: string }[];
};

type NavGroup = {
  type: 'Group';
  groupTitle: string;
  items: NavItem[];
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
            {Icon && <Icon className="size-4" />}
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
            {Icon && <Icon className="size-4" />}
            <span>{item.label}</span>
            {item.badge && <span className="ml-auto text-muted-foreground text-xs">{item.badge}</span>}
            <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
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
    <div className="my-4">
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
          if (item.type === 'Group') {
            return <NavGroupComponent key={item.groupTitle} group={item} />;
          }
          return <NavItemComponent key={item.label} item={item} />;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
