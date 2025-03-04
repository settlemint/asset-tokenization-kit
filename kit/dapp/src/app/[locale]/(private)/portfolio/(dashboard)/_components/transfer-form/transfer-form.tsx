'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { TransferFormAssetType } from '@/lib/mutations/asset/transfer/transfer-schema';
import type { MyAsset } from '@/lib/queries/portfolio/portfolio-dashboard';
import { ArrowLeftRight } from 'lucide-react';
import { useState } from 'react';
import { TransferForm } from './form';
import { SelectAsset } from './select-asset';

interface TransferFormProps {
  assets: MyAsset[];
}

export function MyAssetsTransferForm({ assets }: TransferFormProps) {
  const [selectedAsset, setSelectedAsset] = useState<MyAsset | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <Sheet
      open={open}
      onOpenChange={(open) => {
        setSelectedAsset(null);
        setOpen(open);
      }}
    >
      <SheetTrigger asChild>
        <Button className="w-1/6">
          <ArrowLeftRight className="mr-2 h-4 w-4" />
          Transfer
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[34rem]">
        {selectedAsset ? (
          <>
            <SheetHeader>
              <SheetTitle>
                Transfer {selectedAsset?.asset.name} ({selectedAsset?.asset.symbol})
              </SheetTitle>
              <SheetDescription>
                Transfer {selectedAsset?.asset.name} securely by selecting a recipient and specifying the amount. Ensure
                you have sufficient balance for the transfer.
              </SheetDescription>
            </SheetHeader>
            <TransferForm
              open={open}
              address={selectedAsset.asset.id}
              name={selectedAsset.asset.name}
              symbol={selectedAsset.asset.symbol}
              assetType={selectedAsset.asset.type as TransferFormAssetType}
              balance={selectedAsset.value.toString()}
              decimals={selectedAsset.asset.decimals}
              onCloseAction={() => {
                setSelectedAsset(null);
                setOpen(false);
              }}
            />
          </>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>Transfer</SheetTitle>
              <SheetDescription>Which asset do you want to transfer?</SheetDescription>
            </SheetHeader>
            <SelectAsset assets={assets} onSelect={setSelectedAsset} />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
