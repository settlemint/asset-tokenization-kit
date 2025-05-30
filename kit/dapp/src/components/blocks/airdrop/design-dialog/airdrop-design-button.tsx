"use client";

import { Button } from "@/components/ui/button";
import type { User } from "@/lib/auth/types";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AirdropDesignerDialog } from "./airdrop-designer-dialog";

export function AirdropDesignButton({ currentUser }: { currentUser: User }) {
  const t = useTranslations("private.airdrops");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        className="bg-accent text-primary-foreground shadow-dropdown shadow-inset hover:bg-accent-hover hover:text-primary-foreground"
        onClick={() => setIsOpen(true)}
      >
        <PlusIcon className="mr-2 h-4 w-4" />
        {t("design-button")}
      </Button>

      <AirdropDesignerDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        currentUser={currentUser}
      />
    </>
  );
}
