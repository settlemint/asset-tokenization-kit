import {
  NavigationMenuItem,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import type { FC, ReactNode } from "react";

export interface TabItemProps {
  href: string;
  name: ReactNode; // Allow ReactNode for potential badge inclusion
  active?: boolean;
}

export const TabItem: FC<TabItemProps> = ({ href, name, active }) => (
  <NavigationMenuItem>
    <Link
      href={href}
      className={cn(
        navigationMenuTriggerStyle(),
        "relative rounded-none bg-transparent! pb-4 text-md after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-accent hover:text-foreground hover:after:w-full hover:after:transition-[width] hover:after:duration-200 hover:after:ease-in-out",
        active ? "font-bold text-primary! after:w-full" : "after:w-0"
      )}
    >
      {name}
    </Link>
  </NavigationMenuItem>
);
