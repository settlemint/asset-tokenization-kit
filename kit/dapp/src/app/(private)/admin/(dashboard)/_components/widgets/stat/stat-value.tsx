import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function StatValue({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('my-2 font-bold text-3xl', className)}>{children}</p>;
}
