import { cn } from '@/lib/utils';
import { type VariantProps, cva } from 'class-variance-authority';
import type { HTMLAttributes, PropsWithChildren } from 'react';

const dataTableColumnCellVariants = cva('flex items-center space-x-2', {
  variants: {
    variant: {
      default: '',
      numeric: 'justify-end pr-2',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface DataTableColumnCellProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dataTableColumnCellVariants> {}

export function DataTableColumnCell({
  className,
  variant = 'default',
  children,
  ...props
}: PropsWithChildren<DataTableColumnCellProps>) {
  return (
    <div
      className={cn(
        dataTableColumnCellVariants({ variant, className }),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
