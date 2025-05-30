import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormSelect } from "@/components/blocks/form/inputs/form-select";
import type { CreateVestingAirdropInput } from "@/lib/mutations/airdrop/create/vesting/create-schema";
import { isValidFutureDate } from "@/lib/utils/date";
import { timeUnits } from "@/lib/utils/typebox/time-units";
import { useTranslations } from "next-intl";
import { useFormContext, useWatch, type UseFormReturn } from "react-hook-form";

export function Vesting() {
  const { control } = useFormContext<CreateVestingAirdropInput>();
  const t = useTranslations("private.airdrops.create.vesting");

  const cliffDurationValue = useWatch({
    control,
    name: "cliffDuration.value",
  });
  const cliffTimeUnitOptions = timeUnits.map((value) => ({
    value,
    label:
      Number(cliffDurationValue) === 1
        ? t(`time-units.singular.${value}`)
        : t(`time-units.plural.${value}`),
  }));

  const vestingDurationValue = useWatch({
    control,
    name: "vestingDuration.value",
  });
  const vestingTimeUnitOptions = timeUnits.map((value) => ({
    value,
    label:
      Number(vestingDurationValue) === 1
        ? t(`time-units.singular.${value}`)
        : t(`time-units.plural.${value}`),
  }));

  return (
    <FormStep
      title={t("title")}
      description={t("description")}
      contentClassName="space-y-6"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 w-full pt-6">
        <FormInput
          control={control}
          type="datetime-local"
          name="claimPeriodEnd"
          label={t("claim-period-end-label")}
          description={t("claim-period-end-description")}
          required
        />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 w-full">
        <FormInput
          control={control}
          type="number"
          name="cliffDuration.value"
          label={t("cliff-duration-label")}
          description={t("cliff-duration-description")}
          required
          min={0}
          postfix={
            <FormSelect
              name="cliffDuration.unit"
              control={control}
              options={cliffTimeUnitOptions}
              defaultValue="days"
              className="border-l-0 rounded-l-none w-26 shadow-none -mx-3"
            />
          }
        />
        <FormInput
          control={control}
          type="number"
          name="vestingDuration.value"
          label={t("vesting-duration-label")}
          description={t("vesting-duration-description")}
          required
          min={0}
          postfix={
            <FormSelect
              name="vestingDuration.unit"
              control={control}
              options={vestingTimeUnitOptions}
              defaultValue="months"
              className="border-l-0 rounded-l-none w-26 shadow-none -mx-3"
            />
          }
        />
      </div>
    </FormStep>
  );
}

Vesting.validatedFields = [
  "claimPeriodEnd",
  "cliffDuration",
  "vestingDuration",
] satisfies (keyof CreateVestingAirdropInput)[];

/**
 * Custom validation function for claim period end
 *
 * Note: We use this custom validation approach instead of
 * relying on the schema refinement defined in create-schema.ts because
 * refinement properties don't work reliably with @hookform/typebox resolver.
 * This ensures the validation is properly applied and error messages are displayed.
 */
const validateClaimPeriodEnd = async (
  form: UseFormReturn<CreateVestingAirdropInput>
) => {
  const claimPeriodEnd = form.getValues("claimPeriodEnd");
  if (!claimPeriodEnd) {
    return false;
  }

  if (!isValidFutureDate(claimPeriodEnd, 1)) {
    // Using the translation key directly, which will be resolved by the Form component's
    // error formatting mechanism that automatically handles translations
    form.setError("claimPeriodEnd", {
      type: "manual",
      message: "private.airdrops.create.vesting.claim-period-end-error",
    });

    return false;
  }

  return true;
};

Vesting.customValidation = [validateClaimPeriodEnd];
