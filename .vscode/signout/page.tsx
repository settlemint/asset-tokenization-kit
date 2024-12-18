import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth/auth';
import Link from 'next/link';

async function handleSignOut() {
  'use server';
  await signOut();
}

export default function SignOut() {
  return (
    <>
      <div className="grid gap-2 text-center">
        <h1 className="font-bold text-3xl">Sign out</h1>
        <p className="text-balance text-muted-foreground">Are you sure you want to sign out?</p>
      </div>
      <div className="grid gap-4">
        <form action={handleSignOut}>
          <Button type="submit" className="w-full">
            Sign out
          </Button>
        </form>
      </div>
      <div className="mt-4 text-center text-sm">
        Made a mistake?
        <Link href="/" className="underline">
          Go back home
        </Link>
      </div>
    </>
  );
}
