"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import { MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { type HTMLAttributes, type ReactNode, useState } from "react";

const dataTableRowActionsVariants = cva("flex items-center space-x-2", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface DataTableColumnCellRenderProps {
  close: () => void;
}

interface DataTableColumnCellProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof dataTableRowActionsVariants> {
  detailUrl?: string;
  children?:
    | ReactNode
    | undefined
    | ((renderProps: DataTableColumnCellRenderProps) => ReactNode);
}

export function DataTableRowActions({
  className,
  variant = "default",
  children,
  detailUrl,
  ...props
}: DataTableColumnCellProps) {
  const t = useTranslations("components.data-table");
  const [isOpen, setIsOpen] = useState(false);

  if (!children && !detailUrl) {
    return null;
  }

  return (
    <div
      className={cn(
        dataTableRowActionsVariants({ variant, className }),
        className
      )}
      {...props}
    >
      {detailUrl && (
        <Button variant="outline" size="sm" className="border-muted" asChild>
          <Link href={detailUrl} prefetch>
            {t("details")}
          </Link>
        </Button>
      )}
      {children && (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex size-8 p-0 hover:bg-theme-accent-background data-[state=open]:bg-muted dark:hover:text-foreground"
            >
              <MoreHorizontal />
              <span className="sr-only">{t("open-menu")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[160px] dark:bg-theme-accent-background "
          >
            {typeof children === "function"
              ? children({ close: () => setIsOpen(false) })
              : children}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
