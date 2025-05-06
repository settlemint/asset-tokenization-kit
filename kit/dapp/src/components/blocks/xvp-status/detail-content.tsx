"use client";

import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { XvPSettlement } from "@/lib/queries/xvp/xvp-list";
import { useTranslations } from "next-intl";

export function XvpDetailContent({ xvp }: { xvp: XvPSettlement }) {
  const t = useTranslations("trade-management.xvp");

  return (
    <SheetContent className="min-w-[34rem]">
      <SheetHeader>
        <SheetTitle>Hello</SheetTitle>
      </SheetHeader>
    </SheetContent>
  );
}
