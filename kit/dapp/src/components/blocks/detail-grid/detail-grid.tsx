'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ComponentPropsWithoutRef } from 'react';

export type DetailGridProps = ComponentPropsWithoutRef<typeof Card>;

export function DetailGrid({ children, className, ...props }: DetailGridProps) {
  return (
    <Card {...props} className={cn('py-4', className)}>
      <CardContent className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {children}
      </CardContent>
    </Card>
  );
}
