"use client";

import type { MyAsset } from "@/lib/queries/portfolio/portfolio-dashboard";
import { useState } from "react";
import { TransferForm } from "./form";
import { SelectAsset } from "./select-asset";

interface TransferFormProps {
  assets: MyAsset[];
}

export function MyAssetsTransferForm({ assets }: TransferFormProps) {
  const [selectedAsset, setSelectedAsset] = useState<MyAsset | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      {selectedAsset ? (
        <TransferForm
          open={open}
          address={selectedAsset.asset.id}
          name={selectedAsset.asset.name}
          symbol={selectedAsset.asset.symbol}
          assetType={selectedAsset.asset.type}
          balance={selectedAsset.value.toString()}
          decimals={selectedAsset.asset.decimals}
          onCloseAction={() => {
            setSelectedAsset(null);
            setOpen(false);
          }}
        />
      ) : (
        <SelectAsset assets={assets} onSelect={setSelectedAsset} />
      )}
    </>
  );
}
