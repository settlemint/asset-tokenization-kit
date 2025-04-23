import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { CreateDvpSwapInput } from "@/lib/mutations/dvp/create/create-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

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
        name="timelock"
        label={t("timelock")}
        placeholder={t("timelock")}
        description={t("timelock-description")}
        required
        min={1} // Minimum timelock, e.g., 1 minute
        step={1}
      />

      <FormInput
        control={control}
        name="secret"
        label={t("secret")}
        placeholder={t("secret")}
        description={t("secret")}
        required
        type="password"
      />
    </FormStep>
  );
}
