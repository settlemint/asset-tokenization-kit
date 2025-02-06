'use client';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface WrongRolePageProps {
  searchParams: Promise<{
    rd?: string;
  }>;
}

export default async function WrongRolePage({ searchParams }: WrongRolePageProps) {
  const router = useRouter();
  const { rd } = await searchParams;
  const returnUrl = rd ? decodeURIComponent(rd) : '/';

  const handleSignOut = useCallback(async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          // Redirect to login page with return URL
          window.location.href = `/auth/signin?rd=${encodeURIComponent(returnUrl)}`;
        },
      },
    });
  }, [returnUrl]);

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
        <Button onClick={handleSignOut} variant="outline">
          Sign out and try again
        </Button>
      </div>
    </div>
  );
}
