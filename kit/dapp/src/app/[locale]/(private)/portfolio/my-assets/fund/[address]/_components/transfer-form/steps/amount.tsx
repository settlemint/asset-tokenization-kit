import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { TransferFundInput } from "@/lib/mutations/fund/transfer/transfer-schema";
import { formatNumber } from "@/lib/utils/number";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface AmountProps {
  balance: number;
}

export function Amount({ balance }: AmountProps) {
  const { control } = useFormContext<TransferFundInput>();
  const t = useTranslations("portfolio.my-assets.fund.transfer-form.amount");

  return (
    <FormStep title={t("title")} description={t("description")}>
      <div className="grid grid-cols-1 gap-6">
        <FormInput
          control={control}
          name="value"
          label={t("value-label")}
          type="number"
          min={1}
          max={balance}
          description={t("balance-available", {
            balance: formatNumber(balance),
          })}
          required
        />
      </div>
    </FormStep>
  );
}

Amount.validatedFields = ["value"] as const;
