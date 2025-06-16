"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import { MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { Fragment, type HTMLAttributes, type ReactNode, useState } from "react";

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
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DataTableColumnCellProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof dataTableRowActionsVariants> {
  detailUrl?: string;
  actions?: {
    id: string;
    label: string;
    component:
      | ReactNode
      | ((renderProps: DataTableColumnCellRenderProps) => ReactNode);
    disabled?: boolean;
    hidden?: boolean;
  }[];
}

export function DataTableRowActions({
  className,
  variant = "default",
  actions: actionsProp,
  detailUrl,
  ...props
}: DataTableColumnCellProps) {
  const t = useTranslations("components.data-table");
  const [isOpen, setIsOpen] = useState(false);
  const [openItem, setOpenItem] = useState<string | null>(null);
  const actions = actionsProp?.filter((action) => !action.hidden);
  if (!actions && !detailUrl) {
    return null;
  }

  const handleMenuItemClick = (actionId: string) => {
    setIsOpen(false); // Close the dropdown menu
    setOpenItem(actionId); // Set the open item
  };

  const actionItem = openItem
    ? actions?.find((action) => action.id === openItem)
    : null;

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

      {(actions ?? []).length > 0 && (
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
            className="w-[160px] dark:bg-theme-accent-background"
          >
            {actions?.map((action) => (
              <Fragment key={action.id}>
                <DropdownMenuItem
                  onSelect={() => handleMenuItemClick(action.id)}
                  disabled={action.disabled}
                >
                  {action.label}
                </DropdownMenuItem>
              </Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {actionItem && (
        <span>
          {typeof actionItem.component === "function"
            ? actionItem.component({
                open: true,
                onOpenChange: (open) => {
                  setOpenItem(open ? actionItem.id : null);
                },
              })
            : actionItem.component}
        </span>
      )}
    </div>
  );
}
