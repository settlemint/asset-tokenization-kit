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
import { MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export interface ActionItem {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  separator?: "before" | "after";
}

interface ActionsCellProps {
  actions: ActionItem[];
  label?: string;
  align?: "start" | "center" | "end";
}

/**
 * Reusable cell component for displaying row actions in a dropdown menu
 */
export function ActionsCell({
  actions,
  label,
  align = "end",
}: ActionsCellProps) {
  const { t } = useTranslation("general");
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">{t("components.data-table.open-menu")}</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        <DropdownMenuLabel>{label ?? t("components.data-table.actions")}</DropdownMenuLabel>
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
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </a>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
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
