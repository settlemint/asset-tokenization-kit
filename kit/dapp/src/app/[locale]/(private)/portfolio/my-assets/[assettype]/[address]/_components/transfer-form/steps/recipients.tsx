import { FormStep } from '@/components/blocks/form/form-step';
import { FormInput } from '@/components/blocks/form/inputs/form-input';
import { FormUsers } from '@/components/blocks/form/inputs/form-users';
import type { TransferEquityInput } from '@/lib/mutations/equity/transfer/transfer-schema';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

export function Recipients() {
  const { control } = useFormContext<TransferEquityInput>();
  const [isManualEntry, setIsManualEntry] = useState(false);

  const t = useTranslations(
    'portfolio.my-assets.cryptocurrency.transfer-form.recipients'
  );

  return (
    <FormStep title={t('title')} description={t('description')}>
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-1">
          {isManualEntry ? (
            <FormInput
              control={control}
              name="to"
              label={t('address-label')}
              placeholder="0x0000000000000000000000000000000000000000"
            />
          ) : (
            <FormUsers
              control={control}
              name="to"
              label={t('address-label')}
              placeholder={t('address-placeholder')}
            />
          )}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsManualEntry(!isManualEntry)}
              className="text-muted-foreground text-xs transition-colors hover:text-foreground"
            >
              {isManualEntry ? t('search-user-link') : t('manual-entry-link')}
            </button>
          </div>
        </div>
      </div>
    </FormStep>
  );
}

Recipients.validatedFields = ['to'] as const;
