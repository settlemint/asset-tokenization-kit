import type { ReactNode } from "react";
import { NavigationMenu, NavigationMenuList } from "../ui/navigation-menu";
import { TabItem } from "./tab-item";

export interface TabItemProps {
  href: string;
  name: ReactNode;
}

interface TabNavigationProps {
  items: TabItemProps[];
}

export function TabNavigation({ items }: TabNavigationProps) {
  return (
    <NavigationMenu className="w-full">
      <NavigationMenuList className="w-full justify-start space-x-4 border-b">
        {items.map((item) => (
          <TabItem key={item.href} href={item.href} name={item.name} />
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
