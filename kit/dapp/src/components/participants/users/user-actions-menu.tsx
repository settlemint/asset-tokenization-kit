import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { User } from "@/orpc/routes/user/routes/user.me.schema";
// import { useNavigate } from "@tanstack/react-router";
import { Eye, MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

interface UserActionsMenuProps {
  user: User;
}

/**
 * Actions menu component for user table rows
 * Provides view details functionality for user management
 */
export function UserActionsMenu({ user }: UserActionsMenuProps) {
  // const navigate = useNavigate();
  const { t } = useTranslation("user");

  const handleViewDetails = () => {
    // Navigate to user detail page - this will be implemented in a future ticket
    // For now, we'll just log the action
    // eslint-disable-next-line no-console
    console.log("View details for user:", user.id);
    // Future implementation:
    // navigate({
    //   to: "/participants/users/$userId",
    //   params: { userId: user.id },
    // });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          aria-label={t("management.table.actions.menu")}
        >
          <span className="sr-only">
            {t("management.table.actions.openMenu")}
          </span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuItem onClick={handleViewDetails} disabled>
              <Eye className="mr-2 h-4 w-4" />
              {t("management.table.actions.viewDetails")}
            </DropdownMenuItem>
          </TooltipTrigger>
          <TooltipContent>
            <p>This feature is not yet implemented</p>
          </TooltipContent>
        </Tooltip>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
