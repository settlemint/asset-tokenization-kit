import { cn } from '@/lib/utils';
import type { PropsWithChildren } from 'react';

export function StatValue({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <p className={cn('my-2 font-bold text-3xl', className)}>{children}</p>;
}
