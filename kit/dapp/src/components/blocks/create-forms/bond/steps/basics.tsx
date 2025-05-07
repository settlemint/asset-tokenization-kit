"use client";

import { StepContent } from "@/components/blocks/asset-designer/step-wizard/step-content";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { CreateBondInput } from "@/lib/mutations/bond/create/create-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface BasicsProps {
  onNext?: () => void;
  onBack?: () => void;
}

export function Basics({ onNext, onBack }: BasicsProps) {
  const { control, formState, trigger } = useFormContext<CreateBondInput>();
  const t = useTranslations("private.assets.create");

  // Fields for this step - used for validation
  const stepFields = ["assetName", "symbol", "decimals", "isin"];

  // We can directly use formState.isValid for the whole form (resolver validates everything)
  // But for a multi-step form, we only want to check the current step's fields
  const hasStepErrors = stepFields.some(
    (field) => !!formState.errors[field as keyof typeof formState.errors]
  );

  // Handle next button click - trigger validation before proceeding
  const handleNext = async () => {
    // Trigger validation for just these fields
    const isValid = await trigger(stepFields as (keyof CreateBondInput)[]);
    if (isValid && onNext) {
      onNext();
    }
  };

  return (
    <StepContent
      onNext={handleNext}
      onBack={onBack}
      isNextDisabled={hasStepErrors}
      showBackButton={!!onBack}
    >
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
                description="The symbol of the bond. This a unique identifier for the bond for onchain purposes. It can be up to 10 characters long and cannot be changed after creation."
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

// Export step definition for the asset designer
export const stepDefinition = {
  id: "details",
  title: "Basic Details",
  description: "Enter basic information about your bond",
  component: Basics,
};
