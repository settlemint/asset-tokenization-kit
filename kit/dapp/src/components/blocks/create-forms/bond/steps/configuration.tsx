import { FormStep } from "@/components/blocks/form/form-step";
import { FormAssets } from "@/components/blocks/form/inputs/form-assets";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { CreateBondInput } from "@/lib/mutations/bond/create/create-schema";
import { isValidFutureDate } from "@/lib/utils/date";
import { useTranslations } from "next-intl";
import { useFormContext, type UseFormReturn } from "react-hook-form";

export function Configuration() {
  const { control } = useFormContext<CreateBondInput>();
  const t = useTranslations("private.assets.create");

  return (
    <FormStep
      title={t("configuration.bonds.title")}
      description={t("configuration.bonds.description")}
    >
      <div className="grid grid-cols-2 gap-6">
        <FormInput
          control={control}
          name="cap"
          type="number"
          label={t("parameters.bonds.cap-label")}
          description={t("parameters.bonds.cap-description")}
          required
        />
        <FormInput
          control={control}
          name="faceValue"
          type="number"
          label={t("parameters.bonds.face-value-label")}
          description={t("parameters.bonds.face-value-description")}
          required
        />
        <FormInput
          control={control}
          type="datetime-local"
          name="maturityDate"
          label={t("parameters.bonds.maturity-date-label")}
          required
        />
        <FormAssets
          control={control}
          name="underlyingAsset"
          label={t("parameters.bonds.underlying-asset-label")}
          description={t("parameters.bonds.underlying-asset-description")}
          required
        />
      </div>
    </FormStep>
  );
}

/**
 * Custom validation function for maturity date
 *
 * Note: We use this custom validation approach instead of
 * relying on the schema refinement defined in create-schema.ts because
 * refinement properties don't work reliably with @hookform/typebox resolver.
 * This ensures the validation is properly applied and error messages are displayed.
 */
const validateMaturityDate = async (form: UseFormReturn<CreateBondInput>) => {
  const maturityDate = form.getValues("maturityDate");
  if (!maturityDate) {
    return false;
  }

  if (!isValidFutureDate(maturityDate, 1)) {
    // Using the translation key directly, which will be resolved by the Form component's
    // error formatting mechanism that automatically handles translations
    form.setError("maturityDate", {
      type: "manual",
      message: "private.assets.create.parameters.bonds.maturity-date-error",
    });

    return false;
  }

  return true;
};

Configuration.validatedFields = [
  "cap",
  "faceValue",
  "underlyingAsset",
] satisfies (keyof CreateBondInput)[];

// Using customValidation as TypeBox refinement doesn't work well with @hookform/typebox resolver
Configuration.customValidation = [validateMaturityDate];
