import { SignUpForm } from './forms/signup-form';

interface SignUpPageProps {
  searchParams: Promise<{
    rd?: string;
  }>;
}

export default async function SignUp({ searchParams }: SignUpPageProps) {
  const { rd } = await searchParams;
  return (
    <div className="w-full max-w-xs">
      <SignUpForm redirectUrl={rd} />
    </div>
  );
}
