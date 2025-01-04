'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { type VariantProps, cva } from 'class-variance-authority';
import { MoreHorizontal } from 'lucide-react';
import type { HTMLAttributes, PropsWithChildren } from 'react';

const dataTableRowActionsVariants = cva('flex items-center space-x-2', {
  variants: {
    variant: {
      default: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface DataTableColumnCellProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dataTableRowActionsVariants> {}

export function DataTableRowActions({
  className,
  variant = 'default',
  children,
  ...props
}: PropsWithChildren<DataTableColumnCellProps>) {
  if (!children) {
    return null;
  }

  return (
    <div className={cn(dataTableRowActionsVariants({ variant, className }), className)} {...props}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          {children}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
