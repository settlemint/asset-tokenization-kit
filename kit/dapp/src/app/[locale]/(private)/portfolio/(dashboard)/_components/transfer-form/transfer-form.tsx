"use client";

import { FormSheet } from "@/components/blocks/form/form-sheet";
import type { MyAsset } from "@/lib/queries/asset-balance/asset-balance-my";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { TransferForm } from "./form";
import { SelectAsset } from "./select-asset";

interface TransferFormProps {
  assets: MyAsset[];
}

export function MyAssetsTransferForm({ assets }: TransferFormProps) {
  const t = useTranslations("portfolio.transfer-form");
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
        <FormSheet
          open={open}
          onOpenChange={setOpen}
          title={t("select-asset.title")}
          description={t("select-asset.description")}
        >
          <SelectAsset assets={assets} onSelect={setSelectedAsset} />
        </FormSheet>
      )}
    </>
  );
}
