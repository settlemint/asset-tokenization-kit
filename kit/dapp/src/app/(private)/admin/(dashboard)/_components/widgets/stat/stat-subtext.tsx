import { cn } from '@/lib/utils';
import type { PropsWithChildren } from 'react';

export function StatSubtext({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <p className={cn('text-muted-foreground text-sm', className)}>{children}</p>;
}
