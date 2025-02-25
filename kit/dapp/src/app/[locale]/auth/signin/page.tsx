import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
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
        <AlertTitle>Just created this dAPP?</AlertTitle>
        <AlertDescription>
          The first user to sign up will be the given the admin role. You can
          add other admins later.
        </AlertDescription>
      </Alert>
    </>
  );
}
