import { Badge } from '@/components/ui/badge';
import {
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import type { FC } from 'react';

export interface TabItemProps {
  href: string;
  name: string;
  badge?: number | string;
  active?: boolean;
}

export const TabItem: FC<TabItemProps> = ({ href, name, badge, active }) => (
  <NavigationMenuItem>
    <Link href={href}>
      <NavigationMenuLink
        className={cn(
          navigationMenuTriggerStyle(),
          '!bg-transparent relative rounded-none pb-4 text-md after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-primary hover:text-foreground hover:after:w-full hover:after:transition-[width] hover:after:duration-200 hover:after:ease-in-out',
          active ? '!text-primary font-bold after:w-full' : 'after:w-0'
        )}
      >
        {name}
        {badge !== undefined && (
          <Badge variant="outline" className="ml-2 border-card">
            {badge}
          </Badge>
        )}
      </NavigationMenuLink>
    </Link>
  </NavigationMenuItem>
);
