import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { PropsWithChildren } from 'react';

export function DetailGrid({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <Card className={cn('py-4', className)}>
      <CardContent className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {children}
      </CardContent>
    </Card>
  );
}
