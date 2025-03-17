import { FormStep } from '@/components/blocks/form/form-step';
import { FormInput } from '@/components/blocks/form/inputs/form-input';
import { FormUsers } from '@/components/blocks/form/inputs/form-users';
import type { BlockUserInput } from '@/lib/mutations/block-user/block-user-schema';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

export function Account() {
  const { control } = useFormContext<BlockUserInput>();
  const [isManualEntry, setIsManualEntry] = useState(false);
  const t = useTranslations('private.assets.details.forms.block');

  return (
    <FormStep title={t('account.title')} description={t('account.description')}>
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-1">
          {isManualEntry ? (
            <FormInput
              control={control}
              name="account"
              label={t('account.manual-toggle')}
              placeholder="0x0000000000000000000000000000000000000000"
            />
          ) : (
            <FormUsers
              control={control}
              name="account"
              label={t('account.search-placeholder')}
              placeholder={t('account.search-placeholder')}
            />
          )}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsManualEntry(!isManualEntry)}
              className="text-muted-foreground text-xs transition-colors hover:text-foreground"
            >
              {isManualEntry
                ? t('account.search-toggle')
                : t('account.manual-toggle')}
            </button>
          </div>
        </div>
      </div>
    </FormStep>
  );
}

Account.validatedFields = ['account'] as const;
