"use client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

export type NavItem = {
  id?: string;
  assetType?: AssetType;
  label: ReactNode;
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
  return "groupTitle" in item;
};

export type NavElement = NavItem | NavGroup;

function NavItemComponent({
  item,
}: {
  item: NavItem & { isActive?: (path: string) => boolean };
}) {
  const Icon = item.icon ?? undefined;
  const [isOpen, setIsOpen] = useState(false);
  const isActiveFn = item.isActive ?? (() => false);
  const { state } = useSidebar();

  // Regular menu item without subitems
  if (!item.subItems?.length || state !== "expanded") {
    return (
      <SidebarMenuItem
        className={cn(isActiveFn(item.path) ? "active" : undefined, "py-1")}
      >
        <SidebarMenuButton
          asChild
          className={isActiveFn(item.path) ? "font-bold" : undefined}
        >
          <Link href={item.path} prefetch className="flex w-full items-center">
            {Icon ?? null}
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.badge && (
              <span className="ml-2 flex-shrink-0 text-muted-foreground text-xs">
                {item.badge}
              </span>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  // Collapsible menu item with subitems
  const isGroupActive = item.subItems.some((subItem) =>
    isActiveFn(subItem.path)
  );

  return (
    <Collapsible
      asChild
      className="group/collapsible"
      open={isOpen || isGroupActive}
      onOpenChange={setIsOpen}
    >
      <SidebarMenuItem className="py-1">
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className={isGroupActive ? "font-bold" : undefined}
          >
            {Icon ?? null}
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.badge && (
              <span className="ml-2 flex-shrink-0 text-muted-foreground text-xs">
                {item.badge}
              </span>
            )}
            <ChevronRight className="ml-2 size-4 flex-shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="mr-0">
            {item.subItems.map((subItem, index) => {
              const SubIcon = subItem.icon ?? undefined;

              return (
                <SidebarMenuSubItem key={subItem.id ?? index} className="mr-0">
                  <SidebarMenuSubButton
                    asChild
                    className={cn(
                      isActiveFn(subItem.path) ? "font-bold" : undefined
                    )}
                  >
                    <Link
                      href={subItem.path}
                      prefetch
                      className="flex w-full items-center"
                    >
                      {SubIcon ?? null}
                      <span className="min-w-0 flex-1 truncate">
                        {subItem.label}
                      </span>
                      {subItem.badge && (
                        <span className="ml-2 flex-shrink-0 text-muted-foreground text-xs">
                          {subItem.badge}
                        </span>
                      )}
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

function NavGroupComponent({
  group,
  isActive,
}: {
  group: NavGroup;
  isActive?: (path: string) => boolean;
}) {
  return (
    <>
      <SidebarGroupLabel>{group.groupTitle}</SidebarGroupLabel>
      {group.items.map((item, index) => (
        <NavItemComponent key={item.id ?? index} item={{ ...item, isActive }} />
      ))}
    </>
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
    const normalizedPathname = pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
    const matches = allPaths
      .map((path) => (path.endsWith("/") ? path.slice(0, -1) : path))
      .filter((path) => {
        // Skip empty paths
        if (path === normalizedPathname) {
          return true;
        } // Exact match

        // Check if this path is a direct parent of the current path
        const pathParts = path.split("/").filter(Boolean);
        const pathnameParts = normalizedPathname.split("/").filter(Boolean);

        // If this path has more parts than the current pathname, it can't be a parent
        if (pathParts.length > pathnameParts.length) {
          return false;
        }

        // Check if all parts match up to the length of this path
        // and if the next part in pathname exists (meaning this is a direct parent)
        const partsMatch = pathParts.every(
          (part, i) => part === pathnameParts[i]
        );
        const isDirectParent = partsMatch && pathnameParts[pathParts.length];

        return isDirectParent;
      })
      .sort((a, b) => b.length - a.length); // Sort by length, longest first

    return matches[0] || "";
  };

  const mostSpecificPath = findMostSpecificMatch(items);

  const isActive = (path: string) => {
    const normalizedPath = path.endsWith("/") ? path.slice(0, -1) : path;
    return normalizedPath === mostSpecificPath;
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item, index) => {
          if (isGroup(item)) {
            return (
              <NavGroupComponent
                key={item.groupTitle}
                group={item}
                isActive={isActive}
              />
            );
          }
          return (
            <NavItemComponent
              key={item.id ?? index}
              item={{ ...item, isActive }}
            />
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
