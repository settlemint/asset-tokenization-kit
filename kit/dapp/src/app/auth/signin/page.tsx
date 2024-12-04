import Link from 'next/link';
import { SignInForm } from './forms/sign-in-form';

interface SignInPageProps {
  searchParams: Promise<{
    rd?: string;
  }>;
}

export default async function SignIn({ searchParams }: SignInPageProps) {
  const { rd } = await searchParams;
  return (
    <>
      <div className="grid gap-2 text-center">
        <h1 className="font-bold text-3xl">Login</h1>
        <p className="text-balance text-muted-foreground">Enter your email below to login to your account</p>
      </div>
      <div className="grid gap-4">
        <SignInForm provider="credentials" redirectUrl={rd} />
      </div>
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account yet?
        <Link href="/auth/signup" className="underline">
          Sign up
        </Link>
      </div>
    </>
  );
}
