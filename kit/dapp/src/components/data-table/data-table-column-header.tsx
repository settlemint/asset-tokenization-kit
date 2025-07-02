"use client";
"use no memo";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Column } from "@tanstack/react-table";
import { type VariantProps, cva } from "class-variance-authority";
import { ArrowDownUp, EyeOff, SortAsc, SortDesc } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { HTMLAttributes, PropsWithChildren } from "react";

const headerVariants = cva("", {
  variants: {
    variant: {
      default: "",
      numeric: "text-right",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const wrapperVariants = cva("flex items-center space-x-2", {
  variants: {
    variant: {
      default: "",
      numeric: "justify-end",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const buttonVariants = cva(
  "h-8 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "-ml-2",
        numeric: "ml-auto",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * Props for the DataTableColumnHeader component.
 * @template TData The type of data in the table.
 * @template TValue The type of value in the column.
 */
interface DataTableColumnHeaderProps<TData, TValue>
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof headerVariants> {
  /** The column object from react-table. */
  column: Column<TData, TValue>;
  /** The type of the column. */
  variant?: "default" | "numeric";
}

/**
 * Renders a header for a data table column with sorting and visibility options.
 * @template TData The type of data in the table.
 * @template TValue The type of value in the column.
 * @param props The component props.
 * @returns The rendered DataTableColumnHeader component.
 */
export function DataTableColumnHeader<TData, TValue>({
  column,
  className,
  variant = "default",
  children,
}: PropsWithChildren<DataTableColumnHeaderProps<TData, TValue>>) {
  const { t } = useTranslation("general");

  const handleSortAscending = useCallback(() => {
    column.toggleSorting(false);
  }, [column]);

  const handleSortDescending = useCallback(() => {
    column.toggleSorting(true);
  }, [column]);

  const handleHideColumn = useCallback(() => {
    column.toggleVisibility(false);
  }, [column]);

  if (!column.getCanSort()) {
    return (
      <div className={cn("text-sm", headerVariants({ variant, className }))}>
        {children}
      </div>
    );
  }

  const sortIcon = () => {
    if (column.getIsSorted() === "desc") {
      return <SortDesc className="ml-2 size-4" />;
    }
    if (column.getIsSorted() === "asc") {
      return <SortAsc className="ml-2 size-4" />;
    }
    return <ArrowDownUp className="ml-2 size-4" />;
  };

  return (
    <div className={cn(wrapperVariants({ variant, className }))}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={buttonVariants({ variant })}
          >
            {variant === "numeric" && column.getIsSorted() && sortIcon()}
            <span className="capitalize">{children}</span>
            {variant !== "numeric" && column.getIsSorted() && sortIcon()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={handleSortAscending}>
            <SortAsc className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            {t("components.data-table.sort-ascending")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSortDescending}>
            <SortDesc className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            {t("components.data-table.sort-descending")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleHideColumn}>
            <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            {t("components.data-table.hide")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
