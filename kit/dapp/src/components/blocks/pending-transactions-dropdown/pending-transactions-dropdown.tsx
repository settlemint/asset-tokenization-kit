"use client";

import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { TransactionHash } from "@/components/blocks/transaction-hash/transaction-hash";
import {
  SquareStackIcon,
  type SquareStackIconHandle,
} from "@/components/ui/animated-icons/square-stack";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePendingTransactions } from "@/lib/hooks/use-pending-transactions";
import { formatDate } from "@/lib/utils/date";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

export function PendingTransactionsDropdown() {
  const t = useTranslations("components.pending-transactions");
  const locale = useLocale();
  const iconRef = useRef<SquareStackIconHandle>(null);
  const { pendingTransactions, hasPendingTransactions } =
    usePendingTransactions();

  // Start animation when there are pending transactions
  useEffect(() => {
    if (hasPendingTransactions) {
      iconRef.current?.startAnimation();
    } else {
      iconRef.current?.stopAnimation();
    }
  }, [hasPendingTransactions]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={hasPendingTransactions ? "default" : "ghost"}
          size="icon"
          className="relative size-12 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:bg-sidebar-accent focus-visible:text-sidebar-accent-foreground dark:hover:bg-theme-accent-background dark:hover:text-foreground dark:focus-visible:bg-theme-accent-background dark:focus-visible:text-foreground focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
          aria-label={t("aria-label")}
        >
          <SquareStackIcon
            ref={iconRef}
            className={!hasPendingTransactions ? "text-muted-foreground" : ""}
            size={20}
          />
          {hasPendingTransactions && (
            <span className="absolute top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground pt-[1px]">
              {pendingTransactions.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[350px] rounded-lg shadow-dropdown"
      >
        {pendingTransactions.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {t("no-pending")}
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 p-2">
              {pendingTransactions.map((tx) => (
                <div
                  key={tx.transactionHash}
                  className="flex flex-col gap-2 rounded-lg border bg-card p-3 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {formatDate(tx.createdAt, { locale })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">From:</span>
                    <EvmAddress address={tx.from} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Contract:</span>
                    <EvmAddress address={tx.address} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Hash:</span>
                    <TransactionHash hash={tx.transactionHash} />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
