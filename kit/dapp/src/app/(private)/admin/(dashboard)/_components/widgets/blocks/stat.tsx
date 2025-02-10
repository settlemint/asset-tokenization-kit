import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function StatValue({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('my-2 font-bold text-3xl', className)}>{children}</p>;
}

export function StatSubtext({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-muted-foreground text-sm', className)}>{children}</p>;
}

export function StatLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('mt-6 text-sm', className)}>{children}</p>;
}
