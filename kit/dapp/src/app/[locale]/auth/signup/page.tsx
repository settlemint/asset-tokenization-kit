import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { SignUpForm } from './forms/signup-form';

interface SignUpPageProps {
  searchParams: Promise<{
    rd?: string;
  }>;
  params: Promise<{
    locale: string;
  }>;
}

export default async function SignUp({
  searchParams,
  params,
}: SignUpPageProps) {
  const { rd } = await searchParams;
  const { locale } = await params;
  const t = await getTranslations('auth.signup.page');

  return (
    <>
      <div className="w-full">
        <SignUpForm redirectUrl={rd} locale={locale} />
      </div>
      <Alert className="mt-8" variant="warning">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{t('alert.title')}</AlertTitle>
        <AlertDescription>{t('alert.description')}</AlertDescription>
      </Alert>
    </>
  );
}
