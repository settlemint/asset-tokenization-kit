import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SystemAddon } from "@/orpc/routes/system/addon/routes/addon.list.schema";
import { Info, MoreHorizontal, Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AddonActionsMenuProps {
  addon: SystemAddon;
  userRoles: string[];
}

/**
 * Actions menu for managing individual addons
 * Provides options to view details, configure settings, etc.
 */
export function AddonActionsMenu({ addon, userRoles }: AddonActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleViewDetails = () => {
    // TODO: Implement view details dialog
    toast.info(`View details for ${addon.name} - Coming soon`);
    setIsOpen(false);
  };

  const handleConfigure = () => {
    // TODO: Implement configuration dialog
    toast.info(`Configure ${addon.name} - Coming soon`);
    setIsOpen(false);
  };

  const isAddonManager = userRoles.includes("addonManager");

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleViewDetails}>
          <Info className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        {isAddonManager && (
          <DropdownMenuItem onClick={handleConfigure}>
            <Settings className="mr-2 h-4 w-4" />
            Configure
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}