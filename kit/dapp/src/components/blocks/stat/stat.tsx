'use client';

import { cn } from '@/lib/utils';
import { type VariantProps, cva } from 'class-variance-authority';
import type { ReactNode } from 'react';

type StatComponentProps = {
  className?: string;
  children: ReactNode;
};

export function Stat({ className, children }: StatComponentProps) {
  return <div className={cn('rounded-xl border bg-card px-4 py-2 shadow', className)}>{children}</div>;
}

export function StatLabel({ className, children }: StatComponentProps) {
  return <div className={cn('text-muted-foreground', className)}>{children}</div>;
}

export function StatValue({ className, children }: StatComponentProps) {
  return <div className={cn('my-2 font-bold text-3xl', className)}>{children}</div>;
}

const statSubtextVariants = cva('', {
  variants: {
    variant: {
      positive: 'font-medium text-emerald-700 dark:text-emerald-500',
      negative: 'font-medium text-red-700 dark:text-red-500',
      neutral: 'font-medium text-gray-500 dark:text-gray-400',
      default: 'text-muted-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type StatSubtextProps = StatComponentProps & VariantProps<typeof statSubtextVariants>;

export function StatSubtext({ className, variant, children }: StatSubtextProps) {
  return <span className={cn(statSubtextVariants({ variant, className }))}>{children}</span>;
}
