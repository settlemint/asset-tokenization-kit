import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function WrongRolePage() {
  const t = useTranslations('auth.wrong-role');

  return (
    <div className="w-full max-w-xs">
      <h1 className="font-semibold text-xl">{t('title')}</h1>
      <p className="mt-2 text-muted-foreground text-sm">{t('description')}</p>
      <div className="mx-auto mt-8 flex gap-4">
        <Button asChild variant="default">
          <Link href="/portfolio">{t('go-to-portfolio')}</Link>
        </Button>
      </div>
    </div>
  );
}
