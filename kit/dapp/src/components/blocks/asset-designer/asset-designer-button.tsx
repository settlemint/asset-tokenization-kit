"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { User } from "better-auth";
import { PencilIcon, PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AssetDesignerDialog } from "./asset-designer-dialog";

export function AssetDesignerButton({ currentUser }: { currentUser: User }) {
  const t = useTranslations("admin.sidebar");
  const [isOpen, setIsOpen] = useState(false);
  const { state, isMobile } = useSidebar();

  const isCollapsed = state === "collapsed";

  const buttonContent = (
    <Button
      variant="secondary"
      size="sm"
      className={`w-full bg-accent text-primary-foreground shadow-dropdown shadow-inset hover:bg-accent-hover hover:text-primary-foreground ${
        isCollapsed
          ? "group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:p-0"
          : ""
      }`}
      onClick={() => setIsOpen(true)}
    >
      {isCollapsed ? (
        <PencilIcon className="h-4 w-4" />
      ) : (
        <>
          <PlusIcon className="mr-2 h-4 w-4" />
          {t("asset-designer")}
        </>
      )}
    </Button>
  );

  return (
    <>
      <div className="px-2 pt-2 pb-1">
        {isCollapsed && !isMobile ? (
          <Tooltip>
            <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
            <TooltipContent side="right" align="center">
              {t("asset-designer")}
            </TooltipContent>
          </Tooltip>
        ) : (
          buttonContent
        )}
      </div>

      <AssetDesignerDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        currentUser={currentUser}
      />
    </>
  );
}
