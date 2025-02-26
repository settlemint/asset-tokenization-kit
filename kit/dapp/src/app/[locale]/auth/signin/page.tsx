import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { SignInForm } from './forms/signin-form';

interface SignInPageProps {
  searchParams: Promise<{
    rd?: string;
  }>;
  params: Promise<{
    locale: string;
  }>;
}

export default async function SignIn({
  searchParams,
  params,
}: SignInPageProps) {
  const { rd } = await searchParams;
  const { locale } = await params;
  const t = await getTranslations('auth.signin.page');

  return (
    <>
      <div className="w-full">
        <SignInForm
          redirectUrl={decodeURIComponent(rd || '')}
          locale={locale}
        />
      </div>
      <Alert className="mt-8" variant="warning">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{t('alert.title')}</AlertTitle>
        <AlertDescription>{t('alert.description')}</AlertDescription>
      </Alert>
    </>
  );
}
