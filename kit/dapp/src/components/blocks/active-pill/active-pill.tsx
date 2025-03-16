import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PauseCircle, PlayCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactElement } from 'react';

export function ActivePill({ paused }: { paused: boolean }): ReactElement {
  const t = useTranslations('components.active-pill');

  return (
    <Badge
      variant={paused ? 'destructive' : 'default'}
      className={cn(
        'bg-destructive/80 text-destructive-foreground',
        !paused && 'bg-success/80 text-success-foreground'
      )}
    >
      {paused ? (
        <>
          <PauseCircle className="mr-1 size-3" />
          <span>{t('paused')}</span>
        </>
      ) : (
        <>
          <PlayCircle className="mr-1 size-3" />
          <span>{t('active')}</span>
        </>
      )}
    </Badge>
  );
}
