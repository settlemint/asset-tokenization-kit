import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { CreateDvpSwapInput } from "@/lib/mutations/dvp/create/create-schema";
import { isValidFutureDate } from "@/lib/utils/date";
import { useTranslations } from "next-intl";
import { useFormContext, type UseFormReturn } from "react-hook-form";

export function Configuration() {
  const t = useTranslations("trade-management.forms.configuration");
  const { control } = useFormContext<CreateDvpSwapInput>();
  return (
    <FormStep
      title={t("title")}
      description={t("description")}
      contentClassName="space-y-6"
    >
      <FormInput
        control={control}
        type="datetime-local"
        name="timelock"
        label={t("timelock")}
        placeholder={t("timelock")}
        description={t("timelock-description")}
        required
      />

      <FormInput
        control={control}
        name="secret"
        label={t("secret")}
        placeholder={t("secret")}
        description={t("secret-description")}
        required
        type="password"
      />
    </FormStep>
  );
}

Configuration.validatedFields = [
  "timelock",
  "secret",
] as (keyof CreateDvpSwapInput)[];

const validateTimelock = async (form: UseFormReturn<CreateDvpSwapInput>) => {
  const timelock = form.getValues("timelock");

  if (!timelock) {
    return false;
  }

  if (!isValidFutureDate(timelock)) {
    form.setError("timelock", {
      type: "manual",
      message: "trade-management.forms.configuration.timelock-error",
    });

    return false;
  }

  return true;
};

Configuration.customValidation = [validateTimelock];
