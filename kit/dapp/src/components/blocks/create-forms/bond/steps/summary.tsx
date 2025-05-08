"use client";

import { StepContent } from "@/components/blocks/asset-designer/step-wizard/step-content";
import { FormStep } from "@/components/blocks/form/form-step";
import { useSettings } from "@/hooks/use-settings";
import type { CreateBondInput } from "@/lib/mutations/bond/create/create-schema";
import { isAddressAvailable } from "@/lib/queries/bond-factory/bond-factory-address-available";
import { getPredictedAddress } from "@/lib/queries/bond-factory/bond-factory-predict-address";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext, type UseFormReturn } from "react-hook-form";
import type { BondStepProps } from "../form";

export function Summary({ userDetails, onNext, onBack }: BondStepProps) {
  const { control, formState, getValues, trigger } =
    useFormContext<CreateBondInput>();
  const t = useTranslations("private.assets.create");
  const baseCurrency = useSettings("baseCurrency");
  const locale = useLocale();

  // Fields to review in this step
  const stepFields = ["predictedAddress", "verificationType"];

  // Check for any errors in this step's fields
  const hasStepErrors = stepFields.some(
    (field) => !!formState.errors[field as keyof typeof formState.errors]
  );

  // Values to display in summary
  const values = getValues();

  // Handle next button click - typically submits the form
  const handleNext = async () => {
    // Trigger validation for fields in this step
    const isValid = await trigger(stepFields as (keyof CreateBondInput)[]);
    if (isValid && onNext) {
      onNext();
      // In a real implementation, we would submit the form here
      console.log("Form submission values:", values);
    }
  };

  return (
    <StepContent
      onNext={handleNext}
      onBack={onBack}
      isNextDisabled={hasStepErrors}
      showBackButton={!!onBack}
      nextLabel="Deploy Bond"
    >
      <FormStep
        title={t("summary.title")}
        description={t("summary.description")}
      >
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Bond Details</h3>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-sm">{values.assetName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Symbol</dt>
              <dd className="mt-1 text-sm">{values.symbol}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Decimals</dt>
              <dd className="mt-1 text-sm">{values.decimals}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">ISIN</dt>
              <dd className="mt-1 text-sm">{values.isin || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Cap</dt>
              <dd className="mt-1 text-sm">{values.cap}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Face Value</dt>
              <dd className="mt-1 text-sm">{values.faceValue}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Maturity Date
              </dt>
              <dd className="mt-1 text-sm">
                {new Date(values.maturityDate).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Verification Type
              </dt>
              <dd className="mt-1 text-sm">{values.verificationType}</dd>
            </div>
          </dl>
        </div>
      </FormStep>
    </StepContent>
  );
}

const validatePredictedAddress = async (
  form: UseFormReturn<CreateBondInput>
) => {
  const values = form.getValues();
  const predictedAddress = await getPredictedAddress(values);
  const isAvailable = await isAddressAvailable(predictedAddress);
  if (!isAvailable) {
    form.setError("predictedAddress", {
      message: "private.assets.create.form.duplicate-errors.bond",
    });
    return false;
  }
  form.clearErrors("predictedAddress");
  return true;
};

// For use with form component
Summary.validatedFields = ["verificationType"];
Summary.customValidation = [validatePredictedAddress];

// Export step definition for asset designer
export const stepDefinition = {
  id: "review",
  title: "summary.title",
  description: "summary.description",
  component: Summary,
};
