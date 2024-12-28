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
import { Bitcoin, ChevronRight, Coins, Eclipse, HelpCircle, type LucideIcon, TicketCheck } from 'lucide-react';
import Link from 'next/link';

const iconMap: Record<string, LucideIcon> = {
  Coins,
  TicketCheck,
  Eclipse,
  Bitcoin,
};

export type SidebarLink = {
  title: string;
  url: string;
};

export type SidebarSection = {
  title: string;
  items: SidebarNestedItem[];
};

export type SidebarItemMore = {
  enabled: boolean;
  url: string;
};

export type SidebarNestedItem = {
  title: string;
  iconName?: string;
  items: SidebarLink[];
  more?: SidebarItemMore;
  open?: boolean;
};

export function NavMain({
  title,
  items,
}: {
  title: string;
  items: SidebarNestedItem[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.open} className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.iconName &&
                    (() => {
                      const Icon = iconMap[item.iconName] || HelpCircle;
                      return <Icon className="size-4" />;
                    })()}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <Link href={subItem.url}>
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                  {item.more && (
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link href={item.more.url}>
                          <span>More&hellip;</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  )}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
