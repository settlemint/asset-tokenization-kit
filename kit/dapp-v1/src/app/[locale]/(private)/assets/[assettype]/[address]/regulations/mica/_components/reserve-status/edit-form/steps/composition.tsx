"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { UpdateReservesSchema } from "@/lib/mutations/regulations/mica/update-reserves/update-reserves-schema";
import type { StaticDecode } from "@/lib/utils/typebox";
import { useTranslations } from "next-intl";
import { useFormContext, useWatch, type UseFormReturn } from "react-hook-form";

type UpdateReservesInput = StaticDecode<
  ReturnType<typeof UpdateReservesSchema>
>;

export function Composition() {
  const t = useTranslations(
    "regulations.mica.dashboard.reserve-status.form.fields"
  );
  const {
    control,
    formState: { errors },
  } = useFormContext<UpdateReservesInput>();

  const values = useWatch({
    control,
    name: [
      "bankDeposits",
      "governmentBonds",
      "liquidAssets",
      "corporateBonds",
      "centralBankAssets",
      "commodities",
      "otherAssets",
    ],
  });

  const total = values.reduce((sum, value) => sum + (value || 0), 0);

  return (
    <FormStep
      title={t("reserve-composition.title")}
      description={t("reserve-composition.description")}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Total:</span>
            <span className={total !== 100 ? "text-destructive" : ""}>
              {total}%
            </span>
          </div>
          {errors.root?.type === "custom" && (
            <p className="text-sm text-destructive">
              {t("reserve-composition.errors.total-percentage")}
            </p>
          )}
        </div>

        <FormInput
          control={control}
          name="bankDeposits"
          type="number"
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
          label={t("reserve-composition.fields.government-bonds.title")}
          description={t(
            "reserve-composition.fields.government-bonds.description"
          )}
          postfix="%"
          required
        />

        <FormInput
          control={control}
          name="liquidAssets"
          type="number"
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
          label={t("reserve-composition.fields.commodities.title")}
          description={t("reserve-composition.fields.commodities.description")}
          postfix="%"
          required
        />

        <FormInput
          control={control}
          name="otherAssets"
          type="number"
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
  "bankDeposits",
  "governmentBonds",
  "liquidAssets",
  "corporateBonds",
  "centralBankAssets",
  "commodities",
  "otherAssets",
] satisfies (keyof UpdateReservesInput)[];

// Add custom validation to check total equals 100%
Composition.customValidation = [
  async (form: UseFormReturn<UpdateReservesInput>) => {
    const values = form.getValues([
      "bankDeposits",
      "governmentBonds",
      "liquidAssets",
      "corporateBonds",
      "centralBankAssets",
      "commodities",
      "otherAssets",
    ]);
    const total = values.reduce(
      (sum: number, value: number) => sum + (value || 0),
      0
    );
    if (total !== 100) {
      form.setError("root", {
        type: "custom",
        message: "Total percentage of all assets must equal 100%",
      });
      return false;
    } else {
      form.clearErrors("root");
    }
    return true;
  },
];
