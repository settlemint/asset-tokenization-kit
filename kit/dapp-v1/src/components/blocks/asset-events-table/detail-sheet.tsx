"use client";

import { EventDetailContent } from "@/components/blocks/asset-events-table/detail-content";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { useTranslations } from "next-intl";

export function EventDetailSheet({ eventId }: { eventId: string }) {
  const t = useTranslations("components.asset-events-table.detail-sheet");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          {t("details-button")}
        </Button>
      </SheetTrigger>
      <EventDetailContent eventId={eventId} />
    </Sheet>
  );
}
