'use client';
import { Skeleton } from '@/components/ui/skeleton';
import { authClient } from '@/lib/auth/client';
import { useTranslations } from 'next-intl';

export function Greeting() {
  const session = authClient.useSession();
  const name = session.data?.user.name;
  const t = useTranslations('portfolio.greeting');

  return (
    <div>
      {getGreeting(t)},
      {name ? (
        <span className="ml-1 font-semibold">{name}</span>
      ) : (
        <Skeleton className="mx-1 inline-block h-6 w-24" />
      )}
      . {t('you-have')}
    </div>
  );
}

function getGreeting(t: (key: 'morning' | 'afternoon' | 'evening') => string) {
  const hour = new Date().getHours();
  if (hour < 12) {
    return t('morning');
  }
  if (hour < 17) {
    return t('afternoon');
  }
  return t('evening');
}
