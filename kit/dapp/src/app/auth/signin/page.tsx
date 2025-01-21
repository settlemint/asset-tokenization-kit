import { SignInForm } from './forms/signin-form';

interface SignInPageProps {
  searchParams: Promise<{
    rd?: string;
  }>;
}

export default async function SignIn({ searchParams }: SignInPageProps) {
  const { rd } = await searchParams;

  return (
    <div className="w-full max-w-xs">
      <SignInForm redirectUrl={decodeURIComponent(rd || '')} />
    </div>
  );
}
