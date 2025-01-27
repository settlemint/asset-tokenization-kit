'use client';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export default function WrongRolePage() {
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/'); // redirect to login page
        },
      },
    });
  }, [router]);

  return (
    <div className="w-full max-w-xs">
      <h1>You are not authorized to access this page</h1>
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
