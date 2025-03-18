import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { BurnInput } from "@/lib/mutations/burn/burn-schema";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";

interface AmountProps {
  maxLimit?: number;
  maxLimitDescription?: string | ReactNode;
}

export function Amount({ maxLimit, maxLimitDescription }: AmountProps) {
  const { control } = useFormContext<BurnInput>();
  const t = useTranslations("private.assets.details.forms.burn.amount");

  return (
    <FormStep title={t("title")} description={t("description")}>
      <div className="grid grid-cols-1 gap-6">
        <FormInput
          control={control}
          name="amount"
          label={t("amount-label")}
          type="number"
          min={1}
          max={maxLimit}
          description={maxLimitDescription}
          required
        />
      </div>
    </FormStep>
  );
}

Amount.validatedFields = ["amount"] as const;
