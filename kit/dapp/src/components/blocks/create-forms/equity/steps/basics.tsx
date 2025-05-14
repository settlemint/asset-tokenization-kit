"use client";

import { StepContent } from "@/components/blocks/asset-designer/step-wizard/step-content";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { CreateEquityInput } from "@/lib/mutations/equity/create/create-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Basics() {
  const { control } = useFormContext<CreateEquityInput>();
  const t = useTranslations("private.assets.create");

  return (
    <StepContent>
      <div className="space-y-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium">{t("basics.title")}</h3>
          <p className="text-sm text-muted-foreground mt-2">
            {t("basics.description")}
          </p>
        </div>

        <FormStep
          title={t("basics.title")}
          description={t("basics.description")}
          className="w-full"
          contentClassName="w-full"
        >
          <div className="grid grid-cols-1 gap-6 w-full">
            <FormInput
              control={control}
              name="assetName"
              label={t("parameters.common.name-label")}
              placeholder={t("parameters.equities.name-placeholder")}
              required
              maxLength={50}
            />
            <div className="grid grid-cols-2 gap-6">
              <FormInput
                control={control}
                name="symbol"
                label={t("parameters.common.symbol-label")}
                placeholder={t("parameters.equities.symbol-placeholder")}
                textOnly
                required
                maxLength={10}
              />
              <FormInput
                control={control}
                name="isin"
                label={t("parameters.common.isin-label")}
                placeholder={t("parameters.equities.isin-placeholder")}
              />
            </div>
            <FormInput
              control={control}
              type="number"
              name="decimals"
              label={t("parameters.common.decimals-label")}
              required
            />
          </div>
        </FormStep>
      </div>
    </StepContent>
  );
}

Basics.validatedFields = [
  "assetName",
  "symbol",
  "decimals",
  "isin",
] satisfies (keyof CreateEquityInput)[];

// Export step definition for the asset designer
export const stepDefinition = {
  id: "details",
  title: "basics.title",
  description: "basics.description",
  component: Basics,
};
