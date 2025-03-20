"use client";

import { Amount } from "@/app/[locale]/(private)/portfolio/(dashboard)/_components/transfer-form/steps/amount";
import { Recipients } from "@/app/[locale]/(private)/portfolio/(dashboard)/_components/transfer-form/steps/recipients";
import { Summary } from "@/app/[locale]/(private)/portfolio/(dashboard)/_components/transfer-form/steps/summary";
import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { transferAsset } from "@/lib/mutations/asset/transfer/transfer-action";
import { getTransferFormSchema } from "@/lib/mutations/asset/transfer/transfer-schema";
import type { UserAsset } from "@/lib/queries/asset-balance/asset-balance-user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { SelectAsset } from "./select-asset";
import { useAccount } from "wagmi";

type Asset = UserAsset["asset"] & {
  holders: { value: number; account: { id: string } }[];
};

export function MyAssetsTransferForm() {
  const t = useTranslations("portfolio.transfer-form");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [open, setOpen] = useState(false);
  const { address: userAddress } = useAccount();
  
  const getUserBalance = () => {
    if (!selectedAsset?.holders || !userAddress) return "0";
    
    const userHolder = selectedAsset.holders.find(
      (holder) => holder.account.id.toLowerCase() === userAddress.toLowerCase()
    );
    
    return userHolder?.value.toString() ?? "0";
  };
  
  return (
    <>
      {selectedAsset ? (
        <FormSheet
          triggerLabel={t("transfer")}
          asButton
          open={open}
          onOpenChange={setOpen}
          title={`${t("transfer")} ${t("asset-types", {
            type: selectedAsset?.type,
            name: selectedAsset?.name,
            symbol: selectedAsset?.symbol,
          })}`}
          description={t("description", {
            name: selectedAsset?.name,
            symbol: selectedAsset?.symbol,
          })}
        >
          <Form
            action={transferAsset}
            resolver={zodResolver(getTransferFormSchema())}
            onOpenChange={setOpen}
            buttonLabels={{
              label: t("transfer"),
            }}
          >
            <Recipients />
            <Amount
              balance={getUserBalance()}
            />
            <Summary
              address={selectedAsset?.id}
              assetType={selectedAsset?.type}
              decimals={selectedAsset?.decimals}
            />
          </Form>
        </FormSheet>
      ) : (
        <FormSheet
          triggerLabel={t("transfer")}
          asButton
          open={open}
          onOpenChange={setOpen}
          title={t("select-asset.title")}
          description={t("select-asset.description")}
        >
          <Form
            action={transferAsset}
            resolver={zodResolver(getTransferFormSchema())}
            onOpenChange={setOpen}
            hideButtons
            secureForm={false}
          >
            <SelectAsset onSelect={setSelectedAsset} />
          </Form>
        </FormSheet>
      )}
    </>
  );
}
