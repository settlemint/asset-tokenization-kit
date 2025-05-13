"use client";

import { StepContent } from "@/components/blocks/asset-designer/step-wizard/step-content";
import { FormStep } from "@/components/blocks/form/form-step";
import {
  FormDocumentUpload,
  type UploadedDocument,
} from "@/components/blocks/form/inputs/form-document-upload";
import type { CreateDepositInput } from "@/lib/mutations/deposit/create/create-schema";
import { useFormContext } from "react-hook-form";
import type { DepositStepProps } from "../form";

export function Documents({ onNext, onBack }: DepositStepProps) {
  const { control, formState, trigger } = useFormContext<
    CreateDepositInput & { documents?: UploadedDocument[] }
  >();

  // Fields for this step - used for validation
  const stepFields = ["documents"];

  // Check if there are errors in the current step's fields
  const hasStepErrors = stepFields.some(
    (field) => !!formState.errors[field as keyof typeof formState.errors]
  );

  // Handle next button click - trigger validation before proceeding
  const handleNext = async () => {
    // Trigger validation for just these fields
    const isValid = await trigger(stepFields as any);
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
          <h3 className="text-lg font-medium">Supporting Documents</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Upload supporting documents for this deposit asset
          </p>
        </div>

        <FormStep
          title="Supporting Documents"
          description="Upload supporting documents for this deposit asset"
          className="w-full"
          contentClassName="w-full"
        >
          <div className="w-full">
            <FormDocumentUpload
              name="documents"
              control={control}
              label="Supporting Documents"
              description="Upload supporting documents like terms and conditions, certificates, or other relevant files"
              maxSize={10 * 1024 * 1024} // 10MB
              maxFiles={5}
              documentType="deposit"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
            />
          </div>
        </FormStep>
      </div>
    </StepContent>
  );
}

// This is not actually part of the CreateDepositInput type, would need to be extended
Documents.validatedFields = ["documents"] as any;

// Export step definition for the asset designer
export const stepDefinition = {
  id: "documents",
  title: "Supporting Documents",
  description: "Upload supporting documents for this deposit asset",
  component: Documents,
};
