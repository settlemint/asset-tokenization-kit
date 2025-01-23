import { Button } from '@/components/ui/button';
import { CopyToClipboard } from '@/components/ui/copy';
import type { TransactionStatus } from '@/hooks/use-transaction-status';
import { CheckIcon, Loader2, XIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { SheetClose } from '../../ui/sheet';

interface TransactionStatusProps {
  status: NonNullable<TransactionStatus>;
  tokenName: string;
  transactionHash?: string;
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
    title: 'Transaction pending',
    description: () => 'Please wait while we create your token...',
    buttonText: (name) => `Creating '${name}'`,
    buttonDisabled: true,
  },
  Success: {
    icon: (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
        <CheckIcon className="h-5 w-5 text-white" />
      </div>
    ),
    title: 'Success',
    description: (name) =>
      `'${name}' was created successfully on the blockchain. You can now proceed with using your new asset.`,
    buttonText: (name) => `Check out '${name}'`,
  },
  Reverted: {
    icon: (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500">
        <XIcon className="h-5 w-5 text-white" />
      </div>
    ),
    title: 'Transaction reverted',
    description: (name, _error) => `An error occurred while creating '${name}'. Please try again.`,
    buttonText: (name) => `Error creating '${name}'`,
    buttonDisabled: true,
  },
  Failed: {
    icon: (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500">
        <XIcon className="h-5 w-5 text-white" />
      </div>
    ),
    title: 'Transaction failed',
    description: (name, _error) => `An error occurred while creating '${name}'. Please try again.`,
    buttonText: (name) => `Error creating '${name}'`,
    buttonDisabled: true,
  },
};

export function TransactionStatusDisplay({
  status,
  tokenName,
  transactionHash,
  error,
  onClose,
  onConfirm,
}: TransactionStatusProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-center space-y-4">
        <div className="flex w-full items-center justify-center">{config.icon}</div>
        <h3 className="font-medium text-lg">{config.title}</h3>
        <p className="text-sm">{config.description(tokenName, error)}</p>
      </div>

      {/* TODO: Replace with a link to view the transaction on the blockchain */}
      {transactionHash && (
        <div className="text-sm">
          <p>Transaction hash</p>
          <CopyToClipboard value={transactionHash} className="text-muted-foreground" />
        </div>
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
