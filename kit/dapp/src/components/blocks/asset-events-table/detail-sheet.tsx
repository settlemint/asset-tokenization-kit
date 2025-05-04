import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { AssetEventListItem } from "@/lib/queries/asset-events/asset-events-schema";
import { formatDate } from "@/lib/utils/date";
import { useTranslations } from "next-intl";
import type { Address } from "viem";
import { EvmAddress } from "../evm-address/evm-address";

export function EventDetailSheet({
  eventName,
  blockTimestamp,
  emitter,
  sender,
}: AssetEventListItem) {
  const t = useTranslations("components.asset-events-table.detail-sheet");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          {t("details-button")}
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[34rem]">
        <SheetHeader>
          <SheetTitle>{eventName}</SheetTitle>
          <SheetDescription>
            {t("details-for-event", { eventName })}
          </SheetDescription>
        </SheetHeader>
        <div className="mx-4 overflow-auto">
          <Card>
            <CardContent className="pt-6">
              <dl className="grid grid-cols-[1fr_2fr] gap-4">
                <dt className="text-muted-foreground text-sm">
                  {t("sender")}:
                </dt>
                <dd className="text-sm">
                  <EvmAddress address={sender.id as Address} />
                </dd>
                <dt className="text-muted-foreground text-sm">
                  {t("asset-type")}:
                </dt>
                <dt className="text-muted-foreground text-sm">{t("asset")}:</dt>
                <dd className="text-sm">
                  <EvmAddress address={emitter.id as Address} />
                </dd>
                <dt className="text-muted-foreground text-sm">{t("date")}:</dt>
                <dd className="text-sm first-letter:uppercase">
                  {formatDate(blockTimestamp)}
                </dd>
                <dt className="text-muted-foreground text-sm">
                  {t("transaction-hash")}:
                </dt>
              </dl>
            </CardContent>
          </Card>
          <div className="mt-6 mb-6">{/* TODO: Add details */}</div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
