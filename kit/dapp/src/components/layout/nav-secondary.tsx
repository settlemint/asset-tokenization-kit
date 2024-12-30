'use client';
import {} from '@/components/ui/dropdown-menu';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { ArrowRightLeft, HelpCircle, type LucideIcon, Users } from 'lucide-react';
import Link from 'next/link';

const iconMap: Record<string, LucideIcon> = {
  Users,
  ArrowRightLeft,
};

export type SidebarSecondarySection = {
  title: string;
  items: SidebarItem[];
};

export type SidebarItem = {
  title: string;
  iconName?: string;
  url: string;
};

export function NavSecondary({ items, title }: SidebarSecondarySection) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
              <Link href={item.url}>
                {item.iconName &&
                  (() => {
                    const Icon = iconMap[item.iconName] || HelpCircle;
                    return <Icon className="size-4" />;
                  })()}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
