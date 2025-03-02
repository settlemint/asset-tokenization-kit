"use client";

import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { usePathname } from "@/i18n/routing";
import { TabItem, type TabItemProps } from "./tab-item";

interface TabNavigationProps {
  items: TabItemProps[];
}

export function TabNavigation({ items }: TabNavigationProps) {
  const pathname = usePathname();

  return (
    <NavigationMenu className="mb-4">
      <NavigationMenuList>
        {items.map((item) => (
          <TabItem key={item.href} {...item} active={pathname === item.href} />
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
