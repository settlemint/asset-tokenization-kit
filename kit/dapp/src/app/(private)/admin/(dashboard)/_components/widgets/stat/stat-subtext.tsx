import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function StatSubtext({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-muted-foreground text-sm', className)}>{children}</p>;
}
