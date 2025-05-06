"use client";

import { XvpDetailContent } from "@/components/blocks/xvp-status/detail-content";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import type { XvPSettlement } from "@/lib/queries/xvp/xvp-list";
import { useTranslations } from "next-intl";

export function XvpDetailSheet({ xvp }: { xvp: XvPSettlement }) {
  const t = useTranslations("trade-management.xvp");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          {t("details")}
        </Button>
      </SheetTrigger>
      <XvpDetailContent xvp={xvp} />
    </Sheet>
  );
}
