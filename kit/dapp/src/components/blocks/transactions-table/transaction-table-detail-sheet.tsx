import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { TransactionHash } from "@/components/blocks/transaction-hash/transaction-hash";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Transaction } from "@/lib/queries/transactions/transaction-fragment";
import { formatDate } from "@/lib/utils/date";
import { formatNumber } from "@/lib/utils/number";
import { useTranslations } from "next-intl";

export function TransactionDetailSheet({
  transactionHash,
  address,
  createdAt,
  from,
  functionName,
  receipt,
}: Transaction) {
  const t = useTranslations("admin.activity.transaction-details");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          {t("trigger-label")}
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[40rem]">
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>{t("description")}</SheetDescription>
        </SheetHeader>
        <div className="mx-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("transaction-title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-[1fr_2fr] gap-4 [&>dd]:flex [&>dd]:items-center [&>dt]:flex [&>dt]:items-center">
                <dt className="text-muted-foreground text-sm">
                  {t("contract-label")}:
                </dt>
                <dd className="text-sm">
                  <EvmAddress address={address} />
                </dd>
                <dt className="text-muted-foreground text-sm">
                  {t("from-label")}:
                </dt>
                <dd className="text-sm">
                  <EvmAddress address={from} />
                </dd>
                <dt className="text-muted-foreground text-sm">
                  {t("function-label")}:
                </dt>
                <dd className="text-sm capitalize">{functionName}</dd>
                <dt className="text-muted-foreground text-sm">
                  {t("created-at-label")}:
                </dt>
                <dd className="text-sm">
                  {createdAt ? formatDate(createdAt) : "N/A"}
                </dd>
                <dt className="text-muted-foreground text-sm">
                  {t("transaction-hash-label")}:
                </dt>
                <dd className="text-sm">
                  <TransactionHash hash={transactionHash} />
                </dd>
              </dl>
            </CardContent>
          </Card>

          {receipt && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{t("receipt-title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-[1fr_2fr] gap-4 [&>dd]:flex [&>dd]:items-center [&>dt]:flex [&>dt]:items-center">
                  <dt className="text-muted-foreground text-sm">
                    {t("status-label")}:
                  </dt>
                  <dd className="text-sm">{receipt.status ?? "Failed"}</dd>
                  {receipt.revertReasonDecoded && (
                    <>
                      <dt className="text-muted-foreground text-sm">
                        {t("revert-reason-label")}:
                      </dt>
                      <dd className="text-destructive text-sm">
                        {receipt.revertReasonDecoded}
                      </dd>
                    </>
                  )}
                  <dt className="text-muted-foreground text-sm">
                    {t("block-number-label")}:
                  </dt>
                  <dd className="text-sm">{receipt.blockNumber}</dd>
                  <dt className="text-muted-foreground text-sm">
                    {t("block-hash-label")}:
                  </dt>
                  <dd className="font-mono text-sm">
                    <TransactionHash hash={receipt.blockHash} />
                  </dd>
                  <dt className="text-muted-foreground text-sm">
                    {t("gas-used-label")}:
                  </dt>
                  <dd className="text-sm">
                    {formatNumber(receipt.gasUsed, { decimals: 0 })}
                  </dd>
                  {receipt.blobGasUsed && (
                    <>
                      <dt className="text-muted-foreground text-sm">
                        {t("blob-gas-used-label")}:
                      </dt>
                      <dd className="text-sm">
                        {formatNumber(receipt.blobGasUsed, { decimals: 0 })}
                      </dd>
                    </>
                  )}
                  {receipt.blobGasPrice && (
                    <>
                      <dt className="text-muted-foreground text-sm">
                        {t("blob-gas-price-label")}:
                      </dt>
                      <dd className="text-sm">
                        {formatNumber(receipt.blobGasPrice, { decimals: 0 })}
                      </dd>
                    </>
                  )}
                  <dt className="text-muted-foreground text-sm">
                    {t("effective-gas-price-label")}:
                  </dt>
                  <dd className="text-sm">{receipt.effectiveGasPrice}</dd>
                  <dt className="text-muted-foreground text-sm">
                    {t("transaction-index-label")}:
                  </dt>
                  <dd className="text-sm">{receipt.transactionIndex}</dd>
                  <dt className="text-muted-foreground text-sm">
                    {t("type-label")}:
                  </dt>
                  <dd className="text-sm">{receipt.type}</dd>
                </dl>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
