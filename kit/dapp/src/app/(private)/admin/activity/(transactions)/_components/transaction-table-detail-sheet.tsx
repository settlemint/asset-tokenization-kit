import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { TransactionHash } from '@/components/blocks/transaction-hash/transaction-hash';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { formatDate } from '@/lib/date';
import { formatNumber } from '@/lib/number';
import { type Address, parseEther } from 'viem';
import type { TransactionListItem } from './transactions-table-data';

export function TransactionDetailSheet({
  transactionHash,
  address,
  createdAt,
  from,
  functionName,
  metadata,
  receipt,
}: TransactionListItem) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          Details
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[40rem]">
        <SheetHeader>
          <SheetTitle>Transaction details</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-[1fr_2fr] gap-4 [&>dd]:flex [&>dd]:items-center [&>dt]:flex [&>dt]:items-center">
                <dt className="text-muted-foreground text-sm">Contract:</dt>
                <dd className="text-sm">
                  <EvmAddress address={address as Address} />
                </dd>
                <dt className="text-muted-foreground text-sm">From:</dt>
                <dd className="text-sm">
                  <EvmAddress address={from as Address} />
                </dd>
                <dt className="text-muted-foreground text-sm">Function:</dt>
                <dd className="text-sm capitalize">{functionName}</dd>
                <dt className="text-muted-foreground text-sm">Created At:</dt>
                <dd className="text-sm">{createdAt ? formatDate(createdAt) : 'N/A'}</dd>
                <dt className="text-muted-foreground text-sm">Transaction Hash:</dt>
                <dd className="text-sm">
                  <TransactionHash hash={transactionHash} />
                </dd>
                {metadata && (
                  <>
                    <dt className="text-muted-foreground text-sm">Metadata:</dt>
                    <dd className="whitespace-pre-wrap font-mono text-sm">{JSON.stringify(metadata, null, 2)}</dd>
                  </>
                )}
              </dl>
            </CardContent>
          </Card>

          {receipt && (
            <Card>
              <CardHeader>
                <CardTitle>Receipt</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-[1fr_2fr] gap-4 [&>dd]:flex [&>dd]:items-center [&>dt]:flex [&>dt]:items-center">
                  <dt className="text-muted-foreground text-sm">Status:</dt>
                  <dd className="text-sm">{receipt.status ? 'Success' : 'Failed'}</dd>
                  {receipt.revertReasonDecoded && (
                    <>
                      <dt className="text-muted-foreground text-sm">Revert Reason:</dt>
                      <dd className="text-destructive text-sm">{receipt.revertReasonDecoded}</dd>
                    </>
                  )}
                  <dt className="text-muted-foreground text-sm">Block Number:</dt>
                  <dd className="text-sm">{receipt.blockNumber}</dd>
                  <dt className="text-muted-foreground text-sm">Block Hash:</dt>
                  <dd className="font-mono text-sm">
                    <TransactionHash hash={receipt.blockHash} />
                  </dd>
                  <dt className="text-muted-foreground text-sm">Gas Used:</dt>
                  <dd className="text-sm">{formatNumber(receipt.gasUsed, { decimals: 0 })}</dd>
                  {receipt.blobGasUsed && (
                    <>
                      <dt className="text-muted-foreground text-sm">Blob Gas Used:</dt>
                      <dd className="text-sm">{formatNumber(receipt.blobGasUsed, { decimals: 0 })}</dd>
                    </>
                  )}
                  {receipt.blobGasPrice && (
                    <>
                      <dt className="text-muted-foreground text-sm">Blob Gas Price:</dt>
                      <dd className="text-sm">{formatNumber(receipt.blobGasPrice, { decimals: 0 })}</dd>
                    </>
                  )}
                  <dt className="text-muted-foreground text-sm">Effective Gas Price:</dt>
                  <dd className="text-sm">{parseEther(receipt.effectiveGasPrice)}</dd>
                  <dt className="text-muted-foreground text-sm">Transaction Index:</dt>
                  <dd className="text-sm">{receipt.transactionIndex}</dd>
                  <dt className="text-muted-foreground text-sm">Type:</dt>
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
