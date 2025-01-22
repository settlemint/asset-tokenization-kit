import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { TransactionReceiptWithDecodedError } from '@/lib/transactions';
import { CheckIcon, Loader2, XIcon } from 'lucide-react';
import { SheetClose } from '../ui/sheet';

interface TransactionStatusProps {
  status: 'pending' | 'success' | 'error';
  tokenName: string;
  transactionHash?: string;
  receipt?: TransactionReceiptWithDecodedError;
  error?: string;
  onClose: () => void;
  onCheckout?: () => void;
}

export function TransactionStatus({
  status,
  tokenName,
  transactionHash,
  receipt,
  error,
  onClose,
  onCheckout,
}: TransactionStatusProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center space-y-4">
        {status === 'pending' && (
          <>
            <Loader2 className="h-8 w-8 animate-spin" />
            <h3 className="font-medium text-lg">Transaction Pending</h3>
            <p className="text-muted-foreground text-sm">Please wait while we create your token...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
              <CheckIcon className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-medium text-lg">Success</h3>
            <p className="text-muted-foreground text-sm">"{tokenName}" was created successfully on the blockchain.</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500">
              <XIcon className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-medium text-lg">Error</h3>
            <p className="text-muted-foreground text-sm">{error}</p>
          </>
        )}
      </div>

      {transactionHash && (
        <Card className="p-4">
          <p className="font-medium text-sm">Transaction Hash</p>
          <p className="break-all text-muted-foreground text-xs">{transactionHash}</p>
        </Card>
      )}

      {receipt && (
        <Card className="p-4">
          <p className="font-medium text-sm">Transaction Receipt</p>
          <div className="text-muted-foreground text-xs">
            <p>Block Number: {receipt.blockNumber}</p>
            <p>Contract Address: {receipt.contractAddress}</p>
            <p>Status: {receipt.status ? 'Success' : 'Failed'}</p>
          </div>
        </Card>
      )}

      <div className="flex justify-end gap-2">
        <SheetClose asChild>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </SheetClose>
        {status === 'success' && <Button onClick={onCheckout}>Check out "{tokenName}"</Button>}
        {status === 'pending' && (
          <Button onClick={onCheckout} disabled>
            Creating "{tokenName}"
          </Button>
        )}
        {status === 'error' && (
          <Button onClick={onCheckout} disabled>
            Error creating "{tokenName}"
          </Button>
        )}
      </div>
    </div>
  );
}
