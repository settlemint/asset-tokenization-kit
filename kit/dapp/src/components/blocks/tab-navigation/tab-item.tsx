import { Badge } from '@/components/ui/badge';
import { NavigationMenuItem, NavigationMenuLink, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { FC } from 'react';

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
          'rounded-none border-b-2 pb-4 text-md hover:border-primary hover:bg-transparent',
          active && 'border-primary text-primary'
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
