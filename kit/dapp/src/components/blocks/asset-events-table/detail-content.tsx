"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api/client";
import { getRoleFromHash } from "@/lib/config/roles";
import { formatDate } from "@/lib/utils/date";
import { useTranslations } from "next-intl";
import React from "react";
import useSWR from "swr";
import { isAddress, type Hash, type Hex } from "viem";
import { EvmAddress } from "../evm-address/evm-address";
import { TransactionHash } from "../transaction-hash/transaction-hash";

export const EventDetailContent = React.memo(function EventDetailContent({
  eventId,
}: {
  eventId: string;
}) {
  const t = useTranslations("components.asset-events-table.detail-sheet");
  const { data: event, isLoading } = useSWR(
    [`events-${eventId}`],
    async () => {
      const { data } = await apiClient.api
        .events({
          id: eventId,
        })
        .get();
      return data;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000, // 10 seconds
    }
  );

  if (isLoading || !event) {
    return (
      <SheetContent className="min-w-[34rem]">
        <SheetHeader>
          <Skeleton className="mb-1 h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </SheetHeader>
        <div className="mx-4 mt-4 overflow-auto">
          <Card>
            <CardContent className="pt-6">
              <dl className="grid grid-cols-[1fr_2fr] gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-full" />
              </dl>
            </CardContent>
          </Card>
          <Skeleton className="mt-6 mb-6 h-10 w-full" />
        </div>
      </SheetContent>
    );
  }

  return (
    <SheetContent className="min-w-[34rem]">
      <SheetHeader>
        <SheetTitle>{event.eventName}</SheetTitle>
      </SheetHeader>
      <div className="mx-4 overflow-auto">
        <Card>
          <CardHeader>
            <CardTitle>Event details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[1fr_2fr] gap-4">
              <dt className="text-muted-foreground text-sm">{t("sender")}:</dt>
              <dd className="text-sm">
                <EvmAddress address={event.sender.id} />
              </dd>
              <dt className="text-muted-foreground text-sm">{t("asset")}:</dt>
              <dd className="text-sm">
                <EvmAddress address={event.emitter.id} />
              </dd>
              <dt className="text-muted-foreground text-sm">{t("date")}:</dt>
              <dd className="text-sm first-letter:uppercase">
                {formatDate(event.blockTimestamp)}
              </dd>
              <dt className="text-muted-foreground text-sm">
                {t("transaction-hash")}:
              </dt>
              <dd className="text-sm">
                <TransactionHash hash={event.transactionHash as Hash} />
              </dd>
            </dl>
          </CardContent>
        </Card>
        <div className="mt-6 mb-6">
          {event.values && Object.keys(event.values).length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Event parameters</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-[1fr_2fr] gap-4">
                    {event.values.map(({ name, value }) => [
                      <dt
                        key={`${name}-dt`}
                        className="text-muted-foreground text-sm capitalize"
                      >
                        {name}:
                      </dt>,
                      <dd key={`${name}-dd`} className="text-sm break-all">
                        {isAddress(value as Hash) ? (
                          <EvmAddress address={value as Hash} />
                        ) : getRoleFromHash(value as Hex) ? (
                          <span>{t(getRoleFromHash(value as Hex) as any)}</span>
                        ) : (
                          String(value)
                        )}
                      </dd>,
                    ])}
                  </dl>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </SheetContent>
  );
});
