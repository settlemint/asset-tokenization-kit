'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/routing';
import { FileQuestion } from 'lucide-react';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 text-center">
      <div className="rounded-full bg-muted p-3">
        <FileQuestion className="size-6 text-muted-foreground" />
      </div>
      <h1 className="font-semibold text-2xl tracking-tight">Page not found</h1>
      <p className="text-muted-foreground">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => router.back()} variant="default">
          Go back
        </Button>
        <Button onClick={() => router.push('/')} variant="outline">
          Go home
        </Button>
      </div>
    </div>
  );
}
