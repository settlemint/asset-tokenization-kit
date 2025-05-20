"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { UpdateReservesSchema } from "@/lib/mutations/regulations/mica/update-reserves/update-reserves-schema";
import { type StaticDecode } from "@/lib/utils/typebox";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

type UpdateReservesInput = StaticDecode<
  ReturnType<typeof UpdateReservesSchema>
>;

export function Composition() {
  const t = useTranslations(
    "regulations.mica.dashboard.reserve-status.form.fields"
  );
  const { control } = useFormContext<UpdateReservesInput>();

  return (
    <FormStep
      title={t("reserve-composition.title")}
      description={t("reserve-composition.description")}
    >
      <div className="space-y-4">
        <FormInput
          control={control}
          name="bankDeposits"
          type="number"
          min={0}
          max={100}
          label={t("reserve-composition.fields.bank-deposits.title")}
          description={t(
            "reserve-composition.fields.bank-deposits.description"
          )}
          postfix="%"
          required
        />

        <FormInput
          control={control}
          name="governmentBonds"
          type="number"
          min={0}
          max={100}
          label={t("reserve-composition.fields.government-bonds.title")}
          description={t(
            "reserve-composition.fields.government-bonds.description"
          )}
          postfix="%"
          required
        />

        <FormInput
          control={control}
          name="highQualityLiquidAssets"
          type="number"
          min={0}
          max={100}
          label={t(
            "reserve-composition.fields.high-quality-liquid-assets.title"
          )}
          description={t(
            "reserve-composition.fields.high-quality-liquid-assets.description"
          )}
          postfix="%"
          required
        />

        <FormInput
          control={control}
          name="corporateBonds"
          type="number"
          min={0}
          max={10}
          label={t("reserve-composition.fields.corporate-bonds.title")}
          description={t(
            "reserve-composition.fields.corporate-bonds.description"
          )}
          postfix="%"
          required
        />

        <FormInput
          control={control}
          name="centralBankAssets"
          type="number"
          min={0}
          max={100}
          label={t("reserve-composition.fields.central-bank-assets.title")}
          description={t(
            "reserve-composition.fields.central-bank-assets.description"
          )}
          postfix="%"
          required
        />

        <FormInput
          control={control}
          name="commodities"
          type="number"
          min={0}
          max={100}
          label={t("reserve-composition.fields.commodities.title")}
          description={t("reserve-composition.fields.commodities.description")}
          postfix="%"
          required
        />

        <FormInput
          control={control}
          name="otherAssets"
          type="number"
          min={0}
          max={100}
          label={t("reserve-composition.fields.other-assets.title")}
          description={t("reserve-composition.fields.other-assets.description")}
          postfix="%"
          required
        />
      </div>
    </FormStep>
  );
}

// Add validated fields for form step validation
Composition.validatedFields = [
  "tokenType",
  "bankDeposits",
  "governmentBonds",
  "highQualityLiquidAssets",
  "corporateBonds",
  "centralBankAssets",
  "commodities",
  "otherAssets",
] satisfies (keyof UpdateReservesInput)[];
