import { StepContent } from "@/components/blocks/asset-designer/step-wizard/step-content";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { CreateStablecoinInput } from "@/lib/mutations/stablecoin/create/create-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import type { StablecoinStepProps } from "../form";

export function Basics({ onNext, onBack }: StablecoinStepProps) {
  const { control, formState, trigger } =
    useFormContext<CreateStablecoinInput>();
  const t = useTranslations("private.assets.create");

  // Fields for this step - used for validation
  const stepFields = ["assetName", "symbol", "decimals"];

  // Check if there are errors in the current step's fields
  const hasStepErrors = stepFields.some(
    (field) => !!formState.errors[field as keyof typeof formState.errors]
  );

  // Handle next button click - trigger validation before proceeding
  const handleNext = async () => {
    // Trigger validation for just these fields
    const isValid = await trigger(
      stepFields as (keyof CreateStablecoinInput)[]
    );
    if (isValid && onNext) {
      onNext();
    }
  };

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
          <div className="grid grid-cols-1 gap-6">
            <FormInput
              control={control}
              name="assetName"
              label={t("parameters.common.name-label")}
              placeholder={t("parameters.stablecoins.name-placeholder")}
              required
              maxLength={50}
            />
            <div className="grid grid-cols-2 gap-6">
              <FormInput
                control={control}
                name="symbol"
                label={t("parameters.common.symbol-label")}
                placeholder={t("parameters.stablecoins.symbol-placeholder")}
                textOnly
                required
                maxLength={10}
              />
            </div>
            <FormInput
              control={control}
              type="number"
              name="decimals"
              label={t("parameters.common.decimals-label")}
              defaultValue={6}
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
] satisfies (keyof CreateStablecoinInput)[];

// Export step definition for the asset designer
export const stepDefinition = {
  id: "details",
  title: "basics.title",
  description: "basics.description",
  component: Basics,
};
