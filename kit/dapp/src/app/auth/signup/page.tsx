import Link from 'next/link';
import { SignUpForm } from './forms/sign-up-form';

interface SignUpPageProps {
  searchParams: Promise<{
    rd?: string;
  }>;
}

export default async function SignUp({ searchParams }: SignUpPageProps) {
  const { rd } = await searchParams;
  return (
    <>
      <div className="grid gap-2 text-center">
        <h1 className="font-bold text-3xl">Sign up</h1>
        <p className="text-balance text-muted-foreground">
          Enter your information to create an account and a blockchain wallet
        </p>
      </div>
      <div className="grid gap-4">
        <SignUpForm provider="credentials" redirectUrl={rd} />
      </div>
      <div className="mt-4 text-center text-sm">
        Already have an account?
        <Link href="/auth/signin" className="underline">
          Log in
        </Link>
      </div>
    </>
  );
}
