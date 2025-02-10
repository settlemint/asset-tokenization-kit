import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function StatLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('mt-6 text-sm', className)}>{children}</p>;
}
