"use client";

import { Amount } from "@/app/[locale]/(private)/portfolio/(dashboard)/_components/transfer-form/steps/amount";
import { Recipients } from "@/app/[locale]/(private)/portfolio/(dashboard)/_components/transfer-form/steps/recipients";
import { Summary } from "@/app/[locale]/(private)/portfolio/(dashboard)/_components/transfer-form/steps/summary";
import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { createStablecoin } from "@/lib/mutations/stablecoin/create/create-action";
import { CreateStablecoinSchema } from "@/lib/mutations/stablecoin/create/create-schema";
import type { MyAsset } from "@/lib/queries/asset-balance/asset-balance-my";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { SelectAsset } from "./select-asset";

type Asset = MyAsset["asset"] & {
  holders: { value: number; account: { id: string } }[];
};

export function MyAssetsTransferForm() {
  const t = useTranslations("portfolio.transfer-form");
  const tAssetTypes = useTranslations("portfolio.asset-types");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [open, setOpen] = useState(false);
  console.log("selectedAsset", selectedAsset);
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
            type: tAssetTypes(selectedAsset?.type),
            name: selectedAsset?.name,
            symbol: selectedAsset?.symbol,
          })}
        >
          <Form
            action={createStablecoin}
            resolver={zodResolver(CreateStablecoinSchema)}
            onOpenChange={setOpen}
            buttonLabels={{
              label: t("transfer"),
            }}
            defaultValues={{
              collateralLivenessSeconds: 3600 * 24 * 365,
            }}
          >
            <Recipients />
            <Amount
              balance={
                selectedAsset?.holders
                  .find(
                    (holder: { account: { id: string } }) =>
                      holder.account.id === selectedAsset?.id
                  )
                  ?.value.toString() ?? "0"
              }
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
            action={createStablecoin}
            resolver={zodResolver(CreateStablecoinSchema)}
            onOpenChange={setOpen}
            buttonLabels={{
              label: t("transfer"),
            }}
            defaultValues={{
              collateralLivenessSeconds: 3600 * 24 * 365,
            }}
          >
            <SelectAsset onSelect={setSelectedAsset} />
          </Form>
        </FormSheet>
      )}
    </>
  );
}
