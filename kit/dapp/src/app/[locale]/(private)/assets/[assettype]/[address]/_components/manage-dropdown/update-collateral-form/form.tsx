"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { updateCollateral } from "@/lib/mutations/update-collateral/update-collateral-action";
import { UpdateCollateralSchema } from "@/lib/mutations/update-collateral/update-collateral-schema";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
import { Amount } from "./steps/amount";
import { Summary } from "./steps/summary";

interface UpdateCollateralFormProps {
  address: Address;
  assettype: AssetType;
  asButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  decimals: number;
  symbol: string;
}

export function UpdateCollateralForm({
  address,
  assettype,
  asButton = false,
  open,
  onOpenChange,
  disabled = false,
  decimals,
  symbol,
}: UpdateCollateralFormProps) {
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [internalOpenState, setInternalOpenState] = useState(false);
  const t = useTranslations("private.assets.details.forms.form");

  const formSheet = (
    <FormSheet
      open={isExternallyControlled ? open : internalOpenState}
      onOpenChange={
        isExternallyControlled ? onOpenChange : setInternalOpenState
      }
      title={t("title.update-collateral")}
      triggerLabel={
        isExternallyControlled
          ? undefined
          : t("trigger-label.update-collateral")
      }
      description={t("description.update-collateral")}
      asButton={asButton}
      disabled={disabled}
    >
      <Form
        action={updateCollateral}
        resolver={typeboxResolver(UpdateCollateralSchema({ decimals }))}
        onOpenChange={
          isExternallyControlled ? onOpenChange : setInternalOpenState
        }
        buttonLabels={{
          label: t("trigger-label.update-collateral"),
        }}
        defaultValues={{
          address,
          assettype: assettype,
        }}
      >
        <Amount decimals={decimals} symbol={symbol} />
        <Summary address={address} />
      </Form>
    </FormSheet>
  );

  if (disabled && asButton) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>{formSheet}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("errors.supply-manager-required")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return formSheet;
}
