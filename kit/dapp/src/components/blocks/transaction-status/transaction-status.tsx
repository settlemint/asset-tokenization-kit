import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { TransactionStatus } from '@/hooks/use-transaction-status';
import type { TransactionReceiptWithDecodedError } from '@/lib/transactions';
import { CheckIcon, Loader2, XIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { SheetClose } from '../../ui/sheet';

interface TransactionStatusProps {
  status: NonNullable<TransactionStatus>;
  tokenName: string;
  transactionHash?: string;
  receipt?: TransactionReceiptWithDecodedError;
  error?: string;
  onClose: () => void;
  onConfirm?: () => void;
}

type StatusConfig = {
  icon: ReactNode;
  title: string;
  description: (tokenName: string, error?: string) => string;
  buttonText: (tokenName: string) => string;
  buttonDisabled?: boolean;
};

const STATUS_CONFIG: Record<NonNullable<TransactionStatus>, StatusConfig> = {
  Pending: {
    icon: <Loader2 className="h-8 w-8 animate-spin" />,
    title: 'Transaction Pending',
    description: () => 'Please wait while we create your token...',
    buttonText: (name) => `Creating "${name}"`,
    buttonDisabled: true,
  },
  Success: {
    icon: (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
        <CheckIcon className="h-5 w-5 text-white" />
      </div>
    ),
    title: 'Success',
    description: (name) => `"${name}" was created successfully on the blockchain.`,
    buttonText: (name) => `Check out "${name}"`,
  },
  Reverted: {
    icon: (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500">
        <XIcon className="h-5 w-5 text-white" />
      </div>
    ),
    title: 'Reverted',
    description: (_, error) => error ?? 'Transaction reverted',
    buttonText: (name) => `Error creating "${name}"`,
    buttonDisabled: true,
  },
  Failed: {
    icon: (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500">
        <XIcon className="h-5 w-5 text-white" />
      </div>
    ),
    title: 'Failed',
    description: (_, error) => error ?? 'Transaction failed',
    buttonText: (name) => `Error creating "${name}"`,
    buttonDisabled: true,
  },
};

export function TransactionStatusDisplay({
  status,
  tokenName,
  transactionHash,
  receipt,
  error,
  onClose,
  onConfirm,
}: TransactionStatusProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center space-y-4">
        {config.icon}
        <h3 className="font-medium text-lg">{config.title}</h3>
        <p className="text-muted-foreground text-sm">{config.description(tokenName, error)}</p>
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
        <Button onClick={onConfirm} disabled={config.buttonDisabled}>
          {config.buttonText(tokenName)}
        </Button>
      </div>
    </div>
  );
}
