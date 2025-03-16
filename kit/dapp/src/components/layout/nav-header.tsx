'use client';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Logo } from '../blocks/logo/logo';

export function NavHeader() {
  const pathname = usePathname();
  const t = useTranslations('layout.header');

  const content = (
    <div className={cn('flex w-full items-center gap-3')}>
      <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
        <Logo variant="icon" />
      </div>
      <div className="flex max-w-[180px] flex-col leading-none">
        <span className="font-bold text-lg">{t('app-name')}</span>
        <span className="-mt-1 overflow-hidden truncate text-ellipsis text-md leading-snug">
          {t('app-description')}
        </span>
      </div>
    </div>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          {pathname.includes('/assets') ? (
            <Link href="/assets">{content}</Link>
          ) : pathname.includes('/portfolio') ? (
            <Link href="/portfolio">{content}</Link>
          ) : pathname.includes('/platform') ? (
            <Link href="/platform/settings">{content}</Link>
          ) : (
            content
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
