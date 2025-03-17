import { LanguageToggle } from '@/components/blocks/language/language-toggle';
import { Logo } from '@/components/blocks/logo/logo';
import { ThemeToggle } from '@/components/blocks/theme/theme-toggle';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';
import type { PropsWithChildren } from 'react';

export default async function AuthLayout({ children }: PropsWithChildren) {
  const t = await getTranslations('layout.header');

  return (
    <div className="min-h-screen w-full bg-[url(/backgrounds/background-lm.svg')] bg-center bg-cover dark:bg-[url('/backgrounds/background-dm.svg')]">
      <div className="absolute top-8 left-8 flex flex-col items-end gap-0">
        <div className={cn('flex w-full items-center gap-3')}>
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
            <Logo variant="icon" />
          </div>
          <div className="flex max-w-[180px] flex-col text-foreground leading-none">
            <span className="font-bold text-lg">{t('app-name')}</span>
            <span className="-mt-1 overflow-hidden truncate text-ellipsis text-md text-sm leading-snug">
              {t('app-description')}
            </span>
          </div>
        </div>
      </div>
      <div className="absolute top-8 right-8 flex flex-col items-end gap-0">
        <div className="text-right">
          <Link href="/" className="text-sm-text">
            {t('home')}
          </Link>
        </div>
      </div>
      <div className="absolute bottom-8 left-8 flex items-center gap-3">
        <LanguageToggle size="icon" variant="outline" />
        <ThemeToggle />
      </div>
      <div className="flex min-h-screen items-center justify-center">
        {children}
      </div>
    </div>
  );
}
