import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { CreatePushAirdropInput } from "@/lib/mutations/airdrop/create/push/create-schema";
import { useTranslations } from "next-intl";
import { useFormContext, type UseFormReturn } from "react-hook-form";
import { Distribution as BaseDistribution } from "../../common/distribution";

export function Distribution() {
  const { control } = useFormContext<CreatePushAirdropInput>();
  const t = useTranslations("private.airdrops.create.distribution");

  return (
    <BaseDistribution>
      <div className="mb-6">
        <FormInput
          control={control}
          type="number"
          name="distributionCap"
          label={t("distribution-cap-label")}
          description={t("distribution-cap-description")}
          required
        />
      </div>
    </BaseDistribution>
  );
}

Distribution.validatedFields = [
  "distribution",
  "distributionCap",
] satisfies (keyof CreatePushAirdropInput)[];

/**
 * Custom validation function for distribution cap
 *
 * Note: We use this custom validation approach instead of
 * relying on the schema refinement defined in create-schema.ts because
 * refinement properties don't work reliably with @hookform/typebox resolver.
 * This ensures the validation is properly applied and error messages are displayed.
 */
const validateDistributionCap = async (
  form: UseFormReturn<CreatePushAirdropInput>
) => {
  const distribution = form.getValues("distribution");
  const distributionCap = form.getValues("distributionCap");

  if (!distribution || !distributionCap) {
    return false;
  }

  // Calculate total distribution amount
  const totalAmount = distribution.reduce((sum, item) => {
    const amount = Number(item.amount);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  // Check if total amount exceeds distribution cap
  if (totalAmount > Number(distributionCap)) {
    // Using the translation key directly, which will be resolved by the Form component's
    // error formatting mechanism that automatically handles translations
    form.setError("distributionCap", {
      type: "manual",
      message: "private.airdrops.create.distribution.distribution-cap-error",
    });

    return false;
  }

  return true;
};

Distribution.customValidation = [validateDistributionCap];
export const stepDefinition = {
  id: "distribution",
  title: "distribution.title",
  description: "distribution.description",
  component: Distribution,
} as const;
