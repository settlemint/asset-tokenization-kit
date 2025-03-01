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
    </>
  );
}
