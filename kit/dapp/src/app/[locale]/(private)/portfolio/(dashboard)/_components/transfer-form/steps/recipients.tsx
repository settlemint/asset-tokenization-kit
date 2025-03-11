import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { TransferFormType } from "@/lib/mutations/asset/transfer/transfer-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Recipients() {
  const { control } = useFormContext<TransferFormType>();
  const t = useTranslations("portfolio.transfer-form.recipients");

  return (
    <FormStep title={t("title")} description={t("description")}>
      <div className="grid grid-cols-1 gap-6">
        <FormInput
          control={control}
          name="to"
          label={t("wallet-address-label")}
          placeholder="0x0000000000000000000000000000000000000000"
        />
      </div>
    </FormStep>
  );
}

Recipients.validatedFields = ["to"] as const;
