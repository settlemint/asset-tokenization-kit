"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

const logger = createLogger();

/**
 * Represents a single action item in the dropdown menu
 * @interface ActionItem
 */
export interface ActionItem {
  /** Display text for the action */
  label: string;
  /** Optional icon to display before the label */
  icon?: ReactNode;
  /** Click handler for button-type actions */
  onClick?: () => void;
  /** URL for link-type actions (opens in new tab) */
  href?: string;
  /** Whether the action should be disabled */
  disabled?: boolean;
  /** Position to show a separator relative to this item */
  separator?: "before" | "after";
}

/**
 * Props for the ActionsCell component
 * @interface ActionsCellProps
 */
interface ActionsCellProps {
  /** Array of actions to display in the dropdown */
  actions: ActionItem[];
  /** Optional custom label for the dropdown menu header */
  label?: string;
  /** Alignment of the dropdown relative to the trigger button */
  align?: "start" | "center" | "end";
}

/**
 * Reusable cell component for displaying row actions in a dropdown menu.
 * Commonly used in data tables to provide contextual actions for each row.
 *
 * @example
 * ```tsx
 * <ActionsCell
 *   actions={[
 *     { label: "Edit", onClick: () => handleEdit(row.id) },
 *     { label: "View Details", href: `/details/${row.id}` },
 *     { separator: "before", label: "Delete", onClick: () => handleDelete(row.id), disabled: !canDelete }
 *   ]}
 *   align="end"
 * />
 * ```
 *
 * @param props - The component props
 * @returns A dropdown menu with action items
 */
export function ActionsCell({
  actions,
  label,
  align = "end",
}: ActionsCellProps) {
  const { t } = useTranslation("data-table");

  // Memoize the button click handler
  const handleButtonClick = useCallback((e: React.MouseEvent) => {
    logger.debug("Actions button clicked");
    e.stopPropagation();
  }, []);

  // Memoize the dropdown item click handler
  const createItemClickHandler = useCallback(
    (action: ActionItem) => () => {
      logger.debug("Dropdown item clicked:", action.label);
      action.onClick?.();
    },
    []
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={handleButtonClick}
        >
          <span className="sr-only">{t("openMenu")}</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        <DropdownMenuLabel>{label ?? t("actions")}</DropdownMenuLabel>
        {actions.map((action, index) => (
          <div key={index}>
            {action.separator === "before" && <DropdownMenuSeparator />}
            {action.href ? (
              <DropdownMenuItem asChild disabled={action.disabled}>
                <a
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  {action.icon && (
                    <span className="mr-2 [&>svg]:text-muted-foreground [&>svg]:transition-colors">
                      {action.icon}
                    </span>
                  )}
                  {action.label}
                </a>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={createItemClickHandler(action)}
                disabled={action.disabled}
              >
                {action.icon && (
                  <span className="mr-2 [&>svg]:text-muted-foreground [&>svg]:transition-colors">
                    {action.icon}
                  </span>
                )}
                {action.label}
              </DropdownMenuItem>
            )}
            {action.separator === "after" && <DropdownMenuSeparator />}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
