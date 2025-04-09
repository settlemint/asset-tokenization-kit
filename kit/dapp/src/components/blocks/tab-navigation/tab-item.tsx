import { Badge } from "@/components/ui/badge";
import {
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import type { FC } from "react";

export interface TabItemProps {
  href: string;
  name: string;
  badge?: number | string;
  active?: boolean;
}

export const TabItem: FC<TabItemProps> = ({ href, name, badge, active }) => (
  <NavigationMenuItem>
    <Link href={href} legacyBehavior passHref>
      <NavigationMenuLink
        className={cn(
          navigationMenuTriggerStyle(),
          "relative rounded-none bg-transparent! pb-4 text-md after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-accent hover:text-foreground hover:after:w-full hover:after:transition-[width] hover:after:duration-200 hover:after:ease-in-out",
          active ? "font-bold text-primary! after:w-full" : "after:w-0"
        )}
      >
        <span className="inline-flex items-center gap-2">
          {name}
          {badge !== undefined && (
            <Badge variant="outline" className="border-card">
              {badge}
            </Badge>
          )}
        </span>
      </NavigationMenuLink>
    </Link>
  </NavigationMenuItem>
);
