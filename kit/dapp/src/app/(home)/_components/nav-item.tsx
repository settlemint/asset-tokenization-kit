'use client';

import { NavigationMenuItem, NavigationMenuLink, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { FC } from 'react';

interface NavItemProps {
  href: string;
  label: string;
  className?: string;
}

export const NavItem: FC<NavItemProps> = ({ href, label, className }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <NavigationMenuItem>
      <Link href={href} passHref legacyBehavior>
        <NavigationMenuLink
          className={cn(
            navigationMenuTriggerStyle(),
            'h-12 rounded-xl text-[1rem] hover:text-[hsl(var(--primary-foreground))] focus:text-[hsl(var(--primary-foreground))]',
            isActive &&
              'bg-primary text-primary-foreground hover:text-primary-foreground focus:text-primary-foreground',
            className
          )}
        >
          {label}
        </NavigationMenuLink>
      </Link>
    </NavigationMenuItem>
  );
};
