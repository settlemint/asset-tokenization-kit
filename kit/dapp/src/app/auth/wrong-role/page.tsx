import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function WrongRolePage() {
  return (
    <div className="w-full max-w-xs">
      <h1 className="font-semibold text-xl">You are not authorized to access this page</h1>
      <p className="mt-2 text-muted-foreground text-sm">
        You don&apos;t have the required role to access this page. Please sign in with an account that has the
        appropriate permissions.
      </p>
      <div className="mx-auto mt-8 flex gap-4">
        <Button asChild variant="default">
          <Link href="/portfolio">Go to portfolio</Link>
        </Button>
      </div>
    </div>
  );
}
