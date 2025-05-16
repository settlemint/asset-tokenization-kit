"use client";

import type { AssetFormStep } from "@/components/blocks/asset-designer/types";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { StepContent } from "@/components/blocks/step-wizard/step-content";
import type { CreateBondInput } from "@/lib/mutations/bond/create/create-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Basics() {
  const { control } = useFormContext<CreateBondInput>();
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
          title={t("basics.title-onchain")}
          description={t("basics.description-onchain")}
          className="w-full"
          contentClassName="w-full"
        >
          <div className="grid grid-cols-1 gap-6 w-full">
            <div className="grid grid-cols-2 gap-6">
              <FormInput
                control={control}
                name="assetName"
                label={t("parameters.common.name-label")}
                placeholder={t("parameters.bonds.name-placeholder")}
                description="The name of the bond. This is used to identify the bond in the UI and cannot be changed after creation."
                required
                maxLength={50}
              />
              <FormInput
                control={control}
                name="symbol"
                label={t("parameters.common.symbol-label")}
                placeholder={t("parameters.bonds.symbol-placeholder")}
                description={t("parameters.bonds.symbol-description")}
                alphanumeric
                required
                maxLength={10}
              />
            </div>
          </div>
        </FormStep>
        <FormStep
          title={t("basics.title-offchain")}
          description={t("basics.description-offchain")}
          className="w-full"
          contentClassName="w-full"
        >
          <div className="grid grid-cols-1 gap-6 w-full">
            <div className="grid grid-cols-2 gap-6">
              <FormInput
                control={control}
                name="isin"
                label={t("parameters.common.isin-label")}
                placeholder={t("parameters.bonds.isin-placeholder")}
                description="The ISIN of the bond. This is an optional unique identifier for the bond in the financial system."
                maxLength={12}
              />
              <FormInput
                control={control}
                name="internalid"
                label={t("parameters.common.internalid-label")}
                description="The internal ID of the bond. This is an optional unique identifier for the bond in your internal system."
                maxLength={12}
              />
            </div>
          </div>
        </FormStep>
      </div>
    </StepContent>
  );
}

Basics.validatedFields = [
  "assetName",
  "symbol",
  "isin",
] satisfies (keyof CreateBondInput)[];

// Export step definition for the asset designer
export const stepDefinition: AssetFormStep & {
  component: typeof Basics;
} = {
  id: "details",
  title: "basics.title",
  description: "basics.description",
  component: Basics,
};
