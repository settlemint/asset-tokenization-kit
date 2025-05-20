"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import {
  FormDocumentUpload,
  type UploadedDocument,
} from "@/components/blocks/form/inputs/form-document-upload";
import { StepContent } from "@/components/blocks/step-wizard/step-content";
import { Button } from "@/components/ui/button";
import type { CreateDepositInput } from "@/lib/mutations/deposit/create/create-schema";
import { t } from "@/lib/utils/typebox";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useEffect } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

// Define the type locally since it's not exported from ../form
type DepositStepProps = {
  onNext?: () => void;
  onBack?: () => void;
};

// Create a custom schema that explicitly makes documents optional
const DocumentsSchema = t.Object({
  documents: t.Optional(
    t.Array(
      t.Object({
        id: t.String(),
        name: t.String(),
        url: t.String(),
        size: t.Number(),
        type: t.String(),
        objectName: t.String(),
        uploadedAt: t.String(),
        title: t.Optional(t.String()),
        description: t.Optional(t.String()),
      })
    )
  ),
});

export function Documents({ onNext, onBack }: DepositStepProps) {
  // Get the parent form context
  const parentForm = useFormContext<
    CreateDepositInput & { documents?: UploadedDocument[] }
  >();

  // Create a specialized sub-form that enforces our custom validation rules
  const documentsForm = useForm({
    // Use our custom schema that makes documents optional
    resolver: typeboxResolver(DocumentsSchema),
    // Get values from parent form
    values: parentForm.getValues(),
    // Don't validate on mount
    mode: "onSubmit",
  });

  // Keep the parent form in sync with our sub-form
  useEffect(() => {
    // Initialize with empty array to avoid validation errors
    parentForm.setValue("documents", [], { shouldValidate: false });

    // Clear any existing errors
    parentForm.clearErrors("documents");

    // Sync sub-form changes to parent form
    const subscription = documentsForm.watch((value) => {
      if (value.documents) {
        parentForm.setValue("documents", value.documents as any, {
          shouldValidate: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [parentForm, documentsForm]);

  // Handle next button click - always proceed
  const handleNext = () => {
    if (onNext) {
      onNext();
    }
  };

  return (
    <StepContent>
      <div className="space-y-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium">Supporting Documents</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Upload supporting documents for this deposit asset (optional)
          </p>
        </div>

        {/* Use FormProvider with our custom form that enforces our validation rules */}
        <FormProvider {...documentsForm}>
          <FormStep
            title="Supporting Documents"
            description="Upload supporting documents for this deposit asset (optional)"
            className="w-full"
            contentClassName="w-full"
          >
            <div className="w-full">
              <FormDocumentUpload
                name="documents"
                control={documentsForm.control}
                label="Supporting Documents (Optional)"
                description="Upload supporting documents like terms and conditions, certificates, or other relevant files"
                maxSize={10 * 1024 * 1024} // 10MB
                maxFiles={5}
                documentType="deposit"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
                required={false}
              />
            </div>
          </FormStep>
        </FormProvider>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          {onBack && (
            <Button variant="outline" onClick={onBack} type="button">
              Back
            </Button>
          )}
          <div className={onBack ? "" : "ml-auto"}>
            <Button onClick={handleNext} type="button">
              Next
            </Button>
          </div>
        </div>
      </div>
    </StepContent>
  );
}

// Make documents optional - no validation required
Documents.validatedFields = [] as any;

// Export step definition for the asset designer
export const stepDefinition = {
  id: "documents",
  title: "Supporting Documents",
  description: "Upload supporting documents for this deposit asset (optional)",
  component: Documents,
};
