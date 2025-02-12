'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { type VariantProps, cva } from 'class-variance-authority';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
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
    VariantProps<typeof dataTableRowActionsVariants> {
  detailUrl?: string;
}

export function DataTableRowActions({
  className,
  variant = 'default',
  children,
  detailUrl,
  ...props
}: PropsWithChildren<DataTableColumnCellProps>) {
  if (!children && !detailUrl) {
    return null;
  }

  return (
    <div className={cn(dataTableRowActionsVariants({ variant, className }), className)} {...props}>
      {detailUrl && (
        <Button
          variant="outline"
          size="sm"
          asChild
          className="hover:text-primary-foreground dark:hover:text-foreground"
        >
          <Link href={detailUrl} prefetch>
            Details
          </Link>
        </Button>
      )}
      {children && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-8 w-8 p-0 hover:bg-theme-accent-background active:border-0 data-[state=open]:bg-muted dark:hover:text-foreground"
            >
              <MoreHorizontal />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            {children}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
