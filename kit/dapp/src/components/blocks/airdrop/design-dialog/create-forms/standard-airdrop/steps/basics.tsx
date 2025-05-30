import { FormStep } from "@/components/blocks/form/form-step";
import { FormAssets } from "@/components/blocks/form/inputs/form-assets";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormUsers } from "@/components/blocks/form/inputs/form-users";
import type { CreateStandardAirdropInput } from "@/lib/mutations/airdrop/create/standard/create-schema";
import { isValidFutureDate } from "@/lib/utils/date";
import { useTranslations } from "next-intl";
import { useFormContext, type UseFormReturn } from "react-hook-form";

export function Basics() {
  const { control } = useFormContext<CreateStandardAirdropInput>();
  const t = useTranslations("private.airdrops.create.basics");

  return (
    <FormStep
      title={t("title")}
      description={t("description")}
      contentClassName="space-y-6"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 w-full pt-6">
        <FormAssets
          control={control}
          name="asset"
          label={t("asset-label")}
          placeholder={t("asset-placeholder")}
          description={t("asset-description")}
          required
        />
        <FormUsers
          control={control}
          name="owner"
          label={t("owner-label")}
          placeholder={t("owner-placeholder")}
          description={t("owner-description")}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 w-full pt-6">
        <FormInput
          control={control}
          type="datetime-local"
          name="startTime"
          label={t("start-time-label")}
          description={t("start-time-description")}
          required
        />
        <FormInput
          control={control}
          type="datetime-local"
          name="endTime"
          label={t("end-time-label")}
          description={t("end-time-description")}
          required
        />
      </div>
    </FormStep>
  );
}

Basics.validatedFields = [
  "asset",
  "owner",
  "startTime",
  "endTime",
] satisfies (keyof CreateStandardAirdropInput)[];

/**
 * Custom validation function for start time
 *
 * Note: We use this custom validation approach instead of
 * relying on the schema refinement defined in create-schema.ts because
 * refinement properties don't work reliably with @hookform/typebox resolver.
 * This ensures the validation is properly applied and error messages are displayed.
 */
const validateStartTime = async (
  form: UseFormReturn<CreateStandardAirdropInput>
) => {
  const startTime = form.getValues("startTime");
  if (!startTime) {
    return false;
  }

  if (!isValidFutureDate(startTime, 1)) {
    // Using the translation key directly, which will be resolved by the Form component's
    // error formatting mechanism that automatically handles translations
    form.setError("startTime", {
      type: "manual",
      message: "private.airdrops.create.basics.start-time-error",
    });

    return false;
  }

  return true;
};

/**
 * Custom validation function for end time
 *
 * Note: We use this custom validation approach instead of
 * relying on the schema refinement defined in create-schema.ts because
 * refinement properties don't work reliably with @hookform/typebox resolver.
 * This ensures the validation is properly applied and error messages are displayed.
 */
const validateEndTime = async (
  form: UseFormReturn<CreateStandardAirdropInput>
) => {
  const startTime = form.getValues("startTime");
  const endTime = form.getValues("endTime");

  if (!endTime || !startTime) {
    return false;
  }

  // Check if end time is at least 1 hour after start time
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  const oneHourInMs = 60 * 60 * 1000; // 1 hour in milliseconds

  if (endDate.getTime() - startDate.getTime() < oneHourInMs) {
    // Using the translation key directly, which will be resolved by the Form component's
    // error formatting mechanism that automatically handles translations
    form.setError("endTime", {
      type: "manual",
      message: "private.airdrops.create.basics.end-time-error",
    });

    return false;
  }

  return true;
};

Basics.customValidation = [validateStartTime, validateEndTime];
