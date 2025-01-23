'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    // biome-ignore lint/suspicious/noConsole: Required for error reporting
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 text-center">
      <div className="rounded-full bg-destructive/15 p-3">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <h1 className="font-semibold text-2xl tracking-tight">Something went wrong!</h1>
      <p className="text-muted-foreground">
        {error.message || 'An unexpected error occurred. Please try again later.'}
      </p>
      {error.digest && <p className="text-muted-foreground text-sm">Error ID: {error.digest}</p>}
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="default">
          Try again
        </Button>
        <Button onClick={() => router.push('/')} variant="outline">
          Go home
        </Button>
      </div>
    </div>
  );
}
