'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/routing';
import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const router = useRouter();
  const t = useTranslations('error');

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 text-center">
      <div className="rounded-full bg-destructive/15 p-3">
        <AlertCircle className="size-6 text-destructive" />
      </div>
      <h1 className="font-semibold text-2xl tracking-tight">{t('title')}</h1>
      {error.digest && (
        <p className="text-muted-foreground text-sm">
          {t('error-id')}: {error.digest}
        </p>
      )}
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="default">
          {t('try-again')}
        </Button>
        <Button onClick={() => router.push('/')} variant="outline">
          {t('go-home')}
        </Button>
      </div>
    </div>
  );
}
