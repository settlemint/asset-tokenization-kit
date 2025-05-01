import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { CreateXvpInput } from "@/lib/mutations/xvp/create/create-schema";
import { isValidFutureDate } from "@/lib/utils/date";
import { useTranslations } from "next-intl";
import { useFormContext, type UseFormReturn } from "react-hook-form";

export function Configuration() {
  const t = useTranslations("trade-management.forms.configuration");
  const { control } = useFormContext<CreateXvpInput>();
  return (
    <FormStep
      title={t("title")}
      description={t("description")}
      contentClassName="space-y-6"
    >
      <FormInput
        control={control}
        type="datetime-local"
        name="expiry"
        label={t("expiry")}
        placeholder={t("expiry")}
        description={t("expiry-description")}
        required
      />
    </FormStep>
  );
}

Configuration.validatedFields = ["expiry"] as (keyof CreateXvpInput)[];

const validateExpiry = async (form: UseFormReturn<CreateXvpInput>) => {
  const expiry = form.getValues("expiry");

  if (!expiry) {
    form.setError("expiry", {
      type: "manual",
      message: "trade-management.forms.configuration.expiry-required",
    });

    return false;
  }

  if (!isValidFutureDate(expiry)) {
    form.setError("expiry", {
      type: "manual",
      message: "trade-management.forms.configuration.past-expiry-error",
    });

    return false;
  }

  return true;
};

Configuration.customValidation = [validateExpiry];
