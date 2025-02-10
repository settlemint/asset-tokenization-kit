import { cn } from '@/lib/utils';
import type { PropsWithChildren } from 'react';

export function StatLabel({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <p className={cn('mt-6 text-sm', className)}>{children}</p>;
}
