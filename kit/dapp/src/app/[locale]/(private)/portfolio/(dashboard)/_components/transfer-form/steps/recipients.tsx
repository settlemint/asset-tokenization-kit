import { FormStep } from '@/components/blocks/form/form-step';
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { TransferFormType } from '@/lib/mutations/asset/transfer/transfer-schema';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

export function Recipients() {
  const { control } = useFormContext<TransferFormType>();
  const t = useTranslations("portfolio.transfer-form.recipients");

  return (
    <FormStep title={t("title")} description={t("description")}>
    <div className="space-y-6">
      <div className="space-y-8">
        <div className="mb-2">
          <h2 className="font-semibold text-foreground text-lg">Select Recipient</h2>
          <p className="text-muted-foreground text-sm">Enter a wallet address to send tokens directly.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <FormInput
          control={control}
          name="to"
          label={t("wallet-address-label")}
          placeholder="0x0000000000000000000000000000000000000000"
        />
      </div>
    </div>
    </FormStep>
  );
}

Recipients.validatedFields = ['to'] as const;
