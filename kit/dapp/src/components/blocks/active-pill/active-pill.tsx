import { Badge } from '@/components/ui/badge';
import { PauseCircle, PlayCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactElement } from 'react';

export function ActivePill({ paused }: { paused: boolean }): ReactElement {
  const t = useTranslations('components.active-pill');

  return (
    <Badge variant={paused ? 'destructive' : 'success'}>
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
