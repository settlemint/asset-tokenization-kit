"use client";

import { Button } from "@/components/ui/button";
import type { User } from "better-auth";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AssetDesignerDialog } from "./asset-designer-dialog";

export function AssetDesignerButton({ currentUser }: { currentUser: User }) {
  const t = useTranslations("admin.sidebar");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="px-2 pt-2 pb-1">
        <Button
          variant="secondary"
          size="sm"
          className="w-full bg-accent text-primary-foreground shadow-dropdown shadow-inset hover:bg-accent-hover hover:text-primary-foreground"
          onClick={() => setIsOpen(true)}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          {t("asset-designer")}
        </Button>
      </div>

      <AssetDesignerDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        currentUser={currentUser}
      />
    </>
  );
}
