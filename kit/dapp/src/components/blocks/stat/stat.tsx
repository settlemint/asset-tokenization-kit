import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function StatValue({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('my-2 font-bold text-2xl', className)}>{children}</p>;
}

export function StatSubtext({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-muted-foreground text-xs', className)}>{children}</p>;
}

export function StatLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-sm', className)}>{children}</p>;
}

export function Stat({ children }: { children: ReactNode }) {
  return <div className="space-y-1 px-6 text-center first:pl-0 last:pr-0">{children}</div>;
}
