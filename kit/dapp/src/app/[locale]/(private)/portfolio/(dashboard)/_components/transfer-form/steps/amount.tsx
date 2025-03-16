import { FormStep } from '@/components/blocks/form/form-step';
import { FormInput } from '@/components/blocks/form/inputs/form-input';
import type { TransferFormType } from '@/lib/mutations/asset/transfer/transfer-schema';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

export function Amount({ balance }: { balance: string }) {
  const { control } = useFormContext<TransferFormType>();
  const t = useTranslations('portfolio.transfer-form.amount');

  return (
    <FormStep title={t('title')} description={t('description')}>
      <div className="space-y-8">
        <div className="mb-2">
          <h2 className="font-semibold text-foreground text-lg">
            {t('title')}
          </h2>
          <p className="text-muted-foreground text-sm">{t('description')}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <FormInput
          control={control}
          name="value"
          label={t('amount-label')}
          type="number"
          min={1}
          defaultValue={1}
          max={Number(balance)}
          description={`${t('balance-description')} ${balance}`}
        />
        <FormInput
          control={control}
          name="decimals"
          label={t('decimals-label')}
          type="number"
          min={0}
          defaultValue={18}
          max={18}
          description={`${t('decimals-description')}`}
        />
      </div>
    </FormStep>
  );
}

Amount.validatedFields = ['value'] as const;
