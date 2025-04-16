"use client";

import { hasAllowlist } from "@/app/[locale]/(private)/assets/[assettype]/[address]/_components/features-enabled";
import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import type { FormStepComponent } from "@/components/blocks/form/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { mint } from "@/lib/mutations/mint/mint-action";
import { MintSchema } from "@/lib/mutations/mint/mint-schema";
import type { AllowedUser } from "@/lib/queries/asset/asset-users-schema";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { getAddress, type Address } from "viem";
import { Amount } from "./steps/amount";
import { Recipients as RecipientsStep } from "./steps/recipients";
import { Summary } from "./steps/summary";

interface MintFormProps {
  address: Address;
  assettype: AssetType;
  recipient?: Address;
  max?: number;
  decimals: number;
  symbol: string;
  asButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  allowlist: AllowedUser[];
}

export function MintForm({
  address,
  assettype,
  recipient,
  max,
  decimals,
  symbol,
  open,
  onOpenChange,
  allowlist,
  disabled = false,
  asButton = false,
}: MintFormProps) {
  const t = useTranslations("private.assets.details.forms.form");
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [internalOpenState, setInternalOpenState] = useState(false);

  const Recipients = RecipientsStep as FormStepComponent<
    ReturnType<typeof MintSchema>
  >;
  Recipients.customValidation = [
    async (form) => {
      const to = form.getValues("to");
      if (
        to &&
        hasAllowlist(assettype) &&
        !allowlist.some((item) => getAddress(item.user.id) === getAddress(to))
      ) {
        form.setError("to", {
          message: t("errors.not-in-allowlist-error"),
        });
        return false;
      }
      return true;
    },
  ];

  const steps = recipient
    ? [
        <Amount
          key="amount"
          max={max}
          decimals={decimals}
          symbol={symbol}
          assettype={assettype}
        />,
        <Summary key="summary" address={address} />,
      ]
    : [
        <Amount
          key="amount"
          max={max}
          decimals={decimals}
          symbol={symbol}
          assettype={assettype}
        />,
        <Recipients key="recipients" />,
        <Summary key="summary" address={address} />,
      ];

  const formSheet = (
    <FormSheet
      open={isExternallyControlled ? open : internalOpenState}
      onOpenChange={
        isExternallyControlled ? onOpenChange : setInternalOpenState
      }
      triggerLabel={
        isExternallyControlled ? undefined : t("trigger-label.mint")
      }
      title={t("title.mint")}
      description={t("description.mint")}
      asButton={asButton}
      disabled={disabled}
    >
      <Form
        action={mint}
        resolver={typeboxResolver(MintSchema({ maxAmount: max, decimals }))}
        onOpenChange={
          isExternallyControlled ? onOpenChange : setInternalOpenState
        }
        buttonLabels={{
          label: t("trigger-label.mint"),
        }}
        defaultValues={{
          address,
          assettype,
          to: recipient,
        }}
        onAnyFieldChange={(form) => {
          form.clearErrors(["to"]);
        }}
      >
        {steps.map((step) => step)}
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
