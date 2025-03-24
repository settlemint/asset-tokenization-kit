"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { transfer } from "@/lib/mutations/transfer/transfer-action";
import { TransferSchema } from "@/lib/mutations/transfer/transfer-schema";
import type { AssetUsers } from "@/lib/queries/asset/asset-users-schema";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
import { SelectAsset } from "./select-asset";
import { Amount } from "./steps/amount";
import { Recipients } from "./steps/recipients";
import { Summary } from "./steps/summary";

interface TransferFormProps {
  address?: Address;
  assettype?: AssetType;
  balance?: number;
  decimals?: number;
  symbol?: string;
  asButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  userAddress: Address;
}

export function TransferForm({
  address,
  assettype,
  balance,
  decimals,
  symbol,
  asButton = false,
  open,
  onOpenChange,
  disabled = false,
  userAddress,
}: TransferFormProps) {
  const t = useTranslations("portfolio.my-assets.bond");
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [internalOpenState, setInternalOpenState] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<AssetUsers | null>(null);

  const assetAddress = address ?? selectedAsset?.id;
  const assetType = assettype ?? selectedAsset?.type;
  const userBalance =
    balance ??
    selectedAsset?.holders?.find((h) => h.account.id === userAddress)?.value ??
    0;

  const handleSheetOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset selectedAsset when sheet closes
      setSelectedAsset(null);
    }

    if (isExternallyControlled) {
      onOpenChange?.(isOpen);
    } else {
      setInternalOpenState(isOpen);
    }
  };

  return (
    <FormSheet
      open={isExternallyControlled ? open : internalOpenState}
      onOpenChange={handleSheetOpenChange}
      triggerLabel={
        isExternallyControlled ? undefined : t("transfer-form.trigger-label")
      }
      title={t("transfer-form.title")}
      description={t("transfer-form.description")}
      asButton={asButton}
      disabled={disabled}
    >
      {!address && !selectedAsset ? (
        <SelectAsset onSelect={setSelectedAsset} />
      ) : (
        <Form
          action={transfer}
          resolver={typeboxResolver(TransferSchema())}
          onOpenChange={handleSheetOpenChange}
          buttonLabels={{
            label: t("transfer-form.button-label"),
          }}
          defaultValues={{
            address: assetAddress,
            assettype: assetType,
          }}
        >
          <Amount
            balance={Number(userBalance)}
            decimals={decimals ?? selectedAsset?.decimals ?? 18}
            symbol={symbol ?? selectedAsset?.symbol ?? ""}
          />
          <Recipients />
          <Summary address={assetAddress!} />
        </Form>
      )}
    </FormSheet>
  );
}
