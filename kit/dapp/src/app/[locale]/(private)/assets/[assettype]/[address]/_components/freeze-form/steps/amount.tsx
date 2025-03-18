import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { FreezeInput } from "@/lib/mutations/freeze/freeze-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface AmountProps {
  balance: number;
  frozen: number;
  symbol: string;
}

export function Amount({ balance, frozen, symbol }: AmountProps) {
  const { control } = useFormContext<FreezeInput>();
  const t = useTranslations("private.assets.details.forms.amount");

  return (
    <FormStep title={t("title")} description={t("description.freeze")}>
      <div className="grid grid-cols-1 gap-6">
        <FormInput
          control={control}
          name="amount"
          type="number"
          min={1}
          max={balance}
          required
        />
        {/* description={t("balance-description", {
            balance: formatNumber(balance, { token: symbol }),
            frozen: formatNumber(frozen, { token: symbol }),
          })} */}
      </div>
    </FormStep>
  );
}

Amount.validatedFields = ["amount"] as const;
