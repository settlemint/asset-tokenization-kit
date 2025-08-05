import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { type VariantProps, cva } from "class-variance-authority";
import { MoreHorizontal } from "lucide-react";
import {
  Fragment,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("data-table");
  const [isOpen, setIsOpen] = useState(false);
  const [openItem, setOpenItem] = useState<string | null>(null);

  const handleMenuItemClick = useCallback((actionId: string) => {
    setIsOpen(false); // Close the dropdown menu
    setOpenItem(actionId); // Set the open item
  }, []);

  const actions = actionsProp?.filter((action) => !action.hidden);

  const menuItemHandlers = useMemo(() => {
    if (!actions) return {};
    return actions.reduce<Record<string, () => void>>((acc, action) => {
      acc[action.id] = () => {
        handleMenuItemClick(action.id);
      };
      return acc;
    }, {});
  }, [actions, handleMenuItemClick]);

  if (!actions && !detailUrl) {
    return null;
  }

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
        <Button
          variant="outline"
          size="sm"
          className="border-muted press-effect"
          asChild
        >
          <Link to={detailUrl}>{t("details")}</Link>
        </Button>
      )}

      {(actions ?? []).length > 0 && (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex size-8 p-0 hover:bg-theme-accent-background data-[state=open]:bg-muted dark:hover:text-foreground press-effect"
            >
              <MoreHorizontal />
              <span className="sr-only">{t("openMenu")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[160px] dark:bg-theme-accent-background"
          >
            {actions?.map((action) => (
              <Fragment key={action.id}>
                <DropdownMenuItem
                  onSelect={menuItemHandlers[action.id]}
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
