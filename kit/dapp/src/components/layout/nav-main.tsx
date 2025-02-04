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
import type { assetConfig } from '@/lib/config/assets';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useState } from 'react';

export type NavItem = {
  assetType?: keyof typeof assetConfig;
  label: string;
  path: string;
  icon?: ReactNode;
  badge?: string;
  subItems?: NavItem[];
};

export type NavGroup = {
  groupTitle: string;
  items: NavItem[];
};

const isGroup = (item: NavElement): item is NavGroup => {
  return 'groupTitle' in item;
};

export type NavElement = NavItem | NavGroup;

function NavItemComponent({ item }: { item: NavItem & { isActive?: (path: string) => boolean } }) {
  const Icon = item.icon ?? undefined;
  const [isOpen, setIsOpen] = useState(false);
  const isActiveFn = item.isActive ?? (() => false);

  // Regular menu item without subitems
  if (!item.subItems?.length) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild className={isActiveFn(item.path) ? 'font-bold' : undefined}>
          <Link href={item.path}>
            {Icon ?? null}
            <span className="truncate">{item.label}</span>
            {item.badge && <span className="ml-auto text-muted-foreground text-xs">{item.badge}</span>}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  // Collapsible menu item with subitems
  const isGroupActive = item.subItems.some((subItem) => isActiveFn(subItem.path));

  return (
    <Collapsible asChild className="group/collapsible" open={isOpen || isGroupActive} onOpenChange={setIsOpen}>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className={isGroupActive ? 'font-bold' : undefined}>
            <div>{Icon ?? null}</div>
            <div className="flex w-full items-center justify-between">
              <div className="truncate">{item.label}</div>
              <div className="flex shrink-0 items-center gap-2">
                {item.badge && <span className="text-muted-foreground text-xs">{item.badge}</span>}
                <ChevronRight className="size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </div>
            </div>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.subItems.map((subItem) => {
              const SubIcon = subItem.icon ?? undefined;

              return (
                <SidebarMenuSubItem key={subItem.label}>
                  <SidebarMenuSubButton asChild className={isActiveFn(subItem.path) ? 'font-bold' : undefined}>
                    <Link href={subItem.path} className="flex min-w-0 truncate">
                      {SubIcon ?? null}
                      <span className="truncate">{subItem.label}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function NavGroupComponent({ group, isActive }: { group: NavGroup; isActive?: (path: string) => boolean }) {
  return (
    <div className="my-2">
      <SidebarGroupLabel>{group.groupTitle}</SidebarGroupLabel>
      {group.items.map((item) => (
        <NavItemComponent key={item.label} item={{ ...item, isActive }} />
      ))}
    </div>
  );
}

export function NavMain({ items }: { items: NavElement[] }) {
  const pathname = usePathname();

  // Find the most specific matching path from all nav items
  const findMostSpecificMatch = (allItems: NavElement[]): string => {
    const allPaths: string[] = [];

    // Collect all paths from items and subitems
    const collectPaths = (items: NavElement[]) => {
      for (const item of items) {
        if (isGroup(item)) {
          collectPaths(item.items);
        } else {
          allPaths.push(item.path);
          for (const subItem of item.subItems ?? []) {
            allPaths.push(subItem.path);
          }
        }
      }
    };

    collectPaths(allItems);

    // Normalize paths and find matches
    const normalizedPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    const matches = allPaths
      .map((path) => (path.endsWith('/') ? path.slice(0, -1) : path))
      .filter((path) => {
        // Exact match for root path
        if (path === '/admin' && normalizedPathname === '/admin') {
          return true;
        }
        // For other paths, check if it's an exact match or if it's a direct parent
        if (path === '/admin') {
          return false;
        } // Skip empty paths
        if (path === normalizedPathname) {
          return true;
        } // Exact match

        // Check if this path is a direct parent of the current path
        const pathParts = path.split('/').filter(Boolean);
        const pathnameParts = normalizedPathname.split('/').filter(Boolean);

        // If this path has more parts than the current pathname, it can't be a parent
        if (pathParts.length > pathnameParts.length) {
          return false;
        }

        // Check if all parts match up to the length of this path
        // and if the next part in pathname exists (meaning this is a direct parent)
        const partsMatch = pathParts.every((part, i) => part === pathnameParts[i]);
        const isDirectParent = partsMatch && pathnameParts[pathParts.length];

        return isDirectParent;
      })
      .sort((a, b) => b.length - a.length); // Sort by length, longest first

    return matches[0] || '';
  };

  const mostSpecificPath = findMostSpecificMatch(items);

  const isActive = (path: string) => {
    const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
    return normalizedPath === mostSpecificPath;
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          if (isGroup(item)) {
            return <NavGroupComponent key={item.groupTitle} group={item} isActive={isActive} />;
          }
          return <NavItemComponent key={item.label} item={{ ...item, isActive }} />;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
