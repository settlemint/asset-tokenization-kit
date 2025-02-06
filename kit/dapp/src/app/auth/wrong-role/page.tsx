import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface WrongRolePageProps {
  searchParams: Promise<{
    rd?: string;
  }>;
}

async function handleSignOut(returnUrl: string) {
  'use server';

  await auth.api.signOut({
    headers: await headers(),
  });
  redirect(`/auth/signin?rd=${encodeURIComponent(returnUrl)}`);
}

export default async function WrongRolePage({ searchParams }: WrongRolePageProps) {
  const { rd } = await searchParams;
  const returnUrl = rd ? decodeURIComponent(rd) : '/';

  return (
    <div className="w-full max-w-xs">
      <h1 className="font-semibold text-xl">You are not authorized to access this page</h1>
      <p className="mt-2 text-muted-foreground text-sm">
        You don&apos;t have the required role to access this page. Please sign in with an account that has the
        appropriate permissions.
      </p>
      <div className="mx-auto mt-8 flex gap-4">
        <Button asChild variant="default">
          <Link href="/">Go home</Link>
        </Button>
        <form action={() => handleSignOut(returnUrl)}>
          <Button type="submit" variant="outline">
            Sign out and try again
          </Button>
        </form>
      </div>
    </div>
  );
}
